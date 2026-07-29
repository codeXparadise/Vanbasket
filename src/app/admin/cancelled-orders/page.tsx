"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Loader2,
  Check,
  AlertCircle,
  Eye,
  Search,
  CreditCard,
  Tag,
  ArrowLeft,
  RefreshCw,
  Ban,
  Lock,
  ShieldCheck,
  Star,
  Calendar,
  User as UserIcon,
  MapPin,
  Download
} from "lucide-react";

interface OrderItem {
  id: string;
  product_name_snapshot: string;
  variant_label_snapshot: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

interface Payment {
  id: string;
  gateway: string;
  gateway_payment_id?: string | null;
  gateway_order_id?: string | null;
  amount: number;
  status: string;
  method?: string | null;
  raw_webhook_payload?: any;
}

interface Address {
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
}

interface Profile {
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

interface Review {
  rating: number;
  title?: string | null;
  comment?: string | null;
}

interface CancelledOrder {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  total_amount: number;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  coupon_code: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile | null;
  addresses?: Address | null;
  order_items: OrderItem[];
  payments: Payment[];
  reviews?: Review[] | Review | null;
}

export default function CancelledOrdersPage() {
  const [supabase] = useState(() => createClient());
  const [orders, setOrders] = useState<CancelledOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<CancelledOrder | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fetchCancelledOrders = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles(full_name, email, phone),
          order_items(*),
          payments(*),
          addresses:shipping_address_id(*)
        `)
        .in("status", ["cancelled", "refunded", "failed", "CANCELLED", "REFUNDED"])
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Safely attempt to fetch reviews without crashing if relationship is not yet cached
      let reviewsMap: Record<string, Review[]> = {};
      try {
        const { data: reviewsData } = await supabase
          .from("product_reviews")
          .select("user_id, rating, title, comment");

        if (reviewsData) {
          reviewsData.forEach((rev: any) => {
            if (rev.user_id) {
              if (!reviewsMap[rev.user_id]) reviewsMap[rev.user_id] = [];
              reviewsMap[rev.user_id].push(rev);
            }
          });
        }
      } catch (revErr) {
        console.warn("Could not load product_reviews metadata:", revErr);
      }

      const mapped = (data || []).map((o: any) => ({
        ...o,
        profiles: Array.isArray(o.profiles) ? o.profiles[0] || null : o.profiles || null,
        addresses: Array.isArray(o.addresses) ? o.addresses[0] || null : o.addresses || null,
        order_items: o.order_items || [],
        payments: o.payments || [],
        reviews: o.user_id ? reviewsMap[o.user_id] || null : null,
      }));

      setOrders(mapped);
    } catch (err: any) {
      console.error("Error fetching cancelled orders:", err);
      setFeedback({ type: "error", msg: err.message || "Failed to load cancelled orders registry." });
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCancelledOrders();
  }, [fetchCancelledOrders]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return orders;

    return orders.filter((o) => {
      const itemsMatch = o.order_items.some(
        (item) =>
          item.product_name_snapshot.toLowerCase().includes(q) ||
          item.variant_label_snapshot.toLowerCase().includes(q)
      );

      const addrStr = o.addresses
        ? `${o.addresses.line1} ${o.addresses.city} ${o.addresses.state}`.toLowerCase()
        : "";

      const payment = o.payments?.[0];
      const refundId = payment?.raw_webhook_payload?.refund_id || "";
      const reason = payment?.raw_webhook_payload?.reason || "";

      return (
        o.order_number.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        (o.profiles?.full_name?.toLowerCase().includes(q) || false) ||
        (o.profiles?.email?.toLowerCase().includes(q) || false) ||
        (o.profiles?.phone?.includes(q) || false) ||
        o.status.toLowerCase().includes(q) ||
        addrStr.includes(q) ||
        refundId.toLowerCase().includes(q) ||
        reason.toLowerCase().includes(q) ||
        itemsMatch
      );
    });
  }, [orders, searchQuery]);

  // Financial Stats
  const totalCancelledCount = orders.length;
  const totalRefundedAmount = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const onlineRefunds = orders.filter((o) =>
    o.payments?.some((p) => p.gateway === "razorpay") || o.status === "refunded"
  );
  const codCancellations = orders.filter((o) =>
    o.payments?.some((p) => p.gateway === "cod") || o.status === "cancelled"
  );

  const exportCSV = () => {
    if (!filteredOrders.length) return;
    const headers = [
      "Order Number",
      "Placed Date",
      "Cancelled Date",
      "Customer Name",
      "Email",
      "Phone",
      "Canceled Total (INR)",
      "Payment Gateway",
      "Refund Status",
      "Refund ID",
      "Cancellation Reason",
      "Cart Manifest"
    ];

    const rows = filteredOrders.map((o) => {
      const payment = o.payments?.[0];
      const refundId = payment?.raw_webhook_payload?.refund_id || "N/A";
      const reason = payment?.raw_webhook_payload?.reason || "Customer cancelled from dashboard";
      const manifest = o.order_items
        .map((i) => `${i.product_name_snapshot} (${i.variant_label_snapshot}) x${i.quantity}`)
        .join(" | ");

      return [
        `"${o.order_number}"`,
        `"${new Date(o.created_at).toLocaleString()}"`,
        `"${new Date(o.updated_at).toLocaleString()}"`,
        `"${o.profiles?.full_name || "Guest"}"`,
        `"${o.profiles?.email || ""}"`,
        `"${o.profiles?.phone || ""}"`,
        `"-${Number(o.total_amount).toFixed(2)}"`,
        `"${payment?.gateway || "Online/COD"}"`,
        `"${o.status}"`,
        `"${refundId}"`,
        `"${reason}"`,
        `"${manifest}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cancelled_orders_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-brand-espresso/60 font-bold">
          Loading canceled orders audit registry...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-scale-in">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-brand-cream-dark/45 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-red-100 text-red-700 font-bold">
              <Ban className="w-5 h-5" />
            </span>
            <h1 className="text-3xl font-sans font-semibold tracking-tight text-brand-espresso">
              Canceled Orders Registry
            </h1>
          </div>
          <p className="text-xs text-brand-espresso/60 mt-1.5 leading-relaxed max-w-2xl">
            Dedicated accounting & audit panel for customer-canceled and Razorpay-refunded orders. All statuses here are permanently locked to preserve financial compliance and stock inventory balance.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={fetchCancelledOrders}
            className="p-2.5 bg-brand-cream-warm border border-brand-cream-dark text-brand-espresso hover:bg-brand-cream-light rounded-xl transition cursor-pointer"
            title="Reload registry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={exportCSV}
            className="h-11 px-5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shrink-0 flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Audit CSV
          </button>

          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-espresso/45">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search order no, customer, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-brand-cream-dark bg-white focus:border-red-500 focus:outline-none text-xs font-semibold text-brand-espresso"
            />
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-start gap-3 rounded-xl p-4 text-xs border ${
            feedback.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <p className="font-semibold">{feedback.msg}</p>
        </div>
      )}

