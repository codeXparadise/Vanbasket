"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAdminState, Order } from "@/context/AdminContext";
import { Loader2, Check, AlertCircle, Eye, Search, CreditCard, Tag, ArrowLeft, RefreshCw } from "lucide-react";

// [FIXED] - Add Cash on Delivery (COD) Payment Option
const ORDER_STATUS_OPTIONS = ["pending", "pending_cod", "cod_pending", "paid", "failed", "shipped", "delivered", "cancelled", "refunded"];

export default function AdminOrdersPage() {
  const [supabase] = useState(() => createClient());
  const { orders, loadingOrders, isOrdersLoaded, fetchOrders, setOrders } = useAdminState();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Searching query state
  const [searchQuery, setSearchQuery] = useState("");

  // Selected Order Detail
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Read/unread orders tracking state
  const [readOrderIds, setReadOrderIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const readIds = JSON.parse(localStorage.getItem("admin_read_orders") || "[]");
      setReadOrderIds(readIds);
    } catch {}
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!selectedOrder) return;
    const refreshed = orders.find((order) => order.id === selectedOrder.id);
    if (refreshed && refreshed !== selectedOrder) setSelectedOrder(refreshed);
  }, [orders, selectedOrder]);

  // Listen to realtime custom event dispatched by layout to immediately populate new orders
  useEffect(() => {
    const handleNewOrder = (event: Event) => {
      const newOrder = (event as CustomEvent).detail;
      
      const fetchNewOrderDetails = async () => {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            profiles(full_name, email, phone),
            order_items(*),
            payments(*),
            addresses:shipping_address_id(*)
          `)
          .eq("id", newOrder.id)
          .maybeSingle();

        if (!error && data) {
          const mapped = {
            ...data,
            profiles: Array.isArray(data.profiles) ? data.profiles[0] || null : data.profiles || null,
            addresses: Array.isArray(data.addresses) ? data.addresses[0] || null : data.addresses || null,
          };
          setOrders((prev) => {
            if (prev.some(o => o.id === mapped.id)) return prev;
            return [mapped, ...prev];
          });
        }
      };

      fetchNewOrderDetails();
    };

    window.addEventListener("new-order-received", handleNewOrder);
    return () => window.removeEventListener("new-order-received", handleNewOrder);
  }, [supabase, setOrders]);

  const handleStatusChange = async (orderId: string, orderNumber: string, newStatus: string) => {
    setFeedback(null);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      // Log activity to local audit logs
      try {
        await fetch("/api/admin/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "ORDER_STATUS_UPDATE",
            admin: "Admin Partner",
            details: `Updated order ${orderNumber} status to "${newStatus}"`,
          }),
        });
      } catch (logErr) {
        console.error("Failed to log activity:", logErr);
      }

      setFeedback({ type: "success", msg: `Order ${orderNumber} status updated to "${newStatus}"` });
    } catch (err: unknown) {
      const error = err as Error;
      setFeedback({ type: "error", msg: error.message || "Failed to update order status" });
    }
  };

  const markAsRead = (orderId: string) => {
    setReadOrderIds((prev) => {
      if (prev.includes(orderId)) return prev;
      const next = [...prev, orderId];
      localStorage.setItem("admin_read_orders", JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("order-marked-read"));
      return next;
    });
  };

  const markAllAsRead = () => {
    const allIds = orders.map((o) => o.id);
    localStorage.setItem("admin_read_orders", JSON.stringify(allIds));
    setReadOrderIds(allIds);
    window.dispatchEvent(new CustomEvent("order-marked-read"));
    setFeedback({ type: "success", msg: "All orders marked as read successfully." });
  };

  const selectOrder = (order: Order) => {
    setSelectedOrder(order);
    markAsRead(order.id);
  };

  const filteredOrders = orders.filter((o) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const itemsMatch = o.order_items.some((item) =>
      item.product_name_snapshot.toLowerCase().includes(query) ||
      item.variant_label_snapshot.toLowerCase().includes(query)
    );

    const addr = o.addresses;
    const addressStr = addr
      ? `${addr.line1} ${addr.city} ${addr.state} ${addr.postal_code}`.toLowerCase()
      : "";

    const payment = o.payments?.[0];
    const txId = payment?.gateway_payment_id || "";
    const payMethod = payment?.payment_method || "";

    return (
      o.order_number.toLowerCase().includes(query) ||
      o.id.toLowerCase().includes(query) ||
      (o.user_id?.toLowerCase().includes(query) || false) ||
      (o.profiles?.full_name?.toLowerCase().includes(query) || false) ||
      (o.profiles?.email?.toLowerCase().includes(query) || false) ||
      (o.profiles?.phone?.includes(query) || false) ||
      (o.coupon_code?.toLowerCase().includes(query) || false) ||
      addressStr.includes(query) ||
      txId.toLowerCase().includes(query) ||
      payMethod.toLowerCase().includes(query) ||
      itemsMatch
    );
  });

  if (loadingOrders && !isOrdersLoaded) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-honey animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-brand-espresso/60 font-bold">
          Loading order registry...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-brand-cream-dark/45 pb-6">
        <div>
          <h1 className="text-3xl font-sans font-semibold tracking-tight text-brand-espresso">Orders Registry</h1>
          <p className="text-xs text-brand-espresso/60 mt-1">
            Spreadsheet-style view of all customer orders. Click any order row to show full detailed summary.
          </p>
        </div>

        {/* Searching & Action block */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => fetchOrders()}
            className="p-2.5 bg-brand-cream-warm border border-brand-cream-dark text-brand-espresso hover:bg-brand-cream-light rounded-xl transition cursor-pointer"
            title="Reload database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {readOrderIds.length < orders.length && (
            <button
              onClick={markAllAsRead}
              className="h-11 px-4 bg-brand-cream-warm border border-brand-cream-dark text-brand-espresso hover:bg-brand-cream-light font-bold text-xs uppercase tracking-wider rounded-xl transition shrink-0 cursor-pointer"
            >
              Mark All Read
            </button>
          )}

          <button
            onClick={() => {
              if (!filteredOrders.length) return;
              const headers = ["Order Number", "Date", "Customer Name", "Email", "Phone", "Payment Method", "Total Amount", "Status", "Coupon"];
              const rows = filteredOrders.map((o) => {
                const isCod = o.status === "pending_cod" || o.status === "cod_pending" || o.payments?.some((p) => p.gateway === "cod" || p.method === "Cash on Delivery");
                return [
                  `"${o.order_number || o.id}"`,
                  `"${new Date(o.created_at).toLocaleDateString()}"`,
                  `"${o.profiles?.full_name || "Guest"}"`,
                  `"${o.profiles?.email || ""}"`,
                  `"${o.profiles?.phone || ""}"`,
                  `"${isCod ? "Cash on Delivery (COD)" : "Online Payment"}"`,
                  `"${Number(o.total_amount).toFixed(2)}"`,
                  `"${o.status}"`,
                  `"${o.coupon_code || ""}"`,
                ];
              });
              const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `orders_export_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="h-11 px-4 bg-brand-espresso text-white hover:bg-brand-espresso/90 font-bold text-xs uppercase tracking-wider rounded-xl transition shrink-0 flex items-center gap-2 cursor-pointer"
          >
            Export CSV
          </button>
          
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-espresso/45">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by ID, name, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-brand-cream-dark bg-white focus:border-brand-honey focus:outline-none text-xs font-semibold text-brand-espresso"
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

      {/* Main Split Layout: Excel Table on Left, Details Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: spreadsheet list of orders */}
        <div className={`bg-white border border-brand-cream-dark/50 rounded-3xl overflow-hidden shadow-sm transition-all duration-300 ${
          selectedOrder ? "lg:col-span-6 xl:col-span-7" : "lg:col-span-12"
        } ${selectedOrder ? "hidden lg:block" : "block"}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px] font-sans">
              <thead>
                <tr className="bg-brand-cream-light/30 border-b border-brand-cream-dark/30 text-brand-espresso/60 font-bold uppercase tracking-wider">
                  <th className="p-3.5 font-semibold">Order No</th>
                  <th className="p-3.5 font-semibold">Customer</th>
                  <th className="p-3.5 font-semibold">Date</th>
                  <th className="p-3.5 font-semibold">Payment</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 font-semibold">Total</th>
                  <th className="p-3.5 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-cream-light font-medium text-brand-espresso">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-brand-espresso/45">
                      No matching transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => {
                    const isUnread = !readOrderIds.includes(o.id);
                    const isSelected = selectedOrder?.id === o.id;
                    const isCod = o.status === "pending_cod" || o.status === "cod_pending" || o.payments?.some((p) => p.gateway === "cod" || p.method === "Cash on Delivery");
                    return (
                      <tr
                        key={o.id}
                        onClick={() => selectOrder(o)}
                        className={`hover:bg-brand-cream-light/10 transition-colors cursor-pointer ${
                          isUnread ? "bg-amber-50/40 font-bold border-l-4 border-l-brand-honey" : ""
                        } ${isSelected ? "bg-brand-cream-warm/25 font-bold" : ""}`}
                      >
                        <td className="p-3.5 font-mono select-all">{o.order_number}</td>
                        <td className="p-3.5 font-bold truncate max-w-[120px]">
                          {o.profiles?.full_name || "Guest Client"}
                        </td>
                        <td className="p-3.5 text-brand-espresso/65">
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] uppercase font-extrabold tracking-wider border ${
                            isCod ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-blue-100 text-blue-900 border-blue-300"
                          }`}>
                            {isCod ? "COD" : "Online"}
                          </span>
                        </td>
                        <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={o.status}
                            onChange={(e) => handleStatusChange(o.id, o.order_number, e.target.value)}
                            className="bg-brand-cream-light/40 border border-brand-cream-dark/60 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-espresso focus:outline-none focus:border-brand-honey"
                          >
                            {ORDER_STATUS_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3.5 font-bold">
                          ₹{o.total_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => selectOrder(o)}
                            className="p-1 text-brand-honey hover:text-brand-honey-dark transition cursor-pointer"
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

        {/* Right Side / Mobile detail pane: Detailed Order panel */}
        {selectedOrder && (
          <div className="bg-white border border-brand-cream-dark/50 rounded-3xl p-6 shadow-md lg:col-span-6 xl:col-span-5 space-y-6">
            {/* Header / Back button */}
            <div className="flex items-center justify-between pb-4 border-b border-brand-cream-light">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex items-center gap-1.5 text-xs text-brand-espresso/60 hover:text-brand-espresso font-bold transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Registry
              </button>

              <span className="text-[10px] font-mono text-brand-espresso/50 select-all">
                ID: {selectedOrder.id}
              </span>
            </div>

            {/* Order Brief */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-brand-espresso/45 font-bold">Order Number</p>
                <p className="text-sm font-mono font-bold text-brand-espresso select-all mt-0.5">
                  {selectedOrder.order_number}
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-brand-espresso/45 font-bold">Order Status</p>
                <div className="mt-1">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, selectedOrder.order_number, e.target.value)}
                    className="bg-brand-cream-warm border border-brand-cream-dark rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-espresso focus:outline-none"
                  >
                    {ORDER_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="p-4 bg-brand-cream-light/20 rounded-2xl border border-brand-cream-light space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-extrabold text-brand-espresso/70">
                Customer Details
              </h4>
              <div className="text-[11px] space-y-1">
                <p className="font-bold text-brand-espresso">
                  {selectedOrder.profiles?.full_name || "Guest Client"}
                </p>
                <p className="text-brand-espresso/70">{selectedOrder.profiles?.email || "No Email Registered"}</p>
                <p className="text-brand-espresso/70">{selectedOrder.profiles?.phone || "No Phone Registered"}</p>
              </div>
            </div>

            {/* Shipping Destination */}
            {selectedOrder.addresses ? (
              <div className="space-y-1 text-xs">
                <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-brand-espresso/50">
                  Shipping Destination
                </h4>
                <div className="text-[11px] leading-relaxed text-brand-espresso">
                  <p className="font-semibold">{selectedOrder.addresses.line1}</p>
                  {selectedOrder.addresses.line2 && <p>{selectedOrder.addresses.line2}</p>}
                  <p>
                    {selectedOrder.addresses.city}, {selectedOrder.addresses.state} - {selectedOrder.addresses.postal_code}
                  </p>
                  <p className="text-brand-espresso/60 mt-1 font-mono">Phone: {selectedOrder.addresses.phone}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-red-500 font-bold">Shipping address details missing or corrupted.</p>
            )}

            {/* Order Items */}
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-brand-espresso/50">
                Cart Manifest ({selectedOrder.order_items.length} items)
              </h4>
              <div className="divide-y divide-brand-cream-light border-y border-brand-cream-light max-h-48 overflow-y-auto pr-1">
                {selectedOrder.order_items.map((item) => (
                  <div key={item.id} className="py-2.5 flex justify-between items-start text-[11px]">
                    <div className="min-w-0 pr-4">
                      <p className="font-bold text-brand-espresso truncate">{item.product_name_snapshot}</p>
                      <p className="text-[10px] text-brand-espresso/50 mt-0.5">{item.variant_label_snapshot}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-brand-espresso">
                        ₹{item.unit_price} x {item.quantity}
                      </p>
                      <p className="text-[10px] text-brand-espresso/60 font-semibold mt-0.5">
                        ₹{item.line_total}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-1.5 text-xs border-b border-brand-cream-light pb-4">
              <div className="flex justify-between">
                <span className="text-brand-espresso/60">Subtotal:</span>
                <span className="font-bold">₹{(selectedOrder.subtotal ?? 0).toFixed(2)}</span>
              </div>
              {(selectedOrder.discount_amount ?? 0) > 0 && (
                <div className="flex justify-between text-brand-honey font-bold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Coupon Discount ({selectedOrder.coupon_code}):
                  </span>
                  <span>-₹{(selectedOrder.discount_amount ?? 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-brand-espresso/60">Shipping Fee:</span>
                <span className="font-bold">₹{(selectedOrder.shipping_fee ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-sans font-bold text-brand-espresso border-t border-brand-cream-light pt-2">
                <span>Grand Total:</span>
                <span>₹{selectedOrder.total_amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="space-y-3 text-xs">
              <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-brand-espresso/50">
                Payment Details
              </h4>
              {selectedOrder.payments && selectedOrder.payments.length > 0 ? (
                selectedOrder.payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-brand-cream-light/30 border border-brand-cream-light rounded-xl space-y-1 text-[11px]"
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span className="flex items-center gap-1 uppercase tracking-wider">
                        <CreditCard className="w-3.5 h-3.5 text-brand-honey" /> {p.gateway}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                          p.status === "captured" || p.status === "success" || p.status === "AUTHORIZED"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    {p.gateway_payment_id && (
                      <p className="text-[10px] text-brand-espresso/60 truncate font-mono mt-1">
                        Txn ID: {p.gateway_payment_id}
                      </p>
                    )}
                    {p.payment_method && (
                      <p className="text-[10px] text-brand-espresso/60">Method: {p.payment_method}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-brand-espresso/45 font-bold italic">
                  No payment attempts logged for this order.
                </p>
              )}

              {/* [FIXED] - Mark COD order as paid manually */}
              {(selectedOrder.status === "pending_cod" || selectedOrder.status === "cod_pending" || selectedOrder.payments?.some((p) => p.gateway === "cod")) && selectedOrder.status !== "paid" && (
                <button
                  onClick={() => handleStatusChange(selectedOrder.id, selectedOrder.order_number, "paid")}
                  className="w-full h-10 mt-2 bg-brand-forest text-white font-sans font-bold uppercase tracking-wider text-[10px] rounded-xl hover:bg-brand-forest/90 transition shadow-sm cursor-pointer"
                >
                  Mark COD Order as Paid
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
