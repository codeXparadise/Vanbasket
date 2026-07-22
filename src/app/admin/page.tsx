"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAdminState } from "@/context/AdminContext";
import {
  ArrowUpRight,
  CreditCard,
  IndianRupee,
  Loader2,
  PackageCheck,
  Sparkles,
  Users,
  Filter,
} from "lucide-react";

type FilterPeriod = "all" | "daily" | "weekly" | "monthly";

export default function AdminDashboard() {
  const {
    recentOrders,
    recentPayments,
    recentProducts,
    loadingDashboard,
    isDashboardLoaded,
    fetchDashboardData,
    orders, // Includes all orders fetched in fetchDashboardData
  } = useAdminState();

  const [period, setPeriod] = useState<FilterPeriod>("all");

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Filter orders based on the selected period
  const filteredStats = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        revenue: 0,
        uniqueCustomers: 0,
        paymentsCount: 0,
        periodLabel: "All Time",
        productSales: {} as Record<string, number>,
      };
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const relevantOrders = orders.filter((o) => {
      const orderDate = new Date(o.created_at);
      if (period === "daily") return orderDate >= startOfToday;
      if (period === "weekly") return orderDate >= startOfWeek;
      if (period === "monthly") return orderDate >= startOfMonth;
      return true;
    });

    const paidOrders = relevantOrders.filter((o) =>
      ["paid", "shipped", "delivered", "PAID", "PAYMENT_SUCCESS"].includes(o.status)
    );

    const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const uniqueCustomers = new Set(relevantOrders.map((o) => o.user_id).filter(Boolean)).size;
    const paymentsCount = paidOrders.length;

    // Calculate product sales distribution
    const productSales: Record<string, number> = {};
    paidOrders.forEach((o) => {
      o.order_items?.forEach((item) => {
        const key = item.product_name_snapshot || "Wild Honey";
        productSales[key] = (productSales[key] || 0) + (item.quantity || 1);
      });
    });

    const periodLabel =
      period === "daily"
        ? "Today"
        : period === "weekly"
        ? "Last 7 Days"
        : period === "monthly"
        ? "This Month"
        : "All Time";

    return {
      revenue,
      uniqueCustomers,
      paymentsCount,
      periodLabel,
      productSales,
    };
  }, [orders, period]);

  // Product sales chart variables
  const chartData = useMemo(() => {
    const sales = filteredStats.productSales;
    const items = Object.entries(sales);
    if (!items.length) {
      return [
        { name: "Raw Wildflower Honey", count: 0 },
        { name: "Jamun Pulp", count: 0 },
      ];
    }
    return items.map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [filteredStats]);

  const maxSalesCount = useMemo(() => {
    const counts = chartData.map((d) => d.count);
    return counts.length > 0 ? Math.max(...counts, 1) : 1;
  }, [chartData]);

  if (loadingDashboard && !isDashboardLoaded) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#b88746] mb-4" />
        <p className="text-xs uppercase tracking-[0.28em] text-[#6f655d] font-semibold">Loading command center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-[#2d241d] font-sans">
      {/* Welcome Banner */}
      <section className="rounded-[32px] border border-[#ddd5ca] bg-[radial-gradient(circle_at_top_left,#fffdf9_0%,#f3ece2_55%,#efe5d8_100%)] p-7 shadow-[0_25px_60px_rgba(45,36,29,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-[#9d742f]">
              <Sparkles className="w-3 h-3" />
              Admin Command Center
            </span>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">One dashboard for catalog, orders, and sales pulse</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6f655d] font-light">
                Filter sales records instantly, view live metrics, and audit user inquiries with a clean administrative interface.
              </p>
            </div>
          </div>

          {/* Timeframe Filter Options */}
          <div className="rounded-[24px] border border-white/70 bg-white/70 p-2.5 backdrop-blur flex items-center gap-1.5 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-[#8a7864] ml-2" />
            <div className="flex gap-1">
              {(["all", "daily", "weekly", "monthly"] as FilterPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition ${
                    period === p
                      ? "bg-brand-espresso text-white"
                      : "text-brand-espresso/60 hover:text-brand-espresso hover:bg-[#f3ece2]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Numerical Stats Widgets */}
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: `Revenue (${filteredStats.periodLabel})`, value: `Rs. ${filteredStats.revenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, icon: IndianRupee },
          { label: "Live Products", value: String(recentProducts.length), icon: PackageCheck },
          { label: "Customers Sourced", value: String(filteredStats.uniqueCustomers), icon: Users },
          { label: "Razorpay checkouts", value: String(filteredStats.paymentsCount), icon: CreditCard },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-[28px] border border-[#e1d9cf] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#8a7864]">{item.label}</p>
                <div className="rounded-2xl bg-[#f7efe4] p-3 text-[#9d742f]">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-5 text-2xl font-semibold tracking-tight">{item.value}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        {/* Graphical Product Sales Distribution */}
        <div className="lg:col-span-8 rounded-[28px] border border-[#e1d9cf] bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold">Product Sales Tracking</h2>
            <p className="mt-1 text-sm text-[#6f655d]">Units sold by product variants in the active filter period ({filteredStats.periodLabel}).</p>
            
            {/* Visual Bar Chart */}
            <div className="mt-8 space-y-6">
              {chartData.map((item) => {
                const percentage = (item.count / maxSalesCount) * 100;
                return (
                  <div key={item.name} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-brand-espresso">{item.name}</span>
                      <span className="text-brand-honey font-bold">{item.count} units</span>
                    </div>
                    <div className="h-3 w-full bg-brand-cream-light border border-brand-cream-dark/50 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className="h-full bg-gradient-to-r from-brand-honey to-[#d98b00] rounded-full transition-all duration-700 ease-out"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-brand-cream-light text-[10px] text-brand-espresso/50 flex justify-between font-mono">
            <span>Filter: {filteredStats.periodLabel.toUpperCase()}</span>
            <span>Total Checked items: {Object.values(filteredStats.productSales).reduce((a, b) => a + b, 0)} units</span>
          </div>
        </div>

        {/* Live Catalog status panel */}
        <div className="lg:col-span-4 rounded-[28px] border border-[#e1d9cf] bg-white p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Catalog Pulse</h2>
            <p className="mt-1 text-sm text-[#6f655d]">Quick view of live products currently visible on store front.</p>
          </div>
          <div className="space-y-3">
            {recentProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-[20px] border border-[#efe7dd] bg-[#fcfaf7] px-4 py-3">
                <div className="max-w-[70%]">
                  <p className="text-xs font-bold text-brand-espresso truncate">{product.name}</p>
                  <p className="text-[10px] text-[#7e7063] mt-0.5">{product.is_active ? "Visible" : "Hidden"}</p>
                </div>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-600"}`}>
                  {product.is_active ? "Live" : "Draft"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Orders List */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-[#e1d9cf] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recent Checkouts</h2>
              <p className="mt-1 text-sm text-[#6f655d]">Latest order state mapping.</p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-[#9d742f]" />
          </div>
          <div className="mt-6 space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="rounded-[22px] border border-[#efe7dd] bg-[#fcfaf7] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{order.order_number}</p>
                    <p className="mt-1 text-xs text-[#7e7063]">{order.profiles?.full_name || order.profiles?.email || "Guest customer"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">Rs. {Number(order.total_amount).toFixed(2)}</p>
                    <span className="mt-1 inline-flex rounded-full bg-[#f4ebdf] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a6732]">
                      {order.status}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-[#7e7063]">
                  {order.order_items.map((item) => `${item.product_name_snapshot} (${item.variant_label_snapshot}) x${item.quantity}`).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Razorpay Payments Activity */}
        <div className="rounded-[28px] border border-[#e1d9cf] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Razorpay Transactions</h2>
          <p className="mt-1 text-sm text-[#6f655d]">Live transactions logs.</p>
          <div className="mt-5 space-y-3">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="rounded-[20px] border border-[#efe7dd] bg-[#fcfaf7] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{payment.orders?.order_number || payment.gateway_order_id || "Pending order"}</p>
                    <p className="mt-1 text-xs text-[#7e7063]">
                      Gateway: {payment.gateway} {payment.method ? `• ${payment.method}` : ""}
                    </p>
                  </div>
                  <span className="inline-flex rounded-full bg-[#f4ebdf] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a6732]">
                    {payment.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#7e7063]">
                  <span>Amount: Rs. {Number(payment.amount).toFixed(2)}</span>
                  <span>Payment ID: {payment.gateway_payment_id || "Awaiting capture"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