      {/* Numerical Metrics Summary Widgets */}
      <div className="grid gap-5 md:grid-cols-3 font-sans">
        <div className="rounded-[28px] border border-red-200 bg-red-50/70 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-red-800">Total Canceled Value</p>
            <div className="rounded-2xl bg-red-100 p-3 text-red-700">
              <Ban className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold font-sans tracking-tight text-red-700">
            -₹{totalRefundedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-red-800/80 mt-1 font-light">{totalCancelledCount} Total Canceled Orders</p>
        </div>

        <div className="rounded-[28px] border border-sky-200 bg-sky-50/70 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-sky-800">Razorpay Online Refunds</p>
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold font-sans tracking-tight text-sky-900">
            {onlineRefunds.length} Orders
          </p>
          <p className="text-[11px] text-sky-800/80 mt-1 font-light">
            -₹{onlineRefunds.reduce((sum, o) => sum + Number(o.total_amount || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })} Direct Bank Refunds
          </p>
        </div>

        <div className="rounded-[28px] border border-amber-200 bg-amber-50/70 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-amber-800">COD Cancellations</p>
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold font-sans tracking-tight text-amber-900">
            {codCancellations.length} Orders
          </p>
          <p className="text-[11px] text-amber-800/80 mt-1 font-light">
            Stock quantities restored to warehouse
          </p>
        </div>
      </div>

      {/* Tabular Canceled Orders Table */}
      <div className="bg-white border border-brand-cream-dark/50 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px] font-sans">
            <thead>
              <tr className="bg-red-50/60 border-b border-red-200 text-red-900 font-bold uppercase tracking-wider">
                <th className="p-4 font-semibold">Order No</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Canceled Date</th>
                <th className="p-4 font-semibold">Gateway / Refund</th>
                <th className="p-4 font-semibold">Reason</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Refund Value</th>
                <th className="p-4 font-semibold text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-cream-light font-medium text-brand-espresso">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-brand-espresso/45 font-medium">
                    No canceled orders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o, idx) => {
                  const payment = o.payments?.[0];
                  const refundId = payment?.raw_webhook_payload?.refund_id || "N/A";
                  const reason = payment?.raw_webhook_payload?.reason || "Customer cancelled from profile dashboard";
                  const isOnlineRefund = payment?.gateway === "razorpay" || o.status === "refunded";

                  return (
                    <tr
                      key={o.id ? `canc-row-${o.id}-${idx}` : `canc-row-${idx}`}
                      className="hover:bg-red-50/40 transition-colors bg-red-50/20 border-l-4 border-l-red-500 cursor-pointer"
                      onClick={() => setSelectedOrder(o)}
                    >
                      <td className="p-4 font-mono font-bold select-all text-red-950">
                        {o.order_number}
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-brand-espresso truncate max-w-[140px]">
                          {o.profiles?.full_name || "Guest Client"}
                        </p>
                        <p className="text-[10px] text-brand-espresso/50 truncate max-w-[140px]">
                          {o.profiles?.email || "No email"}
                        </p>
                      </td>

                      <td className="p-4 text-brand-espresso/70 font-mono text-[10px]">
                        {new Date(o.updated_at || o.created_at).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short"
                        })}
                      </td>

