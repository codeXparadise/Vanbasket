"use client";

import React, { useState, useEffect } from "react";
import { useAdminState } from "@/context/AdminContext";
import { Loader2, Search, Phone, Clock, Inbox, ChevronRight, ShoppingBag, MapPin, Mail } from "lucide-react";
import { AdminUser, OrderItem } from "@/context/AdminContext";

export default function AdminUsersPage() {
  const { users, addresses, orders, loadingUsers, isUsersLoaded, fetchUsers, fetchOrders } = useAdminState();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchOrders();
  }, [fetchUsers, fetchOrders]);

  // Handle Search Filtering (Filters by Name, Email, Phone, Address details)
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

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

  if (loadingUsers && !isUsersLoaded) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-honey animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-brand-espresso/60 font-bold">
          Loading directory...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-scale-in font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-brand-cream-dark/45 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-brand-espresso font-semibold">Customers Directory</h1>
          <p className="text-xs text-brand-espresso/60 mt-1">
            Browse registered clients, check phone records, delivery addresses, and last sign-in timestamps.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-espresso/45">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name, email, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-brand-cream-dark bg-white focus:border-brand-honey focus:outline-none text-xs font-semibold text-brand-espresso"
          />
        </div>
      </div>

      {/* Grid view containing stack list and interactive details side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Users List Stack (Compact list) */}
        <div className="lg:col-span-7 bg-white border border-brand-cream-dark/50 rounded-3xl overflow-hidden shadow-sm divide-y divide-brand-cream-light">
          {filteredUsers.map((user) => {
            const userOrders = orders.filter((o) => o.user_id === user.id || o.profiles?.email === user.email);
            return (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-5 flex items-center justify-between gap-4 hover:bg-brand-cream-light/30 transition cursor-pointer ${
                  selectedUser?.id === user.id ? "bg-brand-cream-light/45" : ""
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-sm text-brand-espresso">
                      {user.full_name || "Guest Collector"}
                    </h3>
                    <span className="text-[8px] font-bold uppercase tracking-wider bg-brand-cream-warm text-brand-espresso/60 px-2 py-0.5 rounded border border-brand-cream-dark/40">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-brand-espresso/60 font-sans">{user.email}</p>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div className="text-[10px] text-brand-espresso-muted">
                    <p className="font-semibold">{userOrders.length} orders logged</p>
                    <p className="text-[9px] mt-0.5">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-brand-espresso/40" />
                </div>
              </div>
            );
          })}

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-brand-espresso/45 italic font-bold">
              No matching customer accounts found.
            </div>
          )}
        </div>

        {/* User Profile + Order History Details (Interactive Panel) */}
        <div className="lg:col-span-5 space-y-6">
          {selectedUser ? (
            (() => {
              const userAddrs = addresses.filter((addr) => addr.user_id === selectedUser.id);
              const userOrders = orders.filter((o) => o.user_id === selectedUser.id || o.profiles?.email === selectedUser.email);
              return (
                <div className="bg-white border border-brand-cream-dark/50 rounded-3xl p-6 shadow-sm space-y-6 animate-scale-in">
                  {/* User Profile Header details */}
                  <div className="pb-5 border-b border-brand-cream-light">
                    <h2 className="text-xl font-serif text-brand-espresso font-bold">
                      {selectedUser.full_name || "Guest Collector"}
                    </h2>
                    <p className="text-xs text-brand-espresso-muted mt-1">UUID: {selectedUser.id}</p>
                  </div>

                  {/* Profile info list */}
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-brand-honey" />
                      <span className="font-semibold">{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-brand-honey" />
                      <span>{selectedUser.phone || "No phone linked"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-brand-espresso/60">
                      <Clock className="w-4 h-4 text-brand-honey" />
                      <span>Last active: {selectedUser.last_sign_in_at ? new Date(selectedUser.last_sign_in_at).toLocaleString() : "Never"}</span>
                    </div>
                  </div>

                  {/* Addresses Stack */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-espresso/70 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-honey" /> Saved Addresses ({userAddrs.length})
                    </h4>
                    <div className="space-y-2">
                      {userAddrs.map((addr) => (
                        <div key={addr.id} className="text-xs leading-relaxed border border-brand-cream-dark/45 p-3 rounded-2xl bg-brand-cream-light/35">
                          <span className="font-bold text-brand-honey uppercase tracking-wider text-[8px] bg-brand-cream-warm px-1.5 py-0.5 rounded mr-1.5">
                            {addr.label}
                          </span>
                          {addr.line1}, {addr.line2 ? `${addr.line2}, ` : ""}{addr.city}, {addr.state} ({addr.postal_code})
                          <p className="mt-1.5 text-[10px] text-brand-espresso/50">Ph: {addr.phone}</p>
                        </div>
                      ))}
                      {userAddrs.length === 0 && (
                        <p className="text-xs italic text-brand-espresso/40">No saved address entries.</p>
                      )}
                    </div>
                  </div>

                  {/* Order log history stack */}
                  <div className="space-y-3 pt-4 border-t border-brand-cream-light">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-espresso/70 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-brand-honey" /> Purchase History ({userOrders.length})
                    </h4>
                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                      {userOrders.map((o) => (
                        <div key={o.id} className="border border-brand-cream-dark/50 rounded-2xl p-3 bg-[#fcfaf7] space-y-2">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-semibold text-brand-espresso">{o.order_number}</span>
                            <span className="font-mono text-[9px] text-brand-espresso/50">{new Date(o.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="text-[10px] text-brand-espresso-muted">
                              {o.order_items?.map((item: OrderItem) => `${item.product_name_snapshot} (${item.variant_label_snapshot || "250g"}) x${item.quantity}`).join(", ")}
                            </div>
                            <div className="text-right shrink-0 ml-4">
                              <span className="text-xs font-bold text-brand-espresso block">₹{Number(o.total_amount).toFixed(2)}</span>
                              <span className="text-[8px] uppercase tracking-wider text-brand-honey font-bold">{o.status}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {userOrders.length === 0 && (
                        <p className="text-xs italic text-brand-espresso/40">No purchases checked out yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })()
          ) : (
            <div className="bg-brand-cream-warm/30 border border-dashed border-brand-cream-dark rounded-3xl p-8 text-center text-brand-espresso/45 italic font-medium flex flex-col items-center justify-center min-h-[300px]">
              <Inbox className="w-8 h-8 text-brand-cream-dark/80 mb-2" />
              <span>Select a customer to inspect detail log registers</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
