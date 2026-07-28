"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Star,
  CheckCircle,
  ThumbsUp,
  Image as ImageIcon,
  X,
  Upload,
  MessageSquare,
  Edit2,
  Trash2,
  Filter,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  UserCheck
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ProfileInfo {
  full_name: string | null;
  email: string | null;
}

interface ReviewItem {
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
  profiles?: ProfileInfo | null;
}

interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_counts: Record<number, number>;
  rating_percentages: Record<number, number>;
}

interface ProductReviewsProps {
  productId: string;
  productName?: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  productName = "Wild Forest Honey",
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [supabase] = useState(() => createClient());

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    total_reviews: 0,
    average_rating: 0,
    rating_counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    rating_percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [activeStarFilter, setActiveStarFilter] = useState<number | "all">("all");
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);

  // Review Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [formRating, setFormRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [formImage, setFormImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Read More state tracking per review id
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  // Lightbox modal state for full view of attached images
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Deleting state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Check auth user
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUser({ id: data.user.id, email: data.user.email });
      } else {
        setCurrentUser(null);
      }
    };
    checkUser();
  }, [supabase]);

  // Auto trigger review modal if writeReview=true URL query parameter exists
  useEffect(() => {
    const isWriteReviewParam = searchParams?.get("writeReview") === "true" || searchParams?.get("review") === "true";
    if (isWriteReviewParam) {
      const reviewSection = document.getElementById("product-reviews-section");
      if (reviewSection) {
        reviewSection.scrollIntoView({ behavior: "smooth" });
      }
      setIsModalOpen(true);
    }
  }, [searchParams]);

  // Load reviews
  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reviews?product_id=${encodeURIComponent(productId)}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadReviews();
    }
  }, [productId]);

  // Check if current user already has posted a review
  const userExistingReview = useMemo(() => {
    if (!currentUser) return null;
    return reviews.find((r) => r.user_id === currentUser.id) || null;
  }, [currentUser, reviews]);

  const openWriteModal = (existingReview?: ReviewItem) => {
    if (!currentUser) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (existingReview) {
      setEditingReviewId(existingReview.id);
      setFormRating(existingReview.rating || 5);
      setFormTitle(existingReview.title || "");
      setFormComment(existingReview.comment || "");
      setFormImage(existingReview.image_url || null);
    } else {
      setEditingReviewId(null);
      setFormRating(5);
      setFormTitle("");
      setFormComment("");
      setFormImage(null);
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formComment.trim()) {
      setErrorMessage("Please enter your review text.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      let res: Response;
      if (editingReviewId) {
        res = await fetch(`/api/reviews/${editingReviewId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating: formRating,
            title: formTitle,
            comment: formComment,
            image_url: formImage,
          }),
        });
      } else {
        res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: productId,
            rating: formRating,
            title: formTitle,
            comment: formComment,
            image_url: formImage,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setSuccessMessage(editingReviewId ? "Review updated successfully!" : "Review posted successfully!");
      setTimeout(() => {
        setIsModalOpen(false);
        loadReviews();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setDeletingId(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadReviews();
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

  const toggleReadMore = (id: string) => {
    setExpandedReviews((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredReviews = useMemo(() => {
    if (activeStarFilter === "all") return reviews;
    return reviews.filter((r) => Math.round(r.rating) === activeStarFilter);
  }, [reviews, activeStarFilter]);

  const getRatingBadgeColor = (rating: number) => {
    if (rating >= 4) return "bg-emerald-600 text-white";
    if (rating >= 3) return "bg-amber-500 text-white";
    return "bg-rose-500 text-white";
  };

  const getBarColor = (star: number) => {
    if (star >= 4) return "bg-emerald-600";
    if (star === 3) return "bg-emerald-500";
    if (star === 2) return "bg-amber-500";
    return "bg-rose-500";
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <section id="product-reviews-section" className="mt-16 pt-12 border-t border-brand-cream-dark/60 font-sans text-brand-espresso">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="eyebrow flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-honey fill-brand-honey" /> Verified Customer Feedback
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-black text-brand-espresso mt-1">
            Ratings & Reviews
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {userExistingReview ? (
            <button
              onClick={() => openWriteModal(userExistingReview)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-brand-espresso/20 font-bold text-xs uppercase tracking-wider text-brand-espresso hover:bg-brand-espresso hover:text-white transition shadow-sm"
            >
              <Edit2 className="w-4 h-4 text-brand-honey" /> Edit Your Review
            </button>
          ) : (
            <button
              onClick={() => openWriteModal()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-espresso text-brand-cream-light font-bold text-xs uppercase tracking-widest hover:bg-brand-honey hover:text-brand-espresso transition shadow-md"
            >
              <Star className="w-4 h-4 text-brand-honey fill-brand-honey" /> Rate Product
            </button>
          )}
        </div>
      </div>

      {/* Flipkart-Style Overall Rating & Statistical Bar Chart */}
      <div className="bg-white border border-brand-cream-dark/60 rounded-3xl p-6 md:p-8 shadow-sm mb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Rating Summary Left Card */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-brand-cream-light/40 border border-brand-cream-dark/40 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="font-serif text-5xl font-black text-brand-espresso">
                {stats.average_rating > 0 ? stats.average_rating.toFixed(1) : "5.0"}
              </span>
              <Star className="w-8 h-8 text-brand-honey fill-brand-honey" />
            </div>

            <div className="mt-2 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full inline-block">
              {stats.average_rating >= 4.5
                ? "Very Good Quality"
                : stats.average_rating >= 4.0
                ? "Highly Rated"
                : "Customer Approved"}
            </div>

            <p className="mt-3 text-xs text-brand-espresso-muted font-medium">
              Based on <span className="font-bold text-brand-espresso">{stats.total_reviews}</span> total ratings & reviews
            </p>
          </div>

          {/* Flipkart-Style Bar Chart Right Side */}
          <div className="md:col-span-8 space-y-2.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.rating_counts[star] || 0;
              const percentage = stats.rating_percentages[star] || 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-10 font-bold shrink-0 text-brand-espresso">
                    <span>{star}</span>
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </div>

                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getBarColor(star)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="w-14 text-right font-semibold text-brand-espresso/70 shrink-0">
                    {count} <span className="text-[10px] text-gray-400">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Review List */}
      <div className="space-y-6">
        {/* Star Rating Filter Pills */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-brand-cream-dark/40">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-bold text-brand-espresso/70 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <button
              onClick={() => setActiveStarFilter("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                activeStarFilter === "all"
                  ? "bg-brand-espresso text-white shadow-sm"
                  : "bg-white border border-brand-cream-dark text-brand-espresso/75 hover:bg-brand-cream-light"
              }`}
            >
              All ({reviews.length})
            </button>
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                onClick={() => setActiveStarFilter(star)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                  activeStarFilter === star
                    ? "bg-brand-espresso text-white shadow-sm"
                    : "bg-white border border-brand-cream-dark text-brand-espresso/75 hover:bg-brand-cream-light"
                }`}
              >
                <span>{star} ★</span>
                <span className="text-[10px] opacity-70">({stats.rating_counts[star] || 0})</span>
              </button>
            ))}
          </div>

          <div className="text-xs text-brand-espresso/60 font-medium">
            Showing {filteredReviews.length} {filteredReviews.length === 1 ? "review" : "reviews"}
          </div>
        </div>

        {/* Reviews List */}
        {isLoading ? (
          <div className="py-12 text-center text-brand-espresso/60 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-honey" />
            <p className="text-xs font-semibold">Loading customer reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white border border-brand-cream-dark/60 rounded-2xl p-10 text-center space-y-3">
            <MessageSquare className="w-10 h-10 text-brand-cream-dark mx-auto" />
            <h3 className="font-serif text-lg font-bold">No reviews for this filter yet</h3>
            <p className="text-xs text-brand-espresso-muted max-w-sm mx-auto">
              Be the first to share your thoughts and help others make informed decisions.
            </p>
            <button
              onClick={() => openWriteModal()}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-honey text-brand-espresso text-xs font-bold uppercase tracking-wider hover:bg-brand-espresso hover:text-white transition"
            >
              Write First Review
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => {
              const isOwner = currentUser && review.user_id === currentUser.id;
              const isLongText = review.comment.length > 220;
              const isExpanded = expandedReviews[review.id];
              const displayComment = isLongText && !isExpanded ? `${review.comment.slice(0, 220)}...` : review.comment;
              const userName = review.profiles?.full_name || "Verified Customer";

              return (
                <div
                  key={review.id}
                  className="bg-white border border-brand-cream-dark/60 rounded-2xl p-5 md:p-6 shadow-sm hover:border-brand-honey/40 transition group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-brand-espresso text-brand-cream-light font-bold text-xs flex items-center justify-center shrink-0 uppercase shadow-inner">
                        {userName.slice(0, 2)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-brand-espresso">{userName}</h4>
                          {review.is_verified_purchase && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> Verified Buyer
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-brand-espresso/50 mt-0.5">
                          Posted on {formatDate(review.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Actions if owner */}
                    {isOwner && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openWriteModal(review)}
                          className="p-2 rounded-lg hover:bg-brand-cream-light text-brand-espresso/70 hover:text-brand-honey transition"
                          title="Edit review"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={deletingId === review.id}
                          className="p-2 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition"
                          title="Delete review"
                        >
                          {deletingId === review.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Rating Badge & Headline */}
                  <div className="mt-4 flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1 ${getRatingBadgeColor(
                        review.rating
                      )}`}
                    >
                      <span>{review.rating}</span>
                      <Star className="w-3 h-3 fill-current" />
                    </span>

                    {review.title && (
                      <h5 className="font-bold text-sm text-brand-espresso truncate">{review.title}</h5>
                    )}
                  </div>

                  {/* Comment Text with Compact Read More */}
                  <div className="mt-3 text-xs md:text-sm leading-relaxed text-brand-espresso/80 font-normal">
                    <p>{displayComment}</p>

                    {isLongText && (
                      <button
                        onClick={() => toggleReadMore(review.id)}
                        className="mt-2 inline-flex items-center gap-1 font-bold text-xs text-brand-honey hover:text-brand-espresso transition"
                      >
                        {isExpanded ? (
                          <>
                            Read Less <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            Read More <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Attached Review Image Preview */}
                  {review.image_url && (
                    <div className="mt-4">
                      <button
                        onClick={() => setLightboxImage(review.image_url)}
                        className="relative w-20 h-20 rounded-xl border border-brand-cream-dark/60 overflow-hidden group/img hover:scale-105 transition shadow-sm"
                      >
                        <Image
                          src={review.image_url}
                          alt="Customer review photo"
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                        <div className="absolute inset-0 bg-brand-espresso/30 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center text-white">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal Form (Write/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-espresso/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-brand-cream-dark max-h-[90vh] overflow-y-auto no-scrollbar">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-brand-cream-light text-brand-espresso/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="eyebrow">Your Honest Opinion</span>
              <h3 className="font-serif text-2xl font-black text-brand-espresso mt-1">
                {editingReviewId ? "Update Your Review" : `Rate & Review ${productName}`}
              </h3>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-5">
              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-espresso/70 mb-2">
                  Overall Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-amber-400 transition hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoverRating || formRating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300 fill-gray-100"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-sm text-brand-espresso">
                    {hoverRating || formRating} out of 5
                  </span>
                </div>
              </div>

              {/* Review Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-espresso/70 mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pure, rustic forest flavor & excellent packaging!"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-brand-cream-dark/80 bg-brand-cream-light/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-honey text-xs font-medium"
                />
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-espresso/70 mb-1">
                  Detailed Review *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your taste experience, packaging quality, delivery speed, etc..."
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-brand-cream-dark/80 bg-brand-cream-light/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-honey text-xs font-medium"
                />
              </div>

              {/* Optional Photo Attachment */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-espresso/70 mb-1">
                  Attach Photo (Optional)
                </label>
                {formImage ? (
                  <div className="relative w-28 h-28 rounded-2xl border border-brand-cream-dark overflow-hidden group">
                    <Image src={formImage} alt="Uploaded review preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormImage(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-brand-espresso/80 text-white hover:bg-rose-600 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-brand-cream-dark/80 rounded-2xl bg-brand-cream-light/30 hover:bg-white hover:border-brand-honey cursor-pointer transition">
                    <Upload className="w-6 h-6 text-brand-honey mb-1" />
                    <span className="text-xs font-bold text-brand-espresso">Upload Product Image</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG or WEBP (Max 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-brand-cream-dark/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-xl border border-brand-cream-dark text-xs font-bold uppercase tracking-wider hover:bg-brand-cream-light transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-brand-espresso text-brand-cream-light text-xs font-bold uppercase tracking-widest hover:bg-brand-honey hover:text-brand-espresso transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Photo Enlarge */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-3xl w-full max-h-[90vh] bg-black rounded-3xl overflow-hidden flex items-center justify-center">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full h-[75vh]">
              <Image
                src={lightboxImage}
                alt="Full customer review preview"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
