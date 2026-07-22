"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAdminState } from "@/context/AdminContext";
import { Loader2, Plus, Trash2, Check, AlertCircle, Calendar } from "lucide-react";

export default function AdminCouponsPage() {
  const [supabase] = useState(() => createClient());
  const { coupons, loadingCoupons, isCouponsLoaded, fetchCoupons, setCoupons } = useAdminState();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // New Coupon Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "",
    expires_at: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon code?")) return;
    setFeedback(null);

    try {
      const { error } = await supabase
        .from("coupons")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      setFeedback({ type: "success", msg: "Coupon code deleted successfully" });
      fetchCoupons(true);
    } catch (err: unknown) {
      const error = err as Error;
      setFeedback({ type: "error", msg: error.message || "Failed to delete coupon" });
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) return;

    setIsSaving(true);
    setFeedback(null);

    try {
      const payload = {
        code: newCoupon.code.trim().toUpperCase(),
        discount_type: newCoupon.discount_type,
        discount_value: parseFloat(newCoupon.discount_value) || 0,
        min_order_amount: parseFloat(newCoupon.min_order_amount) || 0,
        expires_at: newCoupon.expires_at ? new Date(newCoupon.expires_at).toISOString() : null,
      };

      const { error } = await supabase
        .from("coupons")
        .insert(payload);

      if (error) throw error;

      setFeedback({ type: "success", msg: `Coupon "${payload.code}" created successfully` });
      setIsModalOpen(false);
      setNewCoupon({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        min_order_amount: "",
        expires_at: "",
      });
      fetchCoupons(true);
    } catch (err: unknown) {
      const error = err as Error;
      setFeedback({ type: "error", msg: error.message || "Failed to create coupon code" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingCoupons && !isCouponsLoaded) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-honey animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-brand-espresso/60 font-bold">
          Loading promotional portal...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-brand-cream-dark/45 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-brand-espresso font-semibold">Coupon Management</h1>
          <p className="text-xs text-brand-espresso/60 mt-1">
            Configure promotional marketing discount vouchers and checkouts reductions rules.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-11 px-6 bg-brand-espresso hover:bg-brand-espresso/90 text-brand-cream-light font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {feedback && (
        <div
          className={`flex items-start gap-3 rounded-xl p-4 text-xs ${
            feedback.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white border border-brand-cream-dark/50 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-cream-warm/30 border-b border-brand-cream-dark/45 text-[10px] font-bold uppercase tracking-wider text-brand-espresso/65">
                <th className="py-4 px-6">Coupon Code</th>
                <th className="py-4 px-6">Discount Type</th>
                <th className="py-4 px-6">Discount Value</th>
                <th className="py-4 px-6">Min Cart Spend</th>
                <th className="py-4 px-6">Expiry Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-cream-light text-brand-espresso">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-brand-cream-light/30 transition">
                  <td className="py-4 px-6 font-mono font-bold text-brand-honey tracking-wider text-[13px]">
                    {coupon.code}
                  </td>
                  <td className="py-4 px-6 capitalize font-semibold">{coupon.discount_type}</td>
                  <td className="py-4 px-6 font-bold">
                    {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                  </td>
                  <td className="py-4 px-6 font-semibold">₹{Number(coupon.min_order_amount).toFixed(2)}</td>
                  <td className="py-4 px-6 text-brand-espresso/65 font-medium flex items-center gap-1.5 py-5">
                    <Calendar className="w-3.5 h-3.5" />
                    {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : "Never Expires"}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="p-2 hover:bg-red-50 border border-red-200 text-red-500 rounded-lg transition"
                      aria-label="Delete coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-brand-espresso/45 italic font-bold">
                    No promo codes have been registered yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-brand-espresso/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white border border-brand-cream-dark/65 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl z-10 font-sans text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-brand-cream-light mb-6">
              <h2 className="text-base font-serif font-bold text-brand-espresso">Create Promo Code</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-brand-espresso/50 hover:text-brand-espresso text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-espresso/70 mb-1.5">
                  Coupon Code String
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VANBASKET15"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl border border-brand-cream-dark focus:border-brand-honey focus:outline-none bg-white font-mono uppercase font-bold tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-espresso/70 mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={newCoupon.discount_type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl border border-brand-cream-dark focus:border-brand-honey focus:outline-none bg-white font-semibold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Flat (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-espresso/70 mb-1.5">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 10 or 150"
                    value={newCoupon.discount_value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl border border-brand-cream-dark focus:border-brand-honey focus:outline-none bg-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-espresso/70 mb-1.5">
                    Min spend (INR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 350"
                    value={newCoupon.min_order_amount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, min_order_amount: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl border border-brand-cream-dark focus:border-brand-honey focus:outline-none bg-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-espresso/70 mb-1.5">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={newCoupon.expires_at}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expires_at: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl border border-brand-cream-dark focus:border-brand-honey focus:outline-none bg-white font-semibold"
                  />
                </div>
              </div>

              <div className="border-t border-brand-cream-light pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 px-6 border border-brand-cream-dark text-brand-espresso font-bold uppercase tracking-wider rounded-xl hover:bg-brand-cream-light transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-11 px-8 bg-brand-espresso hover:bg-brand-espresso/90 text-white font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Create Code</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
