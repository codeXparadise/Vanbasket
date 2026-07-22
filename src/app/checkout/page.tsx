"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  Check,
  CreditCard,
  Lock,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { LottiePlayer } from "@/components/LottiePlayer";


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
  created_at: string;
}

interface OrderResult {
  id: string;
  order_number: string;
  total_amount: number;
  currency: string;
  status: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [supabase] = useState(() => createClient());

  const [activeStep, setActiveStep] = useState(0); // 0: Shipping, 1: Payment, 2: Review, 3: Success
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  
  const [orderWriteResult, setOrderWriteResult] = useState<OrderResult | null>(null);
  
  interface RazorpayOrderData {
    order_id: string;
    amount: number;
    currency: string;
    receipt: string;
    db_order_id: string;
    order_number: string;
  }
  
  const [razorpayOrderData, setRazorpayOrderData] = useState<RazorpayOrderData | null>(null);
  
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  
  // General errors
  const [error, setError] = useState<string | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const { data, error: couponErr } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (couponErr || !data) {
        setCouponError("Invalid coupon code.");
        setDiscountAmount(0);
        setAppliedCoupon(null);
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setCouponError("Coupon code has expired.");
        setDiscountAmount(0);
        setAppliedCoupon(null);
        return;
      }

      if (cartTotal < Number(data.min_order_amount)) {
        setCouponError(`Min order total required: ₹${Number(data.min_order_amount).toFixed(2)}.`);
        setDiscountAmount(0);
        setAppliedCoupon(null);
        return;
      }

      let calcDiscount = 0;
      if (data.discount_type === "percentage") {
        calcDiscount = (cartTotal * Number(data.discount_value)) / 100;
      } else {
        calcDiscount = Number(data.discount_value);
      }

      if (calcDiscount > cartTotal) {
        calcDiscount = cartTotal;
      }

