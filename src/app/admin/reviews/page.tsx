"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Star,
  Search,
  Filter,
  Trash2,
  Eye,
  CheckCircle,
  X,
  Image as ImageIcon,
  MessageSquare,
  RefreshCw,
  Loader2,
  Sparkles
} from "lucide-react";

interface AdminReviewItem {
  id: string;
  product_id: string;
  user_id: string | null;
  rating: number;
  title: string | null;
  comment: string;
  image_url: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
  products?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedReview, setSelectedReview] = useState<AdminReviewItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAdminReviews = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (ratingFilter !== "all") params.set("rating", ratingFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setTotalCount(data.total || 0);
        if (data.rating_distribution) {
          setRatingDistribution(data.rating_distribution);
        }
      }
    } catch (err) {
      console.error("Failed to load admin reviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminReviews();
  }, [ratingFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAdminReviews();
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user review?")) return;

    setDeletingId(reviewId);
    try {
      const res = await fetch(`/api/admin/reviews?id=${encodeURIComponent(reviewId)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        if (selectedReview?.id === reviewId) {
          setSelectedReview(null);
        }
        fetchAdminReviews();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete review.");
      }
    } catch (err) {
      console.error("Delete review error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getRatingBadgeClass = (rating: number) => {
    if (rating >= 4) return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (rating === 3) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-rose-100 text-rose-800 border-rose-300";
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans text-brand-espresso space-y-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="eyebrow flex items-center gap-1 text-brand-honey">
              <Sparkles className="w-3.5 h-3.5 fill-brand-honey" /> Admin Management
            </span>
          </div>
          <h1 className="font-serif text-3xl font-black text-brand-espresso mt-1">
            Customer Ratings & Reviews
          </h1>
          <p className="text-xs text-brand-espresso/60 mt-1">
            Excel-like tabular view for monitoring, filtering, and inspecting all customer product reviews.
          </p>
        </div>

        <button
          onClick={fetchAdminReviews}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-brand-espresso/15 text-xs font-bold text-brand-espresso hover:bg-brand-cream-light transition shadow-sm self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-brand-honey ${isLoading ? "animate-spin" : ""}`} /> Refresh Table
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div
          onClick={() => setRatingFilter("all")}
          className={`cursor-pointer p-4 rounded-2xl border transition ${
            ratingFilter === "all"
              ? "bg-brand-espresso text-white border-brand-espresso shadow-md"
              : "bg-white border-brand-cream-dark/60 hover:bg-brand-cream-light/50"
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Total Reviews</p>
          <p className="font-serif text-2xl font-black mt-1">{totalCount}</p>
        </div>

        {[5, 4, 3, 2, 1].map((star) => (
          <div
            key={star}
            onClick={() => setRatingFilter(star.toString())}
            className={`cursor-pointer p-4 rounded-2xl border transition ${
              ratingFilter === star.toString()
                ? "bg-brand-honey text-white border-brand-honey shadow-md"
                : "bg-white border-brand-cream-dark/60 hover:bg-brand-cream-light/50"
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 flex items-center gap-1">
              <span>{star} Stars</span> <Star className="w-3 h-3 fill-current" />
            </p>
            <p className="font-serif text-2xl font-black mt-1">{ratingDistribution[star] || 0}</p>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-brand-cream-dark/60 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Star Rating Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1">
          <span className="text-xs font-bold text-brand-espresso/70 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Rating:
          </span>
          <button
            onClick={() => setRatingFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
              ratingFilter === "all"
                ? "bg-brand-espresso text-white"
                : "bg-brand-cream-light/60 border border-brand-cream-dark text-brand-espresso/80 hover:bg-white"
            }`}
          >
            All Ratings
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() => setRatingFilter(star.toString())}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 whitespace-nowrap ${
                ratingFilter === star.toString()
                  ? "bg-brand-espresso text-white"
                  : "bg-brand-cream-light/60 border border-brand-cream-dark text-brand-espresso/80 hover:bg-white"
              }`}
            >
              <span>{star} Star</span>
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search review text or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-brand-cream-dark/80 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-honey bg-brand-cream-light/30"
          />
          <Search className="w-4 h-4 text-brand-espresso/40 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Excel-Like Tabular Form */}
      <div className="bg-white border border-brand-cream-dark/60 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-espresso text-brand-cream-light text-[11px] font-bold uppercase tracking-wider border-b border-brand-cream-dark">
                <th className="py-4 px-5">User Profile</th>
                <th className="py-4 px-5">Product</th>
                <th className="py-4 px-5 text-center">Rating</th>
                <th className="py-4 px-5">Review Content</th>
                <th className="py-4 px-5 text-center">Photo</th>
                <th className="py-4 px-5">Date</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-cream-dark/40 text-xs font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-espresso/60">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-honey mx-auto mb-2" />
                    Loading review entries...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-espresso/60">
                    <MessageSquare className="w-8 h-8 text-brand-cream-dark mx-auto mb-2" />
                    No reviews match your selected filter.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => {
                  const userName = review.profiles?.full_name || "Verified Customer";
                  const userEmail = review.profiles?.email || "No Email";
                  const productName = review.products?.name || "Van Basket Honey";

                  return (
                    <tr
                      key={review.id}
                      className="hover:bg-brand-cream-light/40 transition group cursor-pointer"
                      onClick={() => setSelectedReview(review)}
                    >
                      {/* User Profile */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-espresso text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {userName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-brand-espresso truncate max-w-[160px]">{userName}</p>
                            <p className="text-[10px] text-brand-espresso/50 truncate max-w-[160px]">{userEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="py-4 px-5">
                        <span className="font-bold text-brand-espresso">{productName}</span>
                      </td>

                      {/* Rating Badge */}
                      <td className="py-4 px-5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${getRatingBadgeClass(
                            review.rating
                          )}`}
                        >
                          <span>{review.rating}</span>
                          <Star className="w-3 h-3 fill-current" />
                        </span>
                      </td>

                      {/* Review Content */}
                      <td className="py-4 px-5 max-w-xs">
                        {review.title && (
                          <p className="font-bold text-brand-espresso truncate">{review.title}</p>
                        )}
                        <p className="text-brand-espresso/70 truncate text-[11px] mt-0.5">{review.comment}</p>
                      </td>

                      {/* Photo Thumbnail / Indicator */}
                      <td className="py-4 px-5 text-center">
                        {review.image_url ? (
                          <div className="relative w-9 h-9 mx-auto rounded-lg border border-brand-cream-dark overflow-hidden shadow-xs">
                            <Image src={review.image_url} alt="Review attachment" fill className="object-cover" />
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400">—</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-5 whitespace-nowrap text-brand-espresso/60 text-[11px]">
                        {formatDate(review.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedReview(review)}
                            className="p-1.5 rounded-lg bg-brand-cream-light/80 hover:bg-brand-espresso hover:text-white transition text-brand-espresso"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            disabled={deletingId === review.id}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white transition text-rose-600"
                            title="Delete Review"
                          >
                            {deletingId === review.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Detail Drawer Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-espresso/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-brand-cream-dark max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedReview(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-brand-cream-light text-brand-espresso/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="eyebrow">Full Inspection Details</span>
              <h3 className="font-serif text-2xl font-black text-brand-espresso mt-1">
                Customer Review Record
              </h3>
            </div>

            <div className="space-y-6">
              {/* User & Product Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-brand-cream-light/40 border border-brand-cream-dark/40">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-espresso/60">Customer Name</p>
                  <p className="font-bold text-sm text-brand-espresso mt-0.5">
                    {selectedReview.profiles?.full_name || "Verified Customer"}
                  </p>
                  <p className="text-xs text-brand-espresso/60">{selectedReview.profiles?.email || "No email"}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-espresso/60">Product Target</p>
                  <p className="font-bold text-sm text-brand-espresso mt-0.5">
                    {selectedReview.products?.name || "Raw Wildflower Honey"}
                  </p>
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Verified Order Buyer
                  </p>
                </div>
              </div>

              {/* Rating & Headline */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-espresso/60 mb-2">Rating & Headline</p>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-xl text-sm font-bold flex items-center gap-1 border ${getRatingBadgeClass(
                      selectedReview.rating
                    )}`}
                  >
                    <span>{selectedReview.rating} Stars</span>
                    <Star className="w-4 h-4 fill-current" />
                  </span>
                  {selectedReview.title && (
                    <h4 className="font-bold text-base text-brand-espresso">{selectedReview.title}</h4>
                  )}
                </div>
              </div>

              {/* Full Review Comment */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-espresso/60 mb-1">Entire Review Comment</p>
                <div className="p-4 rounded-2xl bg-white border border-brand-cream-dark/60 text-xs md:text-sm leading-relaxed font-normal text-brand-espresso/90 whitespace-pre-wrap">
                  {selectedReview.comment}
                </div>
              </div>

              {/* High Resolution Attached Image (if user attached photo) */}
              {selectedReview.image_url && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-espresso/60 mb-2 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-brand-honey" /> Attached Review Photo
                  </p>
                  <div className="relative w-full h-72 rounded-2xl border border-brand-cream-dark/60 overflow-hidden bg-black/5">
                    <Image
                      src={selectedReview.image_url}
                      alt="Customer attached review photo full view"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                </div>
              )}

              {/* Posted timestamp & Admin Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-brand-cream-dark/40 text-xs">
                <p className="text-brand-espresso/50">Posted: {formatDate(selectedReview.created_at)}</p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="px-4 py-2 rounded-xl border border-brand-cream-dark text-xs font-bold uppercase tracking-wider hover:bg-brand-cream-light transition"
                  >
                    Close View
                  </button>
                  <button
                    onClick={() => handleDeleteReview(selectedReview.id)}
                    disabled={deletingId === selectedReview.id}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-rose-700 transition flex items-center gap-2"
                  >
                    {deletingId === selectedReview.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" /> Delete Review
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