                      <td className="p-4">
                        {isOnlineRefund ? (
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 rounded-md text-[9px] uppercase font-black tracking-wider bg-sky-100 text-sky-900 border border-sky-300 inline-block">
                              Razorpay Online
                            </span>
                            {refundId !== "N/A" && (
                              <p className="text-[9px] font-mono text-emerald-800 font-bold">
                                ID: {refundId}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-wider bg-amber-100 text-amber-900 border border-amber-300 inline-block">
                            COD / Unpaid
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-brand-espresso/80 text-[10px] max-w-[180px] truncate" title={reason}>
                        {reason}
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-300 shadow-2xs select-none">
                          <Lock className="w-3 h-3 text-red-600" />
                          {o.status}
                        </span>
                      </td>

                      <td className="p-4 font-extrabold text-red-600 text-xs">
                        -₹{Number(o.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition cursor-pointer"
                          title="View detailed cancellation audit"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Cancellation Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-espresso/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-brand-cream-dark space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-brand-cream-light pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-brand-espresso">Cancellation Audit Details</h3>
                  <p className="text-[11px] font-mono text-brand-espresso-muted">Order: {selectedOrder.order_number}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-brand-cream-warm hover:bg-brand-cream-dark/40 text-brand-espresso text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Audit Status Banner */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-1.5 text-xs text-red-950">
              <div className="flex items-center gap-2 font-extrabold text-red-900">
                <ShieldCheck className="w-4.5 h-4.5 text-red-600" />
                <span>Status: {selectedOrder.status.toUpperCase()} (Permanently Locked)</span>
              </div>
              <p className="text-[11px] text-red-900/80 font-light leading-relaxed">
                Order placed on {new Date(selectedOrder.created_at).toLocaleString()} and cancelled on {new Date(selectedOrder.updated_at).toLocaleString()}. Inventory stock quantities were automatically restored.
              </p>
            </div>

            {/* Customer & Address Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-brand-cream-light/30 border border-brand-cream-dark/50 rounded-2xl space-y-2 text-xs">
                <h4 className="font-extrabold uppercase tracking-wider text-brand-espresso/70 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-brand-honey" /> Customer Profile
                </h4>
                <div className="space-y-1 text-[11px]">
                  <p className="font-bold text-brand-espresso">{selectedOrder.profiles?.full_name || "Guest Client"}</p>
                  <p className="text-brand-espresso/70">{selectedOrder.profiles?.email || "No Email"}</p>
                  <p className="text-brand-espresso/70">{selectedOrder.profiles?.phone || "No Phone"}</p>
                </div>
              </div>

              {selectedOrder.addresses && (
                <div className="p-4 bg-brand-cream-light/30 border border-brand-cream-dark/50 rounded-2xl space-y-2 text-xs">
                  <h4 className="font-extrabold uppercase tracking-wider text-brand-espresso/70 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-honey" /> Shipping Address
                  </h4>
                  <div className="text-[11px] leading-relaxed text-brand-espresso">
                    <p className="font-semibold">{selectedOrder.addresses.line1}</p>
                    {selectedOrder.addresses.line2 && <p>{selectedOrder.addresses.line2}</p>}
                    <p>{selectedOrder.addresses.city}, {selectedOrder.addresses.state} - {selectedOrder.addresses.postal_code}</p>
                    <p className="text-brand-espresso/60 font-mono mt-0.5">Phone: {selectedOrder.addresses.phone}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Cancellation Reason & Refund Metadata */}
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2 text-xs text-amber-950">
              <h4 className="font-extrabold uppercase tracking-wider text-amber-900">
                Cancellation Reason & Payment Gateway Log
              </h4>
              <div className="text-[11px] space-y-1.5 leading-relaxed font-light">
                <p>
                  <strong>Reason Provided:</strong>{" "}
                  <span className="font-semibold text-amber-950">
                    {selectedOrder.payments?.[0]?.raw_webhook_payload?.reason || "Customer cancelled order from profile dashboard"}
                  </span>
                </p>
                {selectedOrder.payments?.[0]?.raw_webhook_payload?.refund_id && (
                  <p>
                    <strong>Razorpay Refund ID:</strong>{" "}
                    <span className="font-mono font-bold text-emerald-800">
                      {selectedOrder.payments[0].raw_webhook_payload.refund_id}
                    </span>
                  </p>
                )}
                {selectedOrder.payments?.[0]?.gateway_payment_id && (
                  <p>
                    <strong>Original Payment Txn ID:</strong>{" "}
                    <span className="font-mono text-amber-900">
                      {selectedOrder.payments[0].gateway_payment_id}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Cancelled Cart Manifest Items */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-espresso/70">
                Cancelled Cart Manifest ({selectedOrder.order_items.length} items)
              </h4>
              <div className="divide-y divide-brand-cream-light border-y border-brand-cream-light max-h-48 overflow-y-auto pr-1">
                {selectedOrder.order_items.map((item, itemIdx) => (
                  <div key={item.id ? `mod-item-${item.id}-${itemIdx}` : `mod-item-${itemIdx}`} className="py-2.5 flex justify-between items-start text-[11px]">
                    <div>
                      <p className="font-bold text-brand-espresso">{item.product_name_snapshot}</p>
                      <p className="text-[10px] text-brand-espresso/60">{item.variant_label_snapshot}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brand-espresso">
                        ₹{item.unit_price} x {item.quantity}
                      </p>
                      <p className="text-[10px] text-red-600 font-bold">
                        -₹{item.line_total}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="flex justify-between items-center text-sm font-bold text-brand-espresso border-t border-brand-cream-light pt-3 font-sans">
              <span>Total Canceled Refund:</span>
              <span className="text-red-600 font-extrabold text-base">
                -₹{Number(selectedOrder.total_amount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
