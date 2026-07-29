"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  User as UserIcon,
  MapPin,
  ShoppingBag,
  LogOut,
  Edit2,
  Trash2,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Package,
  Calendar,
  ArrowLeft,
  Menu,
  X,
  CreditCard,
  Star
} from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
}

interface Address {
  id: string;
  user_id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
}

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
  status: string;
  amount: number;
  gateway_order_id?: string;
  gateway_payment_id?: string;
  payment_method?: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  currency: string;
  created_at: string;
  order_items: OrderItem[];
  payments: Payment[];
  addresses: Address | null;
}

interface UserReviewItem {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  products?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

type TabType = "personal" | "addresses" | "orders" | "reviews";

// Note: metadata is handled by the parent layout template pattern
export default function ProfilePage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userReviews, setUserReviews] = useState<UserReviewItem[]>([]);

  // Loading States
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Review Editing Modal State
  const [editingProfileReview, setEditingProfileReview] = useState<UserReviewItem | null>(null);
  const [reviewFormRating, setReviewFormRating] = useState<number>(5);
  const [reviewFormTitle, setReviewFormTitle] = useState("");
  const [reviewFormComment, setReviewFormComment] = useState("");
  const [reviewFormImage, setReviewFormImage] = useState<string | null>(null);
  const [expandedUserReviews, setExpandedUserReviews] = useState<Record<string, boolean>>({});

  // Address Dialog / Form
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "IN",
    phone: "",
    is_default: false,
  });

  // Success / Error Feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Profile Form Fields
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const loadProfile = useCallback(async (userId: string) => {
    setIsLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      const userProfile: Profile = data || {
        id: userId,
        full_name: "",
        phone: "",
      };

      setProfile(userProfile);
      setProfileForm({
        fullName: userProfile.full_name || "",
        phone: userProfile.phone || "",
      });
    } catch {
      setFeedback({ type: "error", message: "Failed to load profile details from database." });
    } finally {
      setIsLoadingProfile(false);
    }
  }, [supabase]);

  const loadAddresses = useCallback(async (userId: string) => {
    setIsLoadingAddresses(true);
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch {
      setFeedback({ type: "error", message: "Failed to load delivery addresses." });
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [supabase]);

  const loadOrders = useCallback(async (userId: string) => {
    setIsLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(*),
          payments(*),
          addresses:shipping_address_id(*)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped = (data || []).map((o: any) => ({
        ...o,
        addresses: Array.isArray(o.addresses) ? o.addresses[0] || null : o.addresses || null,
      }));
      setOrders(mapped);
    } catch {
      setFeedback({ type: "error", message: "Failed to retrieve order history." });
    } finally {
      setIsLoadingOrders(false);
    }
  }, [supabase]);

  const fetchUserReviews = useCallback(async () => {
    setIsLoadingReviews(true);
    try {
      const res = await fetch("/api/user/reviews");
      if (res.ok) {
        const data = await res.json();
        setUserReviews(data.reviews || []);
      }
    } catch (err) {
      console.error("Failed to load user reviews:", err);
    } finally {
      setIsLoadingReviews(false);
    }
  }, []);

  const openEditProfileReviewModal = (review: UserReviewItem) => {
    setEditingProfileReview(review);
    setReviewFormRating(review.rating);
    setReviewFormTitle(review.title || "");
    setReviewFormComment(review.comment);
    setReviewFormImage(review.image_url || null);
  };

  const handleUpdateProfileReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfileReview) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/reviews/${editingProfileReview.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: reviewFormRating,
          title: reviewFormTitle,
          comment: reviewFormComment,
          image_url: reviewFormImage,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update review");
      }

      setFeedback({ type: "success", message: "Your review has been updated!" });
      setEditingProfileReview(null);
      fetchUserReviews();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to update review." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProfileReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this posted review?")) return;

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFeedback({ type: "success", message: "Review deleted successfully." });
        fetchUserReviews();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete review.");
      }
    } catch (err) {
      console.error("Delete review error:", err);
    }
  };

  // 1. Authenticate and initialize profile load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          router.push("/login?redirect=/profile");
          return;
        }

        const { data: prof } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authUser.id)
          .maybeSingle();

        if (prof?.role === "admin") {
          await supabase.auth.signOut();
          router.push("/login?error=admin_account_restricted");
          return;
        }

        setUser(authUser);
        await loadProfile(authUser.id);
      } catch {
        setFeedback({ type: "error", message: "Failed to initialize authentication check." });
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkAuth();
  }, [router, supabase, loadProfile]);

  // Load user data when tab changes
  useEffect(() => {
    if (!user) return;

    if (activeTab === "addresses") {
      loadAddresses(user.id);
    } else if (activeTab === "orders") {
      loadOrders(user.id);
    } else if (activeTab === "reviews") {
      fetchUserReviews();
    }
  }, [activeTab, user, loadAddresses, loadOrders, fetchUserReviews]);

  // Real-time Order Updates Subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`profile-order-updates-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedOrder = payload.new;
          setOrders((prevOrders) =>
            prevOrders.map((o) => (o.id === updatedOrder.id ? { ...o, status: updatedOrder.status } : o))
          );
          setSelectedOrder((prevSelected) =>
            prevSelected && prevSelected.id === updatedOrder.id
              ? { ...prevSelected, status: updatedOrder.status }
              : prevSelected
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  // 2. Profile update handler
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileForm.fullName,
          phone: profileForm.phone,
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, full_name: profileForm.fullName, phone: profileForm.phone } : null);
      setFeedback({ type: "success", message: "Profile successfully updated in database." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update profile.";
      setFeedback({ type: "error", message });
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Address handlers
  const openAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      label: "Home",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "IN",
      phone: "",
      is_default: addresses.length === 0, // Default if first address
    });
    setIsAddressFormOpen(true);
    setFeedback(null);
  };

  const openEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      label: address.label || "Home",
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      phone: address.phone,
      is_default: address.is_default,
    });
    setIsAddressFormOpen(true);
    setFeedback(null);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      if (addressForm.is_default) {
        // Clear existing default addresses
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);
      }

      if (editingAddress) {
        // Update Address
        const { error } = await supabase
          .from("addresses")
          .update({
            label: addressForm.label,
            line1: addressForm.line1,
            line2: addressForm.line2 || null,
            city: addressForm.city,
            state: addressForm.state,
            postal_code: addressForm.postal_code,
            country: addressForm.country,
            phone: addressForm.phone,
            is_default: addressForm.is_default,
          })
          .eq("id", editingAddress.id);

        if (error) throw error;
        setFeedback({ type: "success", message: "Address updated successfully." });
      } else {
        // Insert Address
        const { error } = await supabase
          .from("addresses")
          .insert({
            user_id: user.id,
            label: addressForm.label,
            line1: addressForm.line1,
            line2: addressForm.line2 || null,
            city: addressForm.city,
            state: addressForm.state,
            postal_code: addressForm.postal_code,
            country: addressForm.country,
            phone: addressForm.phone,
            is_default: addressForm.is_default,
          });

        if (error) throw error;
        setFeedback({ type: "success", message: "New address saved to database." });
      }

      setIsAddressFormOpen(false);
      await loadAddresses(user.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save address.";
      setFeedback({ type: "error", message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user || !window.confirm("Are you sure you want to delete this address?")) return;
    setFeedback(null);

    try {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", addressId);

      if (error) throw error;

      setFeedback({ type: "success", message: "Address removed from database." });
      await loadAddresses(user.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete address.";
      setFeedback({ type: "error", message });
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!user) return;
    setFeedback(null);

    try {
      // 1. Clear defaults
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);

      // 2. Set new default
      const { error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", addressId);

      if (error) throw error;

      setFeedback({ type: "success", message: "Default address updated." });
      await loadAddresses(user.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to set default address.";
      setFeedback({ type: "error", message });
    }
  };

  // 4. Logout handler
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch {
      setFeedback({ type: "error", message: "Failed to sign out." });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      setFeedback({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFeedback({ type: "error", message: "Passwords do not match." });
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
    if (error) {
      setFeedback({ type: "error", message: error.message });
    } else {
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      setFeedback({ type: "success", message: "Password updated successfully." });
    }
    setIsSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your account?")) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/profile/delete", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to delete account.");
      await supabase.auth.signOut();
      router.push("/");
    } catch (err: unknown) {
      const error = err as Error;
      setFeedback({ type: "error", message: error.message || "Failed to delete account." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-brand-cream-light py-24 md:py-32 px-6 md:px-12 font-sans">
        <div className="max-w-6xl mx-auto">
          <div className="border-b border-brand-cream-dark/45 pb-8 mb-12">
            <div className="h-4 w-48 bg-brand-cream-dark/40 rounded-lg skeleton-shimmer mb-3" />
            <div className="h-8 w-72 bg-brand-cream-dark/50 rounded-lg skeleton-shimmer mb-2" />
            <div className="h-3 w-64 bg-brand-cream-dark/30 rounded-lg skeleton-shimmer" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3 space-y-2">
              <div className="h-14 bg-brand-cream-dark/30 rounded-xl skeleton-shimmer" />
              <div className="h-14 bg-brand-cream-dark/20 rounded-xl skeleton-shimmer" />
              <div className="h-14 bg-brand-cream-dark/20 rounded-xl skeleton-shimmer" />
            </div>
            <div className="lg:col-span-9 bg-white/70 border border-brand-cream-dark/55 rounded-3xl p-6 md:p-8 min-h-[400px]">
              <div className="h-5 w-40 bg-brand-cream-dark/40 rounded-lg skeleton-shimmer mb-4" />
              <div className="space-y-4 max-w-xl">
                <div className="h-12 bg-brand-cream-dark/25 rounded-xl skeleton-shimmer" />
                <div className="h-12 bg-brand-cream-dark/25 rounded-xl skeleton-shimmer" />
                <div className="h-12 bg-brand-cream-dark/25 rounded-xl skeleton-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mappings for product ordered images
  const getProductImage = (item?: OrderItem | string | null) => {
    if (!item) return "/assets/product-1.jpg";
    const name = typeof item === "string" ? item.toLowerCase() : (item.product_name_snapshot || "").toLowerCase();
    if (name.includes("jamun") || name.includes("pulp")) return "/assets/jamun-pulp-bulk.jpg";
    if (name.includes("bulk")) return "/assets/bulk-honey-order.jpg";
    return "/assets/product-1.jpg";
  };

  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case "personal": return "Personal Details";
      case "addresses": return "Saved Addresses";
      case "orders": return "Order History";
      case "reviews": return "My Posted Reviews";
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream-light text-brand-espresso font-sans relative overflow-hidden flex flex-col">
      {/* Sticky top Android Header (Mobile Only) */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-brand-espresso text-brand-cream-light flex items-center justify-between px-4 z-40 md:hidden border-b border-brand-cream-warm/15">
        <div className="flex items-center gap-3">
          {selectedOrder ? (
            <button
              onClick={() => setSelectedOrder(null)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Back to Order list"
            >
              <ArrowLeft className="w-6 h-6 text-brand-cream-light" />
            </button>
          ) : (
            <Link
              href="/"
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Back to Home"
            >
              <ArrowLeft className="w-6 h-6 text-brand-cream-light" />
            </Link>
          )}
          <span className="font-serif font-bold text-sm tracking-wider uppercase text-white">
            {selectedOrder ? "Order Details" : getTabLabel(activeTab)}
          </span>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Slide-out Mobile Tab Drawer (Mobile Only) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div className="fixed inset-0 bg-brand-espresso/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-4/5 max-w-xs bg-brand-espresso text-brand-cream-light flex flex-col justify-between p-6 pt-20 animate-slide-in">
            <div className="space-y-4">
              <h3 className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-honey mb-4">
                Profile Menu
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => { setActiveTab("personal"); setSelectedOrder(null); setIsMobileMenuOpen(false); setFeedback(null); }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-sans text-xs uppercase tracking-widest font-bold border transition-all ${
                    activeTab === "personal" && !selectedOrder
                      ? "bg-brand-honey text-white border-brand-honey"
                      : "bg-white/5 border-transparent text-brand-cream-warm hover:bg-white/10"
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Personal Details</span>
                </button>

                <button
                  onClick={() => { setActiveTab("addresses"); setSelectedOrder(null); setIsMobileMenuOpen(false); setFeedback(null); }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-sans text-xs uppercase tracking-widest font-bold border transition-all ${
                    activeTab === "addresses" && !selectedOrder
                      ? "bg-brand-honey text-white border-brand-honey"
                      : "bg-white/5 border-transparent text-brand-cream-warm hover:bg-white/10"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Saved Addresses</span>
                </button>

                <button
                  onClick={() => { setActiveTab("orders"); setSelectedOrder(null); setIsMobileMenuOpen(false); setFeedback(null); }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-sans text-xs uppercase tracking-widest font-bold border transition-all ${
                    activeTab === "orders" && !selectedOrder
                      ? "bg-brand-honey text-white border-brand-honey"
                      : "bg-white/5 border-transparent text-brand-cream-warm hover:bg-white/10"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Order History</span>
                </button>

                <button
                  onClick={() => { setActiveTab("reviews"); setSelectedOrder(null); setIsMobileMenuOpen(false); setFeedback(null); }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-sans text-xs uppercase tracking-widest font-bold border transition-all ${
                    activeTab === "reviews" && !selectedOrder
                      ? "bg-brand-honey text-white border-brand-honey"
                      : "bg-white/5 border-transparent text-brand-cream-warm hover:bg-white/10"
                  }`}
                >
                  <Star className="w-4 h-4" />
                  <span>My Reviews</span>
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-brand-cream-warm/15">
              <button
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="w-full h-11 border border-brand-terracotta/40 text-brand-terracotta font-sans text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 rounded-full hover:bg-brand-terracotta/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cream-warm/30 rounded-bl-[300px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-honey/5 rounded-tr-[250px] pointer-events-none -z-10" />

      {/* Main Content Layout Container */}
      <div className="max-w-6xl mx-auto w-full px-6 md:px-12 py-24 md:py-32 flex-grow">
        
        {/* Desktop Breadcrumb & Header (Hidden on Mobile) */}
        <div className="hidden md:flex flex-col md:flex-row md:items-end justify-between border-b border-brand-cream-dark/45 pb-8 mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-brand-espresso/60 font-bold mb-2">
              <Link href="/" className="hover:text-brand-honey transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span>Profile Dashboard</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">
              Welcome, {profile?.full_name || "Valued Collector"}
            </h1>
            <p className="text-sm text-brand-espresso-muted mt-1">
              Manage your personal registry allocation records and delivery parameters.
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="h-10 px-5 border border-brand-cream-dark/80 text-brand-espresso font-sans text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 rounded-full hover:bg-brand-cream-warm/45 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-xl mb-8 flex items-start gap-3 border ${
              feedback.type === "success"
                ? "bg-brand-forest/15 border-brand-forest/30 text-brand-forest"
                : "bg-brand-terracotta/15 border-brand-terracotta/30 text-brand-terracotta"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="text-xs font-semibold">{feedback.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Sidebar Navigation (Hidden on Mobile) */}
          <div className="hidden md:block md:col-span-3 space-y-2">
            <button
              onClick={() => { setActiveTab("personal"); setSelectedOrder(null); setFeedback(null); }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-sans text-xs uppercase tracking-widest font-bold border transition-all duration-300 ${
                activeTab === "personal" && !selectedOrder
                  ? "bg-brand-espresso text-brand-cream-light border-brand-espresso shadow-sm"
                  : "bg-white/60 border-brand-cream-dark/50 hover:bg-brand-cream-warm/30 text-brand-espresso/80"
              }`}
            >
              <UserIcon className="w-4 h-4 stroke-[2]" />
              <span>Personal Details</span>
            </button>

            <button
              onClick={() => { setActiveTab("addresses"); setSelectedOrder(null); setFeedback(null); }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-sans text-xs uppercase tracking-widest font-bold border transition-all duration-300 ${
                activeTab === "addresses" && !selectedOrder
                  ? "bg-brand-espresso text-brand-cream-light border-brand-espresso shadow-sm"
                  : "bg-white/60 border-brand-cream-dark/50 hover:bg-brand-cream-warm/30 text-brand-espresso/80"
              }`}
            >
              <MapPin className="w-4 h-4 stroke-[2]" />
              <span>Saved Addresses</span>
            </button>

            <button
              onClick={() => { setActiveTab("orders"); setSelectedOrder(null); setFeedback(null); }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-sans text-xs uppercase tracking-widest font-bold border transition-all duration-300 ${
                activeTab === "orders" || selectedOrder
                  ? "bg-brand-espresso text-brand-cream-light border-brand-espresso shadow-sm"
                  : "bg-white/60 border-brand-cream-dark/50 hover:bg-brand-cream-warm/30 text-brand-espresso/80"
              }`}
            >
              <ShoppingBag className="w-4 h-4 stroke-[2]" />
              <span>Order History</span>
            </button>

            <button
              onClick={() => { setActiveTab("reviews"); setSelectedOrder(null); setFeedback(null); }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-sans text-xs uppercase tracking-widest font-bold border transition-all duration-300 ${
                activeTab === "reviews" && !selectedOrder
                  ? "bg-brand-espresso text-brand-cream-light border-brand-espresso shadow-sm"
                  : "bg-white/60 border-brand-cream-dark/50 hover:bg-brand-cream-warm/30 text-brand-espresso/80"
              }`}
            >
              <Star className="w-4 h-4 stroke-[2]" />
              <span>My Reviews</span>
            </button>
          </div>

          {/* Active Tab Panel Content */}
          <div className="col-span-1 md:col-span-9 bg-white/70 border border-brand-cream-dark/55 rounded-3xl p-5 md:p-8 shadow-sm min-h-[400px] backdrop-blur-sm">
            
            {/* FLIPKART-STYLE ORDER DETAILS SUB-VIEW (Overrides other layouts when an order is selected) */}
            {selectedOrder ? (
              <div className="space-y-6 animate-scale-in">
                {/* Back button header (Desktop and mobile fallbacks) */}
                <div className="flex items-center justify-between pb-4 border-b border-brand-cream-dark/30">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-espresso/80 hover:text-brand-honey transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Order History</span>
                  </button>
                  <span className="font-mono text-[10px] bg-brand-cream-warm px-2 py-0.5 rounded text-brand-espresso font-semibold">
                    {selectedOrder.order_number}
                  </span>
                </div>

                {/* Progress Tracker Stepper (Flipkart-Style) */}
                <div className="bg-brand-cream-warm/15 border border-brand-cream-dark/30 rounded-2xl p-6">
                  <h3 className="text-xs uppercase font-extrabold tracking-widest text-brand-honey mb-4">
                    Order Status Progress
                  </h3>
                  
                  <div className="relative flex justify-between items-center max-w-xl mx-auto py-2">
                    {/* Background Progress Bar Line */}
                    <div className="absolute left-0 right-0 top-1/2 h-1 bg-brand-cream-dark/40 -translate-y-1/2 z-0" />
                    <div 
                      className={`absolute left-0 top-1/2 h-1 bg-brand-forest -translate-y-1/2 z-0 transition-all duration-700`} 
                      style={{ 
                        width: selectedOrder.status === "delivered" ? "100%" : 
                               selectedOrder.status === "shipped" ? "66%" : 
                               selectedOrder.status === "paid" ? "33%" : "0%" 
                      }}
                    />

                    {/* Step 1: Placed */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-brand-forest text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </div>
                      <span className="text-[10px] font-bold mt-1.5 text-brand-espresso">Placed</span>
                    </div>

                    {/* Step 2: Payment Received */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        ["paid", "shipped", "delivered"].includes(selectedOrder.status)
                          ? "bg-brand-forest text-white"
                          : "bg-brand-cream-light border-2 border-brand-cream-dark text-brand-espresso/50"
                      }`}>
                        {["paid", "shipped", "delivered"].includes(selectedOrder.status) ? "✓" : "2"}
                      </div>
                      <span className="text-[10px] font-bold mt-1.5 text-brand-espresso">Paid</span>
                    </div>

                    {/* Step 3: Dispatched */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        ["shipped", "delivered"].includes(selectedOrder.status)
                          ? "bg-brand-forest text-white"
                          : "bg-brand-cream-light border-2 border-brand-cream-dark text-brand-espresso/50"
                      }`}>
                        {["shipped", "delivered"].includes(selectedOrder.status) ? "✓" : "3"}
                      </div>
                      <span className="text-[10px] font-bold mt-1.5 text-brand-espresso">Shipped</span>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        selectedOrder.status === "delivered"
                          ? "bg-brand-forest text-white"
                          : "bg-brand-cream-light border-2 border-brand-cream-dark text-brand-espresso/50"
                      }`}>
                        {selectedOrder.status === "delivered" ? "✓" : "4"}
                      </div>
                      <span className="text-[10px] font-bold mt-1.5 text-brand-espresso">Delivered</span>
                    </div>
                  </div>
                </div>

                {/* Shipping & Payment Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Delivery Address Details */}
                  <div className="border border-brand-cream-dark/50 rounded-2xl p-5 bg-white space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 pb-2 border-b border-brand-cream-light">
                      <MapPin className="w-4 h-4 text-brand-honey" />
                      <h4 className="text-xs uppercase font-extrabold tracking-widest text-brand-espresso">
                        Delivery Destination
                      </h4>
                    </div>

                    {selectedOrder.addresses ? (
                      <div className="text-xs leading-relaxed space-y-1">
                        <p className="font-bold text-brand-espresso">
                          {selectedOrder.addresses.label} Address
                        </p>
                        <p className="font-semibold text-brand-espresso-muted">
                          Ph: {selectedOrder.addresses.phone}
                        </p>
                        <p className="text-brand-espresso-muted">
                          {selectedOrder.addresses.line1}
                          {selectedOrder.addresses.line2 && `, ${selectedOrder.addresses.line2}`}
                        </p>
                        <p className="text-brand-espresso-muted">
                          {selectedOrder.addresses.city}, {selectedOrder.addresses.state} - {selectedOrder.addresses.postal_code}
                        </p>
                        <p className="text-[10px] text-brand-espresso-muted uppercase tracking-wider font-semibold">
                          {selectedOrder.addresses.country}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs italic text-brand-espresso/50">No delivery address logged for this order.</p>
                    )}
                  </div>

                  {/* Transaction Details */}
                  <div className="border border-brand-cream-dark/50 rounded-2xl p-5 bg-white space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 pb-2 border-b border-brand-cream-light">
                      <CreditCard className="w-4 h-4 text-brand-honey" />
                      <h4 className="text-xs uppercase font-extrabold tracking-widest text-brand-espresso">
                        Payment Registry Info
                      </h4>
                    </div>

                    <div className="text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-brand-espresso/50">Fulfillment Status:</span>
                        <span className="font-bold uppercase text-brand-honey">{selectedOrder.status}</span>
                      </div>
                      
                      {selectedOrder.payments && selectedOrder.payments.length > 0 ? (
                        (() => {
                          const pay = selectedOrder.payments[0];
                          return (
                            <>
                              <div className="flex justify-between">
                                <span className="text-brand-espresso/50">Payment Method:</span>
                                <span className="font-bold text-brand-espresso">{pay.gateway === "cod" || selectedOrder.status === "pending_cod" ? "Cash on Delivery (COD)" : pay.gateway.toUpperCase()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-brand-espresso/50">Transaction Status:</span>
                                <span className={`font-bold uppercase ${pay.status === "captured" || pay.status === "confirmed" || pay.status === "paid" ? "text-brand-forest" : "text-brand-terracotta"}`}>
                                  {pay.status}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-brand-espresso/50">Gateway Order ID:</span>
                                <span className="font-mono text-[10px] font-semibold text-brand-espresso select-all">{pay.gateway_order_id}</span>
                              </div>
                              {pay.gateway_payment_id && (
                                <div className="flex justify-between">
                                  <span className="text-brand-espresso/50">Payment ID:</span>
                                  <span className="font-mono text-[10px] font-semibold text-brand-espresso select-all">{pay.gateway_payment_id}</span>
                                </div>
                              )}
                            </>
                          );
                        })()
                      ) : (
                        <p className="text-xs italic text-brand-espresso/50">No transactional metadata available.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Breakdown list */}
                <div className="border border-brand-cream-dark/50 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <div className="bg-brand-cream-light/40 px-5 py-3.5 border-b border-brand-cream-dark/40">
                    <h4 className="text-xs uppercase font-extrabold tracking-widest text-brand-espresso">
                      Items Ordered
                    </h4>
                  </div>
                  
                  <div className="divide-y divide-brand-cream-light px-5 py-2">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="py-4 flex items-center gap-4 justify-between">
                        <div className="flex items-center gap-4">
                          {/* Item Thumbnail */}
                          <div className="w-16 h-16 bg-brand-cream-light rounded-xl border border-brand-cream-dark/30 flex items-center justify-center shrink-0 relative overflow-hidden p-1">
                            <Image
                              src={getProductImage(item)}
                              alt={item.product_name_snapshot}
                              width={64}
                              height={64}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          
                          <div>
                            <h5 className="font-serif text-sm font-bold text-brand-espresso">
                              {item.product_name_snapshot}
                            </h5>
                            <p className="text-xs text-brand-espresso-muted">
                              Size variant: {item.variant_label_snapshot}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[10px] text-brand-espresso-muted font-bold">
                                Qty: {item.quantity}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push('/catalogue/raw-wildflower-honey?writeReview=true#reviews');
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-honey/15 text-brand-espresso font-bold text-[10px] uppercase tracking-wider hover:bg-brand-honey hover:text-brand-espresso transition shadow-xs"
                              >
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> Rate & Review
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="text-right font-sans">
                          <p className="text-sm font-bold text-brand-espresso">
                            ₹{item.line_total.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-brand-espresso-muted font-semibold mt-0.5">
                            {item.quantity} x ₹{item.unit_price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Invoice and Cost Calculations Summary */}
                <div className="border border-brand-cream-dark/50 rounded-2xl p-5 bg-white space-y-3 shadow-sm">
                  <h4 className="text-xs uppercase font-extrabold tracking-widest text-brand-espresso pb-2 border-b border-brand-cream-light">
                    Pricing Summary
                  </h4>

                  <div className="text-xs space-y-2 font-sans">
                    <div className="flex justify-between text-brand-espresso/70">
                      <span>Items Subtotal:</span>
                      <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    
                    {selectedOrder.payments && selectedOrder.payments.length > 0 && selectedOrder.total_amount < selectedOrder.subtotal && (
                      <div className="flex justify-between text-brand-forest font-bold">
                        <span>Coupon / Promo Discount:</span>
                        <span>-₹{(selectedOrder.subtotal - selectedOrder.total_amount).toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-brand-espresso/70">
                      <span>Shipping and Logistics Fee:</span>
                      <span>₹{selectedOrder.shipping_fee.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm font-bold text-brand-espresso pt-3 border-t border-dashed border-brand-cream-dark/35 font-serif">
                      <span>Grand Total:</span>
                      <span className="text-brand-honey text-base">₹{selectedOrder.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Back button at footer */}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full h-12 bg-brand-espresso text-brand-cream-light font-sans text-xs uppercase tracking-widest font-bold rounded-full hover:bg-brand-espresso/90 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Order History</span>
                </button>
              </div>
            ) : (
              <>
                {/* PERSONAL DETAILS PANEL */}
                {activeTab === "personal" && (
                  <div>
                    <h2 className="font-serif text-xl font-bold mb-1">Personal Details</h2>
                    <p className="text-xs text-brand-espresso-muted mb-6">
                      Maintain your basic details associated with your harvest allocation.
                    </p>

                    {isLoadingProfile ? (
                      <div className="flex py-12 justify-center"><Loader2 className="w-6 h-6 text-brand-honey animate-spin" /></div>
                    ) : (
                      <>
                      <form onSubmit={handleProfileUpdate} className="max-w-xl space-y-6">
                        <div className="space-y-1.5">
                          <label className="text-xs uppercase font-bold tracking-wider text-brand-espresso/70">
                            Email Address (Account Identifier)
                          </label>
                          <input
                            type="email"
                            value={user?.email || ""}
                            disabled
                            className="w-full h-12 px-4 rounded-xl bg-brand-cream-light/80 border border-brand-cream-dark/45 focus:outline-none font-sans text-sm text-brand-espresso/50 cursor-not-allowed"
                          />
                          <p className="text-[11px] text-brand-espresso-muted italic font-sans">Email address is read-only as it maps your secure login token.</p>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="fullName" className="text-xs uppercase font-bold tracking-wider text-brand-espresso/70">
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="fullName"
                            value={profileForm.fullName}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                            className="w-full h-12 px-4 rounded-xl bg-white border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none font-sans text-sm"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="phone" className="text-xs uppercase font-bold tracking-wider text-brand-espresso/70">
                            Contact Phone
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="e.g. +91 9999999999"
                            className="w-full h-12 px-4 rounded-xl bg-white border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none font-sans text-sm"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSaving}
                          className="h-12 px-8 bg-brand-espresso text-brand-cream-light font-sans font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 rounded-full hover:bg-brand-espresso/90 transition-colors disabled:opacity-50"
                        >
                          {isSaving ? "Saving Profiles..." : "Update Registry Record"}
                        </button>
                      </form>

                      <div className="max-w-xl mt-10 pt-8 border-t border-brand-cream-dark/35 space-y-6">
                        <div>
                          <h3 className="font-serif text-lg font-bold">Security</h3>
                          <p className="text-xs text-brand-espresso-muted mt-1">Change your password anytime from here.</p>
                        </div>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                            placeholder="New password"
                            className="w-full h-12 px-4 rounded-xl bg-white border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none font-sans text-sm"
                          />
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="Confirm new password"
                            className="w-full h-12 px-4 rounded-xl bg-white border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none font-sans text-sm"
                          />
                          <button
                            type="submit"
                            disabled={isSaving}
                            className="h-11 px-6 bg-brand-honey text-brand-cream-light font-sans font-bold uppercase tracking-widest text-xs rounded-full hover:bg-brand-honey-dark transition-colors disabled:opacity-50"
                          >
                            Change Password
                          </button>
                        </form>

                        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                          <h3 className="font-serif text-lg font-bold text-red-700">Delete Account</h3>
                          <p className="text-xs text-red-600 mt-2 leading-relaxed">
                            This permanently removes your account and access history. This action cannot be undone.
                          </p>
                          <button
                            type="button"
                            onClick={handleDeleteAccount}
                            disabled={isSaving}
                            className="mt-4 h-11 px-6 border border-red-300 text-red-700 font-sans font-bold uppercase tracking-widest text-xs rounded-full hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            Delete My Account
                          </button>
                        </div>
                      </div>
                      </>
                    )}
                  </div>
                )}

                {/* SAVED ADDRESSES PANEL */}
                {activeTab === "addresses" && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="font-serif text-xl font-bold">Saved Addresses</h2>
                        <p className="text-xs text-brand-espresso-muted mt-1">
                          Configure your saved courier locations for checkout shipping speed.
                        </p>
                      </div>
                      <button
                        onClick={openAddAddress}
                        className="h-10 px-4 bg-brand-espresso text-brand-cream-light font-sans text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 rounded-full hover:bg-brand-espresso/90 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New</span>
                      </button>
                    </div>

                    {isLoadingAddresses ? (
                      <div className="flex py-12 justify-center"><Loader2 className="w-6 h-6 text-brand-honey animate-spin" /></div>
                    ) : addresses.length === 0 ? (
                      <div className="border border-dashed border-brand-cream-dark/70 rounded-2xl p-12 text-center">
                        <MapPin className="w-8 h-8 text-brand-espresso/30 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-brand-espresso/70 mb-1">No Saved Addresses Found</p>
                        <p className="text-xs text-brand-espresso-muted mb-4">Add your shipping destination details to hasten subsequent purchases.</p>
                        <button
                          onClick={openAddAddress}
                          className="px-4 py-2 border border-brand-espresso text-brand-espresso rounded-full font-sans text-[10px] uppercase font-bold tracking-widest hover:bg-brand-cream-warm/40 transition-colors"
                        >
                          Create First Address
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            className={`p-5 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between ${
                              address.is_default
                                ? "bg-brand-cream-warm/25 border-brand-honey shadow-sm"
                                : "bg-white border-brand-cream-dark/50 hover:border-brand-cream-dark"
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-xs uppercase font-extrabold tracking-widest text-brand-honey">
                                  {address.label}
                                </span>
                                {address.is_default && (
                                  <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-brand-honey text-brand-cream-light rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-sm font-medium text-brand-espresso/90 mb-1">
                                {address.line1}
                              </p>
                              {address.line2 && (
                                <p className="text-sm font-medium text-brand-espresso/80 mb-1">
                                  {address.line2}
                                </p>
                              )}
                              <p className="text-xs text-brand-espresso-muted">
                                {address.city}, {address.state} - {address.postal_code}
                              </p>
                              <p className="text-xs text-brand-espresso-muted uppercase tracking-wider mt-0.5">
                                {address.country}
                              </p>
                              <p className="text-xs text-brand-espresso-muted font-mono mt-2">
                                Tel: {address.phone}
                              </p>
                            </div>

                            <div className="flex items-center justify-between border-t border-brand-cream-dark/30 pt-4 mt-5">
                              <button
                                onClick={() => openEditAddress(address)}
                                className="text-xs text-brand-espresso/60 hover:text-brand-espresso font-bold uppercase tracking-wider flex items-center gap-1 hover:underline"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>

                              <div className="flex gap-4">
                                {!address.is_default && (
                                  <button
                                    onClick={() => handleSetDefaultAddress(address.id)}
                                    className="text-[10px] text-brand-honey/80 hover:text-brand-honey font-bold uppercase tracking-wider"
                                  >
                                    Make Default
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteAddress(address.id)}
                                  className="text-xs text-brand-terracotta/75 hover:text-brand-terracotta font-bold uppercase tracking-wider flex items-center gap-0.5"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ADDRESS MODAL FORM */}
                    {isAddressFormOpen && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-brand-espresso/50 backdrop-blur-sm" onClick={() => setIsAddressFormOpen(false)} />
                        
                        <div className="bg-brand-cream-light border border-brand-cream-dark/70 rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto">
                          <h3 className="font-serif text-lg font-bold mb-1">
                            {editingAddress ? "Modify Delivery Address" : "Save New Courier Address"}
                          </h3>
                          <p className="text-xs text-brand-espresso-muted mb-6">
                            Provide clean shipping parameters for secure dispatch logistics.
                          </p>

                          <form onSubmit={handleAddressSubmit} className="space-y-4 font-sans">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-xs uppercase font-bold tracking-wider text-brand-espresso/70">
                                  Address Label
                                </label>
                                <input
                                  type="text"
                                  value={addressForm.label}
                                  onChange={(e) => setAddressForm(prev => ({ ...prev, label: e.target.value }))}
                                  placeholder="e.g. Home, Office"
                                  className="w-full h-11 px-4 rounded-xl border border-brand-cream-dark bg-white focus:border-brand-honey focus:outline-none text-sm"
                                  required
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs uppercase font-bold tracking-wider text-brand-espresso/70">
                                  Delivery Phone
                                </label>
                                <input
                                  type="tel"
                                  value={addressForm.phone}
                                  onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                                  placeholder="Phone number"
                                  className="w-full h-11 px-4 rounded-xl border border-brand-cream-dark bg-white focus:border-brand-honey focus:outline-none text-sm"
                                  required
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs uppercase font-bold tracking-wider text-brand-espresso/70">
                                Address Line 1
                              </label>
                              <input
                                type="text"
                                value={addressForm.line1}
                                onChange={(e) => setAddressForm(prev => ({ ...prev, line1: e.target.value }))}
                                placeholder="Flat/House no., Building, Street Name"
                                className="w-full h-11 px-4 rounded-xl border border-brand-cream-dark bg-white focus:border-brand-honey focus:outline-none text-sm"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs uppercase font-bold tracking-wider text-brand-espresso/70">
                                Address Line 2 (Optional)
                              </label>
                              <input
                                type="text"
                                value={addressForm.line2}
                                onChange={(e) => setAddressForm(prev => ({ ...prev, line2: e.target.value }))}
                                placeholder="Area, Locality, Landmark"
                                className="w-full h-11 px-4 rounded-xl border border-brand-cream-dark bg-white focus:border-brand-honey focus:outline-none text-sm"
                              />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-xs uppercase font-bold tracking-wider text-brand-espresso/70">
                                  City
                                </label>
                                <input
                                  type="text"
                                  value={addressForm.city}
                                  onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                                  className="w-full h-11 px-4 rounded-xl border border-brand-cream-dark bg-white focus:border-brand-honey focus:outline-none text-sm"
                                  required
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs uppercase font-bold tracking-wider text-brand-espresso/70">
                                  State
                                </label>
                                <input
                                  type="text"
                                  value={addressForm.state}
                                  onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                                  className="w-full h-11 px-4 rounded-xl border border-brand-cream-dark bg-white focus:border-brand-honey focus:outline-none text-sm"
                                  required
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs uppercase font-bold tracking-wider text-brand-espresso/70">
                                  Postal Code
                                </label>
                                <input
                                  type="text"
                                  value={addressForm.postal_code}
                                  onChange={(e) => setAddressForm(prev => ({ ...prev, postal_code: e.target.value }))}
                                  className="w-full h-11 px-4 rounded-xl border border-brand-cream-dark bg-white focus:border-brand-honey focus:outline-none text-sm"
                                  required
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs uppercase font-bold tracking-wider text-brand-espresso/70">
                                Country
                              </label>
                              <input
                                type="text"
                                value={addressForm.country}
                                onChange={(e) => setAddressForm(prev => ({ ...prev, country: e.target.value }))}
                                className="w-full h-11 px-4 rounded-xl border border-brand-cream-dark bg-white focus:border-brand-honey focus:outline-none text-sm"
                                required
                              />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                              <input
                                type="checkbox"
                                id="is_default"
                                checked={addressForm.is_default}
                                onChange={(e) => setAddressForm(prev => ({ ...prev, is_default: e.target.checked }))}
                                className="w-4 h-4 rounded text-brand-honey focus:ring-brand-honey accent-brand-honey"
                                disabled={editingAddress?.is_default}
                              />
                              <label htmlFor="is_default" className="text-xs text-brand-espresso/80 font-medium">
                                Set as default delivery address
                              </label>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-brand-cream-dark/30 mt-6">
                              <button
                                type="button"
                                onClick={() => setIsAddressFormOpen(false)}
                                className="flex-1 h-12 border border-brand-cream-dark/80 text-brand-espresso font-sans text-xs uppercase tracking-widest font-bold rounded-full hover:bg-brand-cream-warm/40 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 h-12 bg-brand-espresso text-brand-cream-light font-sans text-xs uppercase tracking-widest font-bold rounded-full hover:bg-brand-espresso/90 transition-colors disabled:opacity-50"
                              >
                                {isSaving ? "Saving..." : "Save Address"}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ORDER HISTORY PANEL */}
                {activeTab === "orders" && (
                  <div>
                    <h2 className="font-serif text-xl font-bold mb-1">Order History</h2>
                    <p className="text-xs text-brand-espresso-muted mb-6">
                      Review your allocation and courier records of vintage batches.
                    </p>

                    {isLoadingOrders ? (
                      <div className="flex py-12 justify-center"><Loader2 className="w-6 h-6 text-brand-honey animate-spin" /></div>
                    ) : orders.length === 0 ? (
                      <div className="border border-dashed border-brand-cream-dark/70 rounded-2xl p-12 text-center">
                        <Package className="w-8 h-8 text-brand-espresso/30 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-brand-espresso/70 mb-1">No Orders Recorded</p>
                        <p className="text-xs text-brand-espresso-muted mb-4">You have not completed any VAN vintage honey purchases yet.</p>
                        <Link
                          href="/#shop"
                          className="px-5 py-2.5 bg-brand-espresso text-brand-cream-light rounded-full inline-block font-sans text-[10px] uppercase font-bold tracking-widest hover:bg-brand-espresso/90 transition-colors"
                        >
                          Browse Batches
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => {
                          const firstItem = order.order_items[0];
                          const remainingItemsCount = order.order_items.length - 1;

                          return (
                            <div
                              key={order.id}
                              onClick={() => setSelectedOrder(order)}
                              className="bg-white border border-brand-cream-dark/50 hover:border-brand-honey rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                            >
                              {/* Left side: Item Details & Image */}
                              <div className="flex items-center gap-4 w-full sm:w-auto">
                                {/* Thumbnail Image */}
                                <div className="w-16 h-16 bg-brand-cream-light rounded-xl border border-brand-cream-dark/30 flex items-center justify-center shrink-0 relative overflow-hidden p-1 group-hover:scale-105 transition-transform">
                                  <Image
                                    src={getProductImage(firstItem)}
                                    alt={firstItem?.product_name_snapshot || "Product image"}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-contain"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <h4 className="font-serif text-sm font-bold text-brand-espresso leading-snug group-hover:text-brand-honey transition-colors">
                                    {firstItem ? firstItem.product_name_snapshot : "Raw Wild Forest Honey"}
                                  </h4>
                                  <p className="text-xs text-brand-espresso-muted">
                                    Size: {firstItem ? firstItem.variant_label_snapshot : "500g"}
                                    {remainingItemsCount > 0 && ` (+${remainingItemsCount} more item${remainingItemsCount > 1 ? "s" : ""})`}
                                  </p>
                                  <div className="flex items-center gap-2 text-[10px] text-brand-espresso-muted">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>
                                      Ordered on {new Date(order.created_at).toLocaleDateString("en-IN", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Right side: Price & Status */}
                              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-cream-light gap-2">
                                <p className="font-sans font-extrabold text-brand-espresso text-sm sm:text-base">
                                  ₹{order.total_amount.toFixed(2)}
                                </p>
                                
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push('/catalogue/raw-wildflower-honey?writeReview=true#reviews');
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-brand-honey/15 text-brand-espresso font-bold text-[9px] uppercase tracking-wider hover:bg-brand-honey transition flex items-center gap-1 shadow-xs"
                                  >
                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> Rate & Review
                                  </button>
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                                      order.status === "paid" || order.status === "delivered"
                                        ? "bg-brand-forest/10 text-brand-forest"
                                        : order.status === "pending"
                                        ? "bg-brand-honey/10 text-brand-honey"
                                        : "bg-brand-terracotta/10 text-brand-terracotta"
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                  <ChevronRight className="w-4 h-4 text-brand-espresso/40 group-hover:text-brand-honey group-hover:translate-x-1 transition-all" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* MY REVIEWS PANEL */}
                {activeTab === "reviews" && (
                  <div>
                    <h2 className="font-serif text-xl font-bold mb-1">My Posted Reviews</h2>
                    <p className="text-xs text-brand-espresso-muted mb-6">
                      View, update, or remove your customer ratings and feedback for Van Basket products.
                    </p>

                    {isLoadingReviews ? (
                      <div className="flex py-12 justify-center">
                        <Loader2 className="w-6 h-6 text-brand-honey animate-spin" />
                      </div>
                    ) : userReviews.length === 0 ? (
                      <div className="border border-dashed border-brand-cream-dark/70 rounded-2xl p-12 text-center">
                        <Star className="w-8 h-8 text-brand-espresso/30 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-brand-espresso/70 mb-1">No Reviews Posted Yet</p>
                        <p className="text-xs text-brand-espresso-muted mb-4">
                          You have not posted any product reviews yet.
                        </p>
                        <Link
                          href="/#shop"
                          className="px-5 py-2.5 bg-brand-espresso text-brand-cream-light rounded-full inline-block font-sans text-[10px] uppercase font-bold tracking-widest hover:bg-brand-honey hover:text-brand-espresso transition-colors"
                        >
                          Explore & Rate Products
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userReviews.map((review) => {
                          const productName = review.products?.name || "Raw Wild Forest Honey";
                          const isLongText = review.comment.length > 200;
                          const isExpanded = expandedUserReviews[review.id];
                          const displayComment =
                            isLongText && !isExpanded
                              ? `${review.comment.slice(0, 200)}...`
                              : review.comment;

                          return (
                            <div
                              key={review.id}
                              className="bg-white border border-brand-cream-dark/60 rounded-2xl p-5 shadow-sm space-y-3"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-brand-cream-light rounded-xl border border-brand-cream-dark/40 overflow-hidden flex items-center justify-center p-1 shrink-0">
                                    <Image
                                      src="/assets/product-jar-1.png"
                                      alt={productName}
                                      width={48}
                                      height={48}
                                      className="object-contain"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-sm text-brand-espresso">{productName}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                                        <span>{review.rating}</span>
                                        <Star className="w-2.5 h-2.5 fill-current" />
                                      </span>
                                      <span className="text-[10px] text-brand-espresso/50">
                                        Posted on {new Date(review.created_at).toLocaleDateString("en-IN")}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => openEditProfileReviewModal(review)}
                                    className="p-2 rounded-lg bg-brand-cream-light/60 hover:bg-brand-espresso hover:text-white transition text-brand-espresso/70"
                                    title="Edit Review"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProfileReview(review.id)}
                                    className="p-2 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white transition text-rose-600"
                                    title="Delete Review"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {review.title && (
                                <h5 className="font-bold text-xs text-brand-espresso">{review.title}</h5>
                              )}

                              <p className="text-xs text-brand-espresso/80 leading-relaxed">
                                {displayComment}
                              </p>

                              {isLongText && (
                                <button
                                  onClick={() =>
                                    setExpandedUserReviews((prev) => ({
                                      ...prev,
                                      [review.id]: !prev[review.id],
                                    }))
                                  }
                                  className="text-[11px] font-bold text-brand-honey hover:underline inline-block mt-1"
                                >
                                  {isExpanded ? "Read Less" : "Read More"}
                                </button>
                              )}

                              {review.image_url && (
                                <div className="pt-2">
                                  <div className="relative w-16 h-16 rounded-xl border border-brand-cream-dark/60 overflow-hidden">
                                    <Image
                                      src={review.image_url}
                                      alt="Attached photo"
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Profile Review Edit Modal */}
            {editingProfileReview && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-espresso/60 backdrop-blur-sm animate-fade-in">
                <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-brand-cream-dark">
                  <button
                    onClick={() => setEditingProfileReview(null)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-brand-cream-light text-brand-espresso/60"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h3 className="font-serif text-xl font-bold text-brand-espresso mb-4">
                    Update Your Review
                  </h3>

                  <form onSubmit={handleUpdateProfileReview} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-espresso/70 mb-1">
                        Rating
                      </label>
                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewFormRating(star)}
                            className="p-1 hover:scale-110 transition"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= reviewFormRating ? "fill-amber-400" : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-espresso/70 mb-1">
                        Headline Title
                      </label>
                      <input
                        type="text"
                        value={reviewFormTitle}
                        onChange={(e) => setReviewFormTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-brand-cream-dark text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-espresso/70 mb-1">
                        Review Comment *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={reviewFormComment}
                        onChange={(e) => setReviewFormComment(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-brand-cream-dark text-xs"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-brand-cream-dark/30">
                      <button
                        type="button"
                        onClick={() => setEditingProfileReview(null)}
                        className="px-4 py-2 rounded-xl border border-brand-cream-dark text-xs font-bold uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-5 py-2 rounded-xl bg-brand-espresso text-white text-xs font-bold uppercase tracking-wider hover:bg-brand-honey transition"
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
