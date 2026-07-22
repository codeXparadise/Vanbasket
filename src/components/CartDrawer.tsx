"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export const CartDrawer = () => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
    isAuthenticated,
    authReady,
  } = useCart();

  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  // Focus on close button when drawer opens for accessibility
  useEffect(() => {
    if (isCartOpen && closeButtonRef.current) {
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    }
  }, [isCartOpen]);

  useEffect(() => {
    document.body.classList.toggle("scroll-locked", isCartOpen);
    return () => document.body.classList.remove("scroll-locked");
  }, [isCartOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-500 ${
        isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!isCartOpen}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-espresso/60 backdrop-blur-sm transition-opacity duration-500"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide Drawer */}
      <div
        ref={drawerRef}
        className={`absolute top-0 right-0 h-full w-full sm:max-w-md bg-brand-cream-light shadow-2xl flex flex-col justify-between transition-transform duration-500 ease-organic ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart Drawer"
      >
        {/* Header */}
        <div className="p-6 border-b border-brand-cream-dark/50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ShoppingBag className="w-5 h-5 text-brand-espresso" />
            <h2 className="font-serif font-bold text-xl text-brand-espresso">
              Your Selection
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={() => setIsCartOpen(false)}
            className="p-1 text-brand-espresso/70 hover:text-brand-espresso focus:outline-none"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Line Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!authReady ? (
            <div className="h-full flex items-center justify-center text-xs text-brand-espresso-muted">Checking your account...</div>
          ) : cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="p-4 bg-brand-cream-warm/50 rounded-full border border-brand-cream-dark/30">
                <ShoppingBag className="w-8 h-8 text-brand-espresso/40 stroke-[1.25]" />
              </div>
              <p className="font-serif text-lg text-brand-espresso font-semibold">
                Your cart is empty
              </p>
              <p className="font-sans text-xs text-brand-espresso-muted max-w-[200px]">
                Explore our wildflower harvests to find your vintage jar.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 text-xs font-sans font-bold uppercase tracking-[0.2em] text-brand-honey hover:text-brand-honey-dark underline focus:outline-none"
              >
                Continue Browsing
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-4 pb-6 border-b border-brand-cream-dark/30 last:border-b-0"
              >
                {/* Image */}
                <div className="relative w-20 h-20 bg-brand-cream-warm rounded-lg overflow-hidden border border-brand-cream-dark/40 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                {/* Info & Adjuster */}
                <div className="flex-1 flex flex-col justify-between h-20 py-1">
                  <div>
                    <div className="flex items-start justify-between">
                      <h3 className="font-serif text-sm font-bold text-brand-espresso">
                        {item.name}
                      </h3>
                      <span className="font-serif text-sm font-semibold text-brand-espresso">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    <p className="font-sans text-[11px] text-brand-espresso-muted font-medium mt-0.5">
                      {item.variant}
                    </p>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-brand-cream-warm/70 border border-brand-cream-dark/50 rounded-full px-2 py-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:text-brand-honey transition-colors text-brand-espresso/70"
                        aria-label={`Decrease ${item.name} quantity`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 font-sans text-xs font-bold text-brand-espresso">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:text-brand-honey transition-colors text-brand-espresso/70"
                        aria-label={`Increase ${item.name} quantity`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-brand-espresso/40 hover:text-brand-terracotta p-1 transition-colors"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sticky Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-brand-cream-warm/80 border-t border-brand-cream-dark/70 sticky bottom-0 z-10">
            {!isAuthenticated && (
              <div className="mb-4 rounded-2xl border border-brand-honey/30 bg-white/70 px-4 py-3 text-center">
                <p className="font-serif text-sm font-semibold text-brand-espresso">Sign in before payment</p>
                <p className="mt-1 text-[11px] text-brand-espresso-muted">Your selection is saved here. We will ask you to log in when you continue to checkout.</p>
              </div>
            )}
            {/* Price lines */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs text-brand-espresso-muted">
                <span>Shipping</span>
                <span className="uppercase font-semibold text-brand-forest">Complimentary</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="font-serif font-bold text-base text-brand-espresso">
                  Estimated Total
                </span>
                <span className="font-serif text-2xl font-bold text-brand-espresso">
                  ₹{cartTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full h-14 bg-brand-espresso text-brand-cream-light font-sans font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center rounded-full hover:bg-brand-espresso/90 border border-brand-espresso shadow-md hover:shadow-lg transition-all duration-300"
            >
              Secure Checkout
            </Link>

            <p className="text-[10px] text-center text-brand-espresso/50 mt-4">
              All transactions are secured and encrypted.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
