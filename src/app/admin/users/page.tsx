"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAdminState } from "@/context/AdminContext";
import {
  Loader2,
  Search,
  Phone,
  Clock,
  Inbox,
  ChevronRight,
  ShoppingBag,
  MapPin,
  Mail,
  Users as UsersIcon,
  TrendingUp,
  UserCheck,
  Award,
  Calendar,
  DollarSign,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { AdminUser, OrderItem } from "@/context/AdminContext";

export default function AdminUsersPage() {
  const { users, addresses, orders, loadingUsers, isUsersLoaded, fetchUsers, fetchOrders } = useAdminState();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "vip" | "recent">("all");

  useEffect(() => {
    fetchUsers();
    fetchOrders();
  }, [fetchUsers, fetchOrders]);

  // Calculations for Customer Analytics & Behavior Tracking
  const stats = useMemo(() => {
    const totalUsers = users.length;

    // Filter non-admin customers
    const customerProfiles = users.filter((u) => u.role !== "admin");

    // Orders linked to users
    const ordersByUserMap = new Map<string, typeof orders>();
    orders.forEach((o) => {
      if (o.user_id) {
        const existing = ordersByUserMap.get(o.user_id) || [];
        ordersByUserMap.set(o.user_id, [...existing, o]);
      }
    });

    // Active buyers (at least 1 order)
    const activeBuyers = customerProfiles.filter((u) => {
      const uOrders = ordersByUserMap.get(u.id) || [];
      return uOrders.length > 0;
    });

    // Repeat buyers (> 1 order)
    const repeatBuyers = customerProfiles.filter((u) => {
      const uOrders = ordersByUserMap.get(u.id) || [];
      return uOrders.length > 1;
    });

    // Recent signups (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentSignups = customerProfiles.filter((u) => new Date(u.created_at) >= thirtyDaysAgo);

    // High value / VIP (Spent > 1000 or 2+ orders)
    const vipCustomers = customerProfiles.filter((u) => {
      const uOrders = ordersByUserMap.get(u.id) || [];
      const totalSpent = uOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      return totalSpent >= 1000 || uOrders.length >= 2;
    });

    // Calculate Lifetime Value & Total Revenue from registered customers
    let totalCustomerRevenue = 0;
    orders.forEach((o) => {
      totalCustomerRevenue += Number(o.total_amount || 0);
    });

    const avgLTV = activeBuyers.length > 0 ? totalCustomerRevenue / activeBuyers.length : 0;
    const repeatRate = activeBuyers.length > 0 ? (repeatBuyers.length / activeBuyers.length) * 100 : 0;

    return {
      totalUsers,
      activeBuyersCount: activeBuyers.length,
      recentSignupsCount: recentSignups.length,
      vipCount: vipCustomers.length,
      repeatRate: repeatRate.toFixed(1),
      avgLTV: avgLTV.toFixed(2),
      totalCustomerRevenue: totalCustomerRevenue.toFixed(2),
      ordersByUserMap,
    };
  }, [users, orders]);

  // Tab Filtering & Search Filtering logic
  const filteredUsers = useMemo(() => {
    let list = users.filter((u) => u.role !== "admin");

    const query = searchQuery.toLowerCase().trim();

    // 1. Filter by Tab
    if (activeTab === "active") {
      list = list.filter((u) => (stats.ordersByUserMap.get(u.id) || []).length > 0);
    } else if (activeTab === "vip") {
      list = list.filter((u) => {
        const uOrders = stats.ordersByUserMap.get(u.id) || [];
        const spent = uOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        return spent >= 1000 || uOrders.length >= 2;
      });
    } else if (activeTab === "recent") {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      list = list.filter((u) => new Date(u.created_at) >= thirtyDaysAgo);
    }

    // 2. Search Query Filtering (Name, Email, Phone, City, State)
    if (query) {
      list = list.filter((u) => {
        const userAddrs = addresses.filter((a) => a.user_id === u.id);
        const addressMatch = userAddrs.some(
          (a) =>
            a.line1.toLowerCase().includes(query) ||
            a.city.toLowerCase().includes(query) ||
            a.state.toLowerCase().includes(query) ||
            a.postal_code.includes(query)
        );

        return (
          (u.full_name?.toLowerCase().includes(query) || false) ||
          (u.email?.toLowerCase().includes(query) || false) ||
          (u.phone?.includes(query) || false) ||
          addressMatch
        );
      });
    }

    return list;
  }, [users, addresses, searchQuery, activeTab, stats.ordersByUserMap]);

  if (loadingUsers && !isUsersLoaded) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-honey animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-brand-espresso/60 font-bold">
          Loading Customer Directory & Behavior Analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-scale-in font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-brand-cream-dark/45 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-sans font-semibold tracking-tight text-brand-espresso">User & Customer Directory</h1>
            <span className="bg-brand-honey/15 text-brand-honey text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-brand-honey/30">
              Live Behavior Monitor
            </span>
          </div>
          <p className="text-xs text-brand-espresso/60 mt-1">
            Track user registrations, monitor active buyer activity, check verified phone records, and inspect purchase behaviors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchUsers(true);
              fetchOrders(true);
            }}
            className="h-11 px-4 bg-white border border-brand-cream-dark text-brand-espresso text-xs font-bold rounded-xl hover:bg-brand-cream-light transition flex items-center gap-2"
            title="Refresh User Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-espresso/45">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search name, email, phone, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-brand-cream-dark bg-white focus:border-brand-honey focus:outline-none text-xs font-semibold text-brand-espresso shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Behavioral Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Registered Customers */}
        <div className="bg-white border border-brand-cream-dark/50 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-brand-espresso/60">
            <span className="text-[10px] uppercase tracking-wider font-bold">Total Customers</span>
            <UsersIcon className="w-4 h-4 text-brand-honey" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-brand-espresso">{stats.totalUsers}</span>
            <span className="text-[10px] text-green-600 font-bold">+{stats.recentSignupsCount} (30d)</span>
          </div>
          <p className="text-[10px] text-brand-espresso/50">Registered user accounts in system</p>
        </div>

        {/* Card 2: Active Buyers */}
        <div className="bg-white border border-brand-cream-dark/50 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-brand-espresso/60">
            <span className="text-[10px] uppercase tracking-wider font-bold">Active Buyers</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-brand-espresso">{stats.activeBuyersCount}</span>
            <span className="text-[10px] text-brand-espresso/60 font-semibold">
              ({stats.totalUsers > 0 ? ((stats.activeBuyersCount / stats.totalUsers) * 100).toFixed(0) : 0}% converted)
            </span>
          </div>
          <p className="text-[10px] text-brand-espresso/50">Users with 1+ completed orders</p>
        </div>

        {/* Card 3: Repeat Customer Rate */}
        <div className="bg-white border border-brand-cream-dark/50 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-brand-espresso/60">
            <span className="text-[10px] uppercase tracking-wider font-bold">Repeat Purchase Rate</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-brand-espresso">{stats.repeatRate}%</span>
            <span className="text-[10px] text-brand-honey font-bold">Loyalty metric</span>
          </div>
          <p className="text-[10px] text-brand-espresso/50">Buyers who ordered multiple times</p>
        </div>

        {/* Card 4: Avg Customer LTV */}
        <div className="bg-white border border-brand-cream-dark/50 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-brand-espresso/60">
            <span className="text-[10px] uppercase tracking-wider font-bold">Avg Customer LTV</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-brand-espresso">₹{stats.avgLTV}</span>
            <span className="text-[10px] text-brand-espresso/50">per buyer</span>
          </div>
          <p className="text-[10px] text-brand-espresso/50">Lifetime value per active buyer</p>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-brand-cream-dark/40 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            activeTab === "all"
              ? "bg-brand-espresso text-white shadow-sm"
              : "bg-white text-brand-espresso/70 hover:bg-brand-cream-light border border-brand-cream-dark/40"
          }`}
        >
          All Customers ({users.filter((u) => u.role !== "admin").length})
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            activeTab === "active"
              ? "bg-brand-espresso text-white shadow-sm"
              : "bg-white text-brand-espresso/70 hover:bg-brand-cream-light border border-brand-cream-dark/40"
          }`}
        >
          Active Buyers ({stats.activeBuyersCount})
        </button>
        <button
          onClick={() => setActiveTab("vip")}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            activeTab === "vip"
              ? "bg-brand-espresso text-white shadow-sm"
              : "bg-white text-brand-espresso/70 hover:bg-brand-cream-light border border-brand-cream-dark/40"
          }`}
        >
          VIP / High Value ({stats.vipCount})
        </button>
        <button
          onClick={() => setActiveTab("recent")}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            activeTab === "recent"
              ? "bg-brand-espresso text-white shadow-sm"
              : "bg-white text-brand-espresso/70 hover:bg-brand-cream-light border border-brand-cream-dark/40"
          }`}
        >
          New Signups ({stats.recentSignupsCount})
        </button>
      </div>

      {/* Grid View: Left User List Stack, Right User Behavior Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* User Stack List */}
        <div className="lg:col-span-7 bg-white border border-brand-cream-dark/50 rounded-3xl overflow-hidden shadow-sm divide-y divide-brand-cream-light">
          {filteredUsers.map((user) => {
            const userOrders = stats.ordersByUserMap.get(user.id) || orders.filter((o) => o.profiles?.email === user.email);
            const totalSpent = userOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
            const isSelected = selectedUser?.id === user.id;

            return (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-5 flex items-center justify-between gap-4 hover:bg-brand-cream-light/40 transition cursor-pointer ${
                  isSelected ? "bg-brand-cream-light/60 border-l-4 border-brand-honey" : ""
                }`}
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif font-bold text-sm text-brand-espresso truncate">
                      {user.full_name || "Guest / Unnamed Collector"}
                    </h3>
                    {user.phone ? (
                      <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Phone Recorded
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                        Phone Missing
                      </span>
                    )}
                    {totalSpent >= 1000 && (
                      <span className="text-[9px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
                        <Award className="w-3 h-3" /> VIP
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-brand-espresso/60 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-brand-honey" /> {user.email}
                    </span>
                    {user.phone && (
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-brand-honey" /> {user.phone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right shrink-0">
                  <div className="text-right space-y-0.5">
                    <p className="text-xs font-bold text-brand-espresso">₹{totalSpent.toFixed(2)}</p>
                    <p className="text-[10px] text-brand-espresso/60 font-semibold">{userOrders.length} order(s)</p>
                    <p className="text-[9px] text-brand-espresso/45">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-brand-espresso/40" />
                </div>
              </div>
            );
          })}

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-brand-espresso/45 italic font-bold">
              No matching customer accounts found under selected criteria.
            </div>
          )}
        </div>

        {/* Customer Behavior & Detail Inspector Panel */}
        <div className="lg:col-span-5 space-y-6 sticky top-6">
          {selectedUser ? (
            (() => {
              const userAddrs = addresses.filter((addr) => addr.user_id === selectedUser.id);
              const userOrders = stats.ordersByUserMap.get(selectedUser.id) || orders.filter((o) => o.profiles?.email === selectedUser.email);
              const totalSpent = userOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
              const avgOrderVal = userOrders.length > 0 ? totalSpent / userOrders.length : 0;

              return (
                <div className="bg-white border border-brand-cream-dark/50 rounded-3xl p-6 shadow-md space-y-6 animate-scale-in">
                  {/* Panel Header */}
                  <div className="pb-5 border-b border-brand-cream-light space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-brand-honey">Customer Behavior Register</span>
                      <span className="text-[10px] bg-brand-cream-warm px-2 py-0.5 rounded font-mono text-brand-espresso/60">
                        {selectedUser.role}
                      </span>
                    </div>
                    <h2 className="text-2xl font-serif text-brand-espresso font-bold">
                      {selectedUser.full_name || "Guest Collector"}
                    </h2>
                    <p className="text-[10px] font-mono text-brand-espresso/45 truncate">ID: {selectedUser.id}</p>
                  </div>

                  {/* Customer Quick Stats grid */}
                  <div className="grid grid-cols-3 gap-2 bg-brand-cream-light/35 border border-brand-cream-dark/40 rounded-2xl p-3 text-center">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-brand-espresso/50 block">Total Spend</span>
                      <span className="text-sm font-serif font-bold text-brand-espresso">₹{totalSpent.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-brand-espresso/50 block">Orders</span>
                      <span className="text-sm font-serif font-bold text-brand-espresso">{userOrders.length}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-brand-espresso/50 block">Avg Value</span>
                      <span className="text-sm font-serif font-bold text-brand-espresso">₹{avgOrderVal.toFixed(0)}</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-brand-honey shrink-0" />
                      <span className="font-semibold text-brand-espresso">{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-brand-honey shrink-0" />
                      {selectedUser.phone ? (
                        <span className="font-semibold text-brand-espresso font-mono">{selectedUser.phone}</span>
                      ) : (
                        <span className="text-amber-600 italic">No phone record linked</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-brand-espresso/60">
                      <Calendar className="w-4 h-4 text-brand-honey shrink-0" />
                      <span>Account Created: {new Date(selectedUser.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-brand-espresso/60">
                      <Clock className="w-4 h-4 text-brand-honey shrink-0" />
                      <span>
                        Last Signed In:{" "}
                        {selectedUser.last_sign_in_at
                          ? new Date(selectedUser.last_sign_in_at).toLocaleString()
                          : "Unknown / Legacy Account"}
                      </span>
                    </div>
                  </div>

                  {/* Saved Delivery Addresses */}
                  <div className="space-y-3 pt-3 border-t border-brand-cream-light">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-espresso/70 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-honey" /> Registered Addresses ({userAddrs.length})
                    </h4>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {userAddrs.map((addr) => (
                        <div
                          key={addr.id}
                          className="text-xs leading-relaxed border border-brand-cream-dark/45 p-3 rounded-2xl bg-brand-cream-light/35"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-brand-honey uppercase tracking-wider text-[9px] bg-brand-cream-warm px-2 py-0.5 rounded">
                              {addr.label || "Home"}
                            </span>
                            <span className="text-[10px] text-brand-espresso/50 font-mono">Ph: {addr.phone}</span>
                          </div>
                          <p className="text-brand-espresso text-xs font-medium">
                            {addr.line1}, {addr.line2 ? `${addr.line2}, ` : ""}
                            {addr.city}, {addr.state} - {addr.postal_code}
                          </p>
                        </div>
                      ))}
                      {userAddrs.length === 0 && (
                        <p className="text-xs italic text-brand-espresso/40">No saved address entries recorded yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Order Activity & Behavior History */}
                  <div className="space-y-3 pt-4 border-t border-brand-cream-light">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-espresso/70 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-brand-honey" /> Purchase Timeline ({userOrders.length})
                    </h4>
                    <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                      {userOrders.map((o) => (
                        <div key={o.id} className="border border-brand-cream-dark/50 rounded-2xl p-3 bg-[#fcfaf7] space-y-2">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-brand-espresso font-mono">{o.order_number}</span>
                            <span className="font-mono text-[9px] text-brand-espresso/50">{new Date(o.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="space-y-1">
                            {o.order_items?.map((item: OrderItem, idx: number) => (
                              <div key={idx} className="flex justify-between items-center text-[11px] text-brand-espresso/80">
                                <span className="truncate max-w-[200px]">{item.product_name_snapshot} ({item.variant_label_snapshot || "250g"})</span>
                                <span className="font-semibold text-[10px]">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-end pt-1 border-t border-brand-cream-dark/20">
                            <span className={`text-[8px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                              o.status === "paid" || o.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : o.status === "pending"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {o.status}
                            </span>
                            <span className="text-xs font-bold text-brand-espresso">₹{Number(o.total_amount).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                      {userOrders.length === 0 && (
                        <p className="text-xs italic text-brand-espresso/40">No orders logged for this customer yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="bg-brand-cream-warm/30 border border-dashed border-brand-cream-dark rounded-3xl p-8 text-center text-brand-espresso/45 italic font-medium flex flex-col items-center justify-center min-h-[360px]">
              <Inbox className="w-8 h-8 text-brand-cream-dark/80 mb-2" />
              <span>Select any customer profile to view complete behavior and order activity registers</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