      setDiscountAmount(calcDiscount);
      setAppliedCoupon(data);
      setCouponSuccess(`Coupon applied successfully!`);
    } catch {
      setCouponError("Failed to apply coupon.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponError(null);
    setCouponSuccess(null);
  };

  // Address form fields
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "IN",
    phone: "",
  });

  const fetchAddresses = useCallback(async (userId: string) => {
    const { data, error: fetchErr } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!fetchErr && data) {
      setAddresses(data);
      if (data.length > 0) {
        // Set default or first address as selected
        const defaultAddress = data.find((addr) => addr.is_default) || data[0];
        setSelectedAddressId(defaultAddress.id);
        setIsAddingNewAddress(false);
      } else {
        setIsAddingNewAddress(true);
      }
    }
  }, [supabase]);

  // 1. Auth check and address load
  useEffect(() => {
    const initCheckout = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
          return;
        }

        setUser(authUser);
        await fetchAddresses(authUser.id);
      } catch (err) {
        console.error("initCheckout error:", err);
        setError("Failed to load checkout settings.");
      } finally {
        setIsLoadingAuth(false);
      }
    };
    initCheckout();
  }, [router, supabase, fetchAddresses]);

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoadingAction(true);
    setError(null);

    const normalizedPhone = addressForm.phone.trim();
    const normalizedPostalCode = addressForm.postalCode.trim();

    if (!/^[+()0-9\s-]{7,20}$/.test(normalizedPhone)) {
      setError("Please enter a valid delivery phone number.");
      setIsLoadingAction(false);
      return;
    }

    if (!/^[A-Za-z0-9\s-]{3,12}$/.test(normalizedPostalCode)) {
      setError("Please enter a valid postal code.");
      setIsLoadingAction(false);
      return;
    }

    const payload = {
      user_id: user.id,
      label: addressForm.label.trim(),
      line1: addressForm.line1.trim(),
      line2: addressForm.line2.trim() || null,
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      postal_code: normalizedPostalCode,
      country: addressForm.country.trim(),
      phone: normalizedPhone,
      is_default: addresses.length === 0,
    };

    try {
      let result;
      if (editingAddressId) {
        result = await supabase
          .from("addresses")
          .update(payload)
          .eq("id", editingAddressId)
          .select();
      } else {
        result = await supabase
          .from("addresses")
          .insert(payload)
          .select();
      }

      if (result.error) {
        setError(result.error.message);
        setIsLoadingAction(false);
        return;
      }

      if (result.data && result.data.length > 0) {
        const savedAddress = result.data[0];

        await fetchAddresses(user.id);
        setSelectedAddressId(savedAddress.id);
        setIsAddingNewAddress(false);
        setEditingAddressId(null);
        
        // Reset form
        setAddressForm({
          label: "Home",
          line1: "",
          line2: "",
          city: "",
          state: "",
          postalCode: "",
          country: "IN",
          phone: "",
        });

        setActiveStep(1);
      }
    } catch {
      setError("An unexpected error occurred saving the address.");
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleEditAddress = (address: Address) => {
    setAddressForm({
      label: address.label || "Home",
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: address.country,
      phone: address.phone,
    });
    setEditingAddressId(address.id);
    setIsAddingNewAddress(true);
  };

  const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    setIsLoadingAction(true);
    setError(null);
    try {
      const { error: delErr } = await supabase.from("addresses").delete().eq("id", id);
      if (delErr) {
        setError(delErr.message);
      } else {
        await fetchAddresses(user.id);
      }
    } catch {
      setError("Failed to delete address.");
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddressId) return;
    setIsLoadingAction(true);
    setError(null);

    try {
      // 1. Load Razorpay Checkout Script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Failed to load payment gateway script. Please check your internet connection.");
        setIsLoadingAction(false);
        return;
      }

      let orderData = razorpayOrderData;

      // 2. Create Order Backend Call if not already created
      if (!orderData) {
        const response = await fetch("/api/payment/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cartItems: cartItems.map((item) => ({ id: item.id, quantity: item.quantity })),
            shippingAddressId: selectedAddressId,
            couponCode: appliedCoupon ? appliedCoupon.code : null,
          }),
        });

        const resData = await response.json();

        if (!response.ok) {
          setError(resData.error || "Failed to initiate payment order.");
          setIsLoadingAction(false);
          return;
        }

        orderData = resData;
        setRazorpayOrderData(resData);
      }

      if (!orderData) {
        setError("Failed to initialize payment order details.");
        setIsLoadingAction(false);
        return;
      }

      // 3. Find address details to prefill Razorpay popup
      const currentAddress = addresses.find((addr) => addr.id === selectedAddressId);

      // Fetch user profile name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      // 4. Open Razorpay checkout popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_T6F3LtF1tbHeC4",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Van Basket",
        description: "Premium Wildflower Honey Harvest",
        image: "/assets/logo-new.jpg",
        order_id: orderData.order_id,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          setIsLoadingAction(true);
          setError(null);
          try {
            // Verify payment
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              setError(verifyData.error || "Payment verification failed.");
              setActiveStep(4);
              return;
            }

            if (verifyData.success) {
              setOrderWriteResult({
                id: orderData.db_order_id,
                order_number: orderData.order_number,
                total_amount: orderData.amount / 100, // convert back to rupees
                currency: orderData.currency,
                status: "paid",
              });
              clearCart();
              setActiveStep(3);
            }
          } catch {
            setError("Network error verifying payment. Rest assured, your order is secured and we will verify it shortly.");
            setActiveStep(4);
          } finally {
            setIsLoadingAction(false);
          }
        },
        prefill: {
          name: profile?.full_name || "",
          email: user.email || "",
          contact: currentAddress?.phone || "",
        },
        notes: {
          db_order_id: orderData.db_order_id,
        },
        theme: {
          color: "#c07a12", // brand-honey color
        },
        modal: {
          ondismiss: function () {
            setError("Payment cancelled/popup closed. You can retry paying.");
            setActiveStep(4);
            setIsLoadingAction(false);
          },
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rzp.on("payment.failed", function (response: any) {
        console.error("Payment failed popup callback:", response.error);
        setError(`Payment failed: ${response.error.description || "Verification issue"}`);
        setActiveStep(4);
        setIsLoadingAction(false);
      });
      rzp.open();
    } catch (err: unknown) {
      console.error("Error setting up payment popup:", err);
      setError("Failed to open payment gateway. Please try again.");
      setIsLoadingAction(false);
    }
  };

  const handleCancelOrder = () => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([100]); // 100ms haptic vibration for Android users
    }
    setRazorpayOrderData(null);
    setError("Checkout cancelled. Returning to shop homepage.");
    setTimeout(() => {
      router.push("/");
    }, 1500);
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-brand-cream-light text-brand-espresso px-6 md:px-12 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 w-28 rounded-lg bg-brand-cream-dark/40 skeleton-shimmer mb-10" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-6">
              <div className="h-8 w-80 max-w-full rounded-lg bg-brand-cream-dark/40 skeleton-shimmer" />
              <div className="h-40 rounded-2xl bg-brand-cream-warm/70 skeleton-shimmer" />
              <div className="h-64 rounded-2xl bg-brand-cream-warm/60 skeleton-shimmer" />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="h-72 rounded-2xl bg-brand-cream-warm/70 skeleton-shimmer" />
              <div className="h-12 rounded-xl bg-brand-cream-dark/30 skeleton-shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Checkout empty state
  if (cartItems.length === 0 && activeStep < 3) {
    return (
      <div className="min-h-screen bg-brand-cream-light text-brand-espresso flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 w-32 h-10 relative">
          <Image src="/assets/logo.svg" alt="VAN" fill sizes="128px" className="object-contain" />
        </div>
        <h1 className="font-serif text-2xl font-bold mb-2">Your checkout is empty</h1>
        <p className="font-sans text-xs text-brand-espresso-muted mb-6 max-w-sm">
          Please add wildflower honey variants to your selection before checking out.
        </p>
        <Link
          href="/#shop"
          className="px-8 py-4 bg-brand-espresso text-brand-cream-light font-sans font-bold uppercase tracking-[0.2em] text-xs rounded-full hover:bg-brand-espresso/90 transition-all duration-300"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const steps = ["Shipping", "Payment", "Review"];

  return (
    <div className="min-h-screen bg-brand-cream-light text-brand-espresso flex flex-col relative">
      {/* Custom processing loader overlay */}
      {isLoadingAction && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-espresso/35 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-brand-cream-light border border-brand-cream-dark/60 p-8 sm:p-10 rounded-[32px] shadow-2xl flex flex-col items-center space-y-6 max-w-sm mx-4 text-center animate-scale-pop">
            {/* Custom dripping honey loader */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full rounded-tr-none bg-brand-honey rotate-[45deg] animate-pulse" />
              <div className="absolute w-2.5 h-3.5 rounded-full bg-brand-honey animate-honey-drip" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-base font-bold text-brand-espresso">Securing allocation...</h3>
              <p className="font-sans text-xs text-brand-espresso-muted leading-relaxed">
                Please do not close this window or refresh the page. We are securely processing your request.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mini Checkout Header */}
      <header className="py-6 border-b border-brand-cream-dark/50 bg-brand-cream-light/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link href="/" className="h-8 w-24 relative text-brand-espresso" aria-label="Go back to homepage">
            <Image src="/assets/logo.svg" alt="VAN" fill sizes="96px" className="object-contain" />
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-xs font-sans text-brand-espresso/60 hidden sm:inline">
              Authenticated: <span className="font-semibold text-brand-espresso">{user?.email}</span>
            </span>
            <div className="flex items-center space-x-2 text-xs font-sans text-brand-forest">
              <Lock className="w-3.5 h-3.5" />
              <span className="uppercase tracking-widest font-semibold">Secure SSL</span>
            </div>
          </div>
        </div>
      </header>

      {activeStep === 3 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 max-w-2xl mx-auto text-center space-y-8 animate-scale-pop">
          <div className="h-40 w-40 max-w-full mx-auto relative">
            <LottiePlayer
              src="/lottie/Order completed.lottie"
              label="Successful Payment Animation"
              className="w-full h-full"
            />
          </div>
          
          <div className="space-y-3">
            <p className="text-xs font-sans uppercase tracking-[0.3em] text-brand-forest font-bold">
               Order Confirmed
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-black leading-tight text-brand-espresso">
              Your harvest is reserved.
            </h1>
            <p className="font-sans text-sm text-brand-espresso-muted max-w-md mx-auto leading-relaxed">
              We have verified your payment signature and reserved the selected jars. The order is linked to <span className="font-semibold text-brand-espresso">{user?.email}</span>.
            </p>
          </div>

          {orderWriteResult && (
            <div className="p-6 bg-brand-cream-warm/50 rounded-2xl border border-brand-cream-dark/80 text-left w-full space-y-4 shadow-sm">
              <h3 className="font-serif font-bold text-base text-brand-espresso border-b border-brand-cream-dark/60 pb-3">
                Order Placement Invoice
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs font-sans text-brand-espresso/80">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-espresso-muted mb-1">Order ID</p>
                  <p className="font-mono font-semibold select-all text-brand-honey">{orderWriteResult.id}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-espresso-muted mb-1">Order Number</p>
                  <p className="font-semibold">{orderWriteResult.order_number}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-espresso-muted mb-1">Order Total</p>
                  <p className="font-semibold">{orderWriteResult.currency} {Number(orderWriteResult.total_amount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-espresso-muted mb-1">Status</p>
                  <p className="font-semibold uppercase text-brand-forest">{orderWriteResult.status}</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4">
            <Link
              href="/"
              className="px-10 py-5 bg-brand-espresso text-brand-cream-light font-sans font-bold uppercase tracking-[0.2em] text-xs rounded-full hover:bg-brand-honey hover:text-brand-espresso transition-all duration-300 shadow-md"
            >
              Continue Journey
            </Link>
          </div>
        </div>
      ) : activeStep === 4 ? (
        /* Failure / Sad Screen */
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 max-w-xl mx-auto text-center space-y-8 animate-scale-pop">
          <div className="h-36 w-36 max-w-full mx-auto">
            <LottiePlayer
              src="/lottie/Error animation.lottie"
              label="Payment Failed Animation"
              className="w-full h-full"
            />
          </div>


          <div className="space-y-3">
            <p className="text-xs font-sans uppercase tracking-[0.3em] text-brand-terracotta font-semibold">
              Payment Unsuccessful
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-black leading-tight text-brand-espresso">
              Reserve Transaction Failed.
            </h1>
            <p className="font-sans text-xs sm:text-sm text-brand-espresso-muted max-w-md mx-auto leading-relaxed">
              {error || "We could not complete payment verification. Please check card limits or connection parameters and try again."}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={handlePlaceOrder}
              className="px-8 py-4 bg-brand-honey hover:bg-brand-honey-dark text-brand-cream-light font-sans font-bold uppercase tracking-wider text-xs rounded-full shadow-md transition-all duration-300 cursor-pointer focus:outline-none"
            >
              Retry Payment
            </button>
            <button
              onClick={() => {
                setError(null);
                setActiveStep(2); // Go back to review
              }}
              className="px-8 py-4 border border-brand-espresso text-brand-espresso hover:bg-brand-cream-warm/45 font-sans font-bold uppercase tracking-wider text-xs rounded-full transition-all duration-300 cursor-pointer focus:outline-none"
            >
              Modify Order & Review
            </button>
          </div>
        </div>
      ) : (
        /* Regular checkout flow */        <div className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Mobile Collapsible Order Summary */}
          <div className="lg:hidden col-span-1 bg-white/50 backdrop-blur-md border border-brand-cream-dark/60 rounded-[28px] p-5 shadow-sm space-y-4">
            <button
              type="button"
              onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
              className="w-full flex items-center justify-between text-xs font-sans font-bold uppercase tracking-wider text-brand-espresso"
            >
              <span className="flex items-center gap-2">
                Order Summary (₹{(cartTotal - discountAmount).toFixed(2)})
              </span>
              <span className="flex items-center gap-1 text-[10px] text-brand-honey font-bold">
                {isSummaryExpanded ? (
                  <>Hide Details <ChevronUp className="w-3.5 h-3.5" /></>
                ) : (
                  <>Show Details <ChevronDown className="w-3.5 h-3.5" /></>
                )}
              </span>
            </button>
            
            {isSummaryExpanded && (
              <div className="pt-4 border-t border-brand-cream-dark/40 space-y-4 animate-scale-in">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-10 h-10 rounded-lg bg-brand-cream-warm border border-brand-cream-dark/50 overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill sizes="40px" className="object-cover" />
                      </div>
                      <div>
                        <h4 className="font-serif text-[11px] font-bold text-brand-espresso truncate max-w-[150px]">
                          {item.name}
                        </h4>
                        <p className="font-sans text-[9px] text-brand-espresso-muted">
                          Qty: {item.quantity} • {item.variant}
                        </p>
                      </div>
                    </div>
                    <span className="font-serif text-xs font-semibold text-brand-espresso">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs font-sans text-brand-forest font-semibold">
                    <span>Promo Discount</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-brand-cream-dark/30 pt-3 flex justify-between text-xs font-sans text-brand-espresso-muted">
                  <span>Shipping</span>
                  <span className="text-brand-forest uppercase font-bold text-[10px]">Complimentary</span>
                </div>
              </div>
            )}
          </div>

          {/* Left Column (7 Cols) */}
          <div className="col-span-1 lg:col-span-7 space-y-8">
            {/* Step Wizard Tracker */}
            <nav className="flex items-center space-x-3 sm:space-x-8 border-b border-brand-cream-dark/40 pb-5" aria-label="Checkout Progress">
              {steps.map((step, index) => {
                const isActive = activeStep === index;
                const isCompleted = activeStep > index;
                return (
                  <div key={step} className="flex items-center space-x-2 sm:space-x-4">
                    <span
                      className={`w-6 h-6 rounded-full font-sans text-[10px] font-bold flex items-center justify-center border transition-all duration-300 ${
                        isCompleted
                          ? "bg-brand-forest border-brand-forest text-brand-cream-light"
                          : isActive
                          ? "bg-brand-honey border-brand-honey text-brand-cream-light"
                          : "bg-brand-cream-light border-brand-cream-dark/80 text-brand-espresso/60"
                      }`}
                    >
                      {isCompleted ? <Check className="w-3 h-3" /> : index + 1}
                    </span>
                    <span
                      className={`text-[10px] sm:text-xs font-sans font-bold uppercase tracking-widest ${
                        isActive ? "text-brand-espresso" : "text-brand-espresso/45"
                      }`}
                    >
                      {step}
                    </span>
                    {index < steps.length - 1 && (
                      <ChevronRight className="w-3 h-3 text-brand-espresso/20" />
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Error notifications */}
            {error && (
              <div className="p-4 bg-brand-terracotta/10 border border-brand-terracotta/30 text-brand-terracotta text-xs rounded-xl flex items-center gap-3 animate-scale-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 0: Shipping Selection / Addition */}
            {activeStep === 0 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-espresso">
                    Shipping Destination
                  </h2>
                  {!isAddingNewAddress && addresses.length > 0 && (
                    <button
                      onClick={() => {
                        setEditingAddressId(null);
                        setIsAddingNewAddress(true);
                      }}
                      className="text-xs font-sans font-bold uppercase tracking-wider text-brand-honey flex items-center gap-1 hover:text-brand-honey-dark"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Address
                    </button>
                  )}
                </div>

                {isAddingNewAddress ? (
                  /* Address addition/edit form */
                  <form onSubmit={handleAddressSubmit} className="space-y-5 bg-white/50 backdrop-blur-md p-6 sm:p-8 rounded-[28px] border border-brand-cream-dark/60 shadow-sm animate-scale-in">
                    <h3 className="font-serif font-bold text-sm text-brand-espresso">
                      {editingAddressId ? "Edit Address Details" : "Enter New Delivery Address"}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="label" className="text-[10px] uppercase tracking-widest text-brand-espresso font-bold">Address Label</label>
                        <input
                          type="text"
                          id="label"
                          value={addressForm.label}
                          onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                          className="w-full h-12 px-4 rounded-xl bg-brand-cream-light border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none font-sans text-xs focus:ring-1 focus:ring-brand-honey transition-all"
                          placeholder="e.g. Home, Work"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="phone" className="text-[10px] uppercase tracking-widest text-brand-espresso font-bold">Delivery Phone</label>
                        <input
                          type="tel"
                          id="phone"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          className="w-full h-12 px-4 rounded-xl bg-brand-cream-light border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none font-sans text-xs focus:ring-1 focus:ring-brand-honey transition-all"
                          placeholder="Contact phone"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="line1" className="text-[10px] uppercase tracking-widest text-brand-espresso font-bold">Address Line 1</label>
                      <input
                        type="text"
                        id="line1"
                        value={addressForm.line1}
                        onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                        className="w-full h-12 px-4 rounded-xl bg-brand-cream-light border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none font-sans text-xs focus:ring-1 focus:ring-brand-honey transition-all"
                        placeholder="Street Address, P.O. box"
                        required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="line2" className="text-[10px] uppercase tracking-widest text-brand-espresso font-bold">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    id="line2"
                    value={addressForm.line2}
                    onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-brand-cream-light border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none font-sans text-xs focus:ring-1 focus:ring-brand-honey transition-all"
                    placeholder="Apartment, suite, unit, building"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label htmlFor="city" className="text-[10px] uppercase tracking-widest text-brand-espresso font-bold">City</label>
                    <input
                      type="text"
                      id="city"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl bg-brand-cream-light border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none font-sans text-xs focus:ring-1 focus:ring-brand-honey transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="state" className="text-[10px] uppercase tracking-widest text-brand-espresso font-bold">State</label>
                    <input
                      type="text"
                      id="state"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl bg-brand-cream-light border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none font-sans text-xs focus:ring-1 focus:ring-brand-honey transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="postalCode" className="text-[10px] uppercase tracking-widest text-brand-espresso font-bold">Postal Code</label>
                    <input
                      type="text"
                      id="postalCode"
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl bg-brand-cream-light border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none font-sans text-xs focus:ring-1 focus:ring-brand-honey transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="country" className="text-[10px] uppercase tracking-widest text-brand-espresso font-bold">Country</label>
                    <input
                      type="text"
                      id="country"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl bg-brand-cream-light border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none font-sans text-xs focus:ring-1 focus:ring-brand-honey transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isLoadingAction}
                    className="h-12 px-6 bg-brand-espresso text-brand-cream-light font-sans font-bold uppercase tracking-wider text-[10px] rounded-full hover:bg-brand-espresso/90 flex items-center gap-2 cursor-pointer focus:outline-none"
                  >
                    {isLoadingAction ? "Saving..." : "Save Address & Continue"}
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewAddress(false);
                        setEditingAddressId(null);
                      }}
                      className="h-12 px-6 border border-brand-cream-dark/80 text-brand-espresso font-sans font-semibold uppercase tracking-wider text-[10px] rounded-full hover:bg-brand-cream-warm/30 focus:outline-none"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : (
              /* Saved addresses list */
              <div className="space-y-4 bg-white/50 backdrop-blur-md p-6 sm:p-8 rounded-[28px] border border-brand-cream-dark/60 shadow-sm animate-scale-in">
                <p className="text-xs text-brand-espresso-muted">Select an address for delivery:</p>
                <div className="grid grid-cols-1 gap-4">
                  {addresses.map((address) => {
                    const isSelected = selectedAddressId === address.id;
                    return (
                      <div
                        key={address.id}
                        onClick={() => setSelectedAddressId(address.id)}
                        className={`p-5 rounded-2xl border text-xs font-sans flex items-start justify-between cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? "bg-brand-cream-warm/40 border-brand-honey shadow-sm"
                            : "bg-brand-cream-light border-brand-cream-dark/80 hover:border-brand-espresso"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <MapPin className={`w-4 h-4 mt-0.5 ${isSelected ? "text-brand-honey" : "text-brand-espresso/45"}`} />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold uppercase tracking-wider text-[10px] text-brand-espresso">
                                {address.label || "Address"}
                              </span>
                              {address.is_default && (
                                <span className="bg-brand-forest/15 text-brand-forest text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-brand-espresso-muted leading-relaxed mt-1">
                              {address.line1}
                              {address.line2 && `, ${address.line2}`}
                              <br />
                              {address.city}, {address.state} {address.postal_code}, {address.country}
                              <br />
                              Phone: {address.phone}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(address);
                            }}
                            className="p-2 hover:bg-brand-cream-warm rounded-full text-brand-espresso/60 hover:text-brand-espresso"
                            aria-label="Edit address"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteAddress(address.id, e)}
                            className="p-2 hover:bg-brand-cream-warm rounded-full text-brand-espresso/40 hover:text-brand-terracotta"
                            aria-label="Delete address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setActiveStep(1)}
                    disabled={!selectedAddressId}
                    className="w-full h-14 bg-brand-espresso text-brand-cream-light font-sans font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center rounded-full hover:bg-brand-espresso/90 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 1: Payment Method */}
        {activeStep === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setActiveStep(2);
            }}
            className="space-y-6 bg-white/50 backdrop-blur-md p-6 sm:p-8 rounded-[28px] border border-brand-cream-dark/60 shadow-sm animate-scale-in"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-espresso">
                Payment Method
              </h2>
              <button
                type="button"
                onClick={() => setActiveStep(0)}
                className="text-xs font-sans font-bold uppercase tracking-wider text-brand-espresso/60 flex items-center gap-1.5 hover:text-brand-espresso cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            <div className="p-5 bg-brand-cream-warm/35 rounded-2xl border border-brand-cream-dark/60 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-brand-honey/10 flex items-center justify-center text-brand-honey">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-brand-espresso">Razorpay Secure Checkout</h4>
                  <p className="font-sans text-[10px] text-brand-espresso-muted leading-relaxed mt-0.5">
                    Pay securely with Cards, UPI, Netbanking, or Wallets in INR.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full h-14 bg-brand-espresso text-brand-cream-light font-sans font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center rounded-full hover:bg-brand-espresso/90 transition-colors cursor-pointer"
              >
                Continue to Review
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Final order review */}
        {activeStep === 2 && (
          <div className="space-y-8 bg-white/50 backdrop-blur-md p-6 sm:p-8 rounded-[28px] border border-brand-cream-dark/60 shadow-sm animate-scale-in">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-espresso">
                Review and Finalize Order
              </h2>
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="text-xs font-sans font-bold uppercase tracking-wider text-brand-espresso/60 flex items-center gap-1.5 hover:text-brand-espresso cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Delivery Address Summary */}
              <div className="p-6 bg-brand-cream-warm/40 border border-brand-cream-dark/60 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs uppercase tracking-wider text-brand-espresso font-bold">Delivery Location</h4>
                  <button onClick={() => setActiveStep(0)} className="text-[10px] underline text-brand-honey font-bold uppercase tracking-wider">Edit</button>
                </div>
                {(() => {
                  const addr = addresses.find((a) => a.id === selectedAddressId);
                  if (!addr) return null;
                  return (
                    <p className="text-xs font-sans text-brand-espresso-muted leading-relaxed">
                      {addr.line1}
                      {addr.line2 && `, ${addr.line2}`}
                      <br />
                      {addr.city}, {addr.state} {addr.postal_code}, {addr.country}
                      <br />
                      Phone: {addr.phone}
                    </p>
                  );
                })()}
              </div>

              {/* Payment Details Summary */}
              <div className="p-6 bg-brand-cream-warm/40 border border-brand-cream-dark/60 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs uppercase tracking-wider text-brand-espresso font-bold">Payment Gateway</h4>
                  <button onClick={() => setActiveStep(1)} className="text-[10px] underline text-brand-honey font-bold uppercase tracking-wider">Edit</button>
                </div>
                <p className="text-xs font-sans text-brand-espresso-muted leading-relaxed flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-brand-espresso" />
                  <span>Razorpay Secure checkout</span>
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-brand-cream-dark/60 bg-brand-cream-light text-[11px] text-brand-espresso-muted leading-relaxed">
              By finalizing your order, you authorize the secure locking of this allocation. Order items will be validated server-side.
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePlaceOrder}
                disabled={isLoadingAction}
                className="flex-grow h-14 bg-brand-honey text-brand-cream-light font-sans font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center rounded-full hover:bg-brand-honey-dark disabled:opacity-50 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none cursor-pointer"
              >
                {isLoadingAction ? "Processing Securely..." : `Place Order - ₹${(cartTotal - discountAmount).toFixed(2)}`}
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={isLoadingAction}
                className="h-14 px-6 border border-brand-terracotta/40 hover:border-brand-terracotta text-brand-terracotta font-sans font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center rounded-full hover:bg-brand-terracotta/5 transition-all duration-300 focus:outline-none cursor-pointer"
              >
                Cancel Order
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Order Summary Sticky Sidebar (5 Cols) - Hidden on Mobile */}
      <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-28 space-y-6">
        <div className="p-6 bg-brand-cream-warm/60 border border-brand-cream-dark/80 rounded-[20px] space-y-6 shadow-sm">
          <h3 className="font-serif font-bold text-lg text-brand-espresso border-b border-brand-cream-dark/60 pb-3">
            Order Summary
          </h3>

          {/* Items List */}
          <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-3.5">
                {/* Image */}
                <div className="relative w-12 h-12 rounded-lg bg-brand-cream-warm border border-brand-cream-dark/50 overflow-hidden flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                </div>
                {/* Description */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-xs font-bold text-brand-espresso truncate">
                    {item.name}
                  </h4>
                  <p className="font-sans text-[10px] text-brand-espresso-muted mt-0.5">
                    Qty: {item.quantity} • {item.variant}
                  </p>
                </div>
                {/* Line total */}
                <span className="font-serif text-xs font-semibold text-brand-espresso">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <hr className="border-brand-cream-dark/60" />

          {/* Coupon Code Entry Form */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="PROMO CODE"
                disabled={!!appliedCoupon}
                className="flex-1 h-9 px-3 rounded-lg border border-brand-cream-dark bg-white focus:border-brand-honey focus:outline-none text-[10px] uppercase font-bold tracking-wider text-brand-espresso"
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="h-9 px-3 bg-brand-terracotta text-white rounded-lg text-[9px] uppercase tracking-wider font-bold hover:bg-brand-terracotta/90 transition cursor-pointer"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isApplyingCoupon}
                  className="h-9 px-4 bg-brand-espresso text-brand-cream-light rounded-lg text-[9px] uppercase tracking-wider font-bold hover:bg-brand-espresso/90 disabled:opacity-50 transition cursor-pointer"
                >
                  {isApplyingCoupon ? "..." : "Apply"}
                </button>
              )}
            </div>
            {couponError && <p className="text-[9px] text-brand-terracotta font-semibold mt-1">{couponError}</p>}
            {couponSuccess && <p className="text-[9px] text-brand-forest font-semibold mt-1">{couponSuccess}</p>}
          </form>

          <hr className="border-brand-cream-dark/60" />

          {/* Subtotals */}
          <div className="space-y-2 text-xs font-sans text-brand-espresso-muted">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-brand-espresso font-semibold">₹{cartTotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-brand-forest font-semibold animate-scale-in">
                <span>Promo Discount</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Standard Shipping</span>
              <span className="uppercase text-brand-forest font-bold">Complimentary</span>
            </div>
            <div className="flex justify-between border-t border-brand-cream-dark/40 pt-3 text-sm font-semibold text-brand-espresso">
              <span className="font-serif">Total Due</span>
              <span className="font-serif text-lg font-bold">₹{(cartTotal - discountAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2.5 text-[10px] uppercase tracking-widest text-brand-espresso/60 bg-brand-cream-light py-3 border border-brand-cream-dark/50 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-brand-forest" />
          <span>Apothecary Quality Guarantee</span>
        </div>
      </div>

    </div>
      )}
    </div>
  );
}
