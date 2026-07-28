"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { AdminProvider } from "@/context/AdminContext";
import {
  LayoutDashboard,
  ClipboardList,
  Store,
  LogOut,
  Menu,
  X,
  Users,
  MessageSquare,
  Bell,
  Star,
} from "lucide-react";

// [FIXED] - Add VanBasket Brand Logo & Name Everywhere
import BrandLogo from "@/components/BrandLogo";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadQueriesCount, setUnreadQueriesCount] = useState(0);
  const [toasts, setToasts] = useState<{ id: string; kind: "order" | "query"; title: string; detail: string; total_amount?: number }[]>([]);

  const isLoginPage = pathname === "/admin/login";

  const syncUnreadCount = useCallback(async () => {
    try {
      const { data: orderData } = await supabase
        .from("orders")
        .select("id");
      
      if (orderData) {
        let readIds: string[] = [];
        try {
          readIds = JSON.parse(localStorage.getItem("admin_read_orders") || "[]");
        } catch {}
        
        const unread = orderData.filter(o => !readIds.includes(o.id));
        setUnreadCount(unread.length);
      }
    } catch (err) {
      console.error("Failed to sync unread count:", err);
    }
  }, [supabase]);

  const syncUnreadQueriesCount = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/queries");
      if (response.ok) {
        const queryData = await response.json();
        let readIds: string[] = [];
        try {
          readIds = JSON.parse(localStorage.getItem("admin_read_queries") || "[]");
        } catch {}

        const unread = (queryData as { id: string }[]).filter((q) => !readIds.includes(q.id));
        setUnreadQueriesCount(unread.length);
      }
    } catch (err) {
      console.error("Failed to sync unread queries count:", err);
    }
  }, []);

  // Web Audio double-chime beep
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
      
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5
        gain2.gain.setValueAtTime(0.08, ctx.currentTime);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.18);
      }, 120);
    } catch {}
  };

  useEffect(() => {
    if (isLoginPage) return;

    const fetchAdminDetails = async () => {
      try {
        if (adminEmail) return; // Cached session

        const { data, error } = await supabase.auth.getUser();
        const user = error ? null : data?.user || null;
        if (user) {
          setAdminEmail(user.email || "");
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", user.id)
            .maybeSingle();

          if (!profile || profile.role !== "admin") {
            // Log out and redirect unauthorized users
            await supabase.auth.signOut();
            router.push("/admin/login");
            return;
          }

          if (profile?.full_name) {
            setAdminName(profile.full_name);
          } else {
            setAdminName("Admin Partner");
          }
        } else {
          router.push("/admin/login");
        }
      } catch (err) {
        console.error("Admin fetch details error:", err);
        router.push("/admin/login");
      }
    };
    
    fetchAdminDetails();
    fetchAdminDetails();
    syncUnreadCount();
    syncUnreadQueriesCount();

    // Subscribe to realtime orders changes
    const channel = supabase
      .channel("admin-layout-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          playBeep();
          setUnreadCount((prev) => prev + 1);
          
          const newOrder = payload.new;
          setToasts((prev) => [
            ...prev,
            {
              id: newOrder.id,
              kind: "order",
              title: "New Order Received!",
              detail: newOrder.order_number,
              total_amount: Number(newOrder.total_amount),
            },
          ]);

          window.dispatchEvent(new CustomEvent("new-order-received", { detail: newOrder }));
        }
      )
      .subscribe();

    const queryChannel = supabase
      .channel("admin-query-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "contact_queries" }, (payload) => {
        playBeep();
        const query = payload.new as { id: string; name?: string };
        setUnreadQueriesCount((prev) => prev + 1);
        setToasts((prev) => [...prev, { id: query.id, kind: "query", title: "New Query Received!", detail: query.name || "Contact request" }]);
      })
      .subscribe();

    const handleOrderRead = () => {
      syncUnreadCount();
    };
    const handleQueryRead = () => {
      syncUnreadQueriesCount();
    };
    const handleToastEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        const toastId = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [
          ...prev,
          {
            id: toastId,
            kind: detail.kind || "query",
            title: detail.title || "Notification",
            detail: detail.message || detail.detail || "",
            total_amount: detail.total_amount,
          },
        ]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toastId));
        }, 4000);
      }
    };

    window.addEventListener("order-marked-read", handleOrderRead);
    window.addEventListener("query-marked-read", handleQueryRead);
    window.addEventListener("show-admin-toast", handleToastEvent);

    // Dynamic background polling (runs every 10 seconds to sync unread badges)
    const poll = setInterval(() => {
      syncUnreadCount();
      syncUnreadQueriesCount();
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(queryChannel);
      window.removeEventListener("order-marked-read", handleOrderRead);
      window.removeEventListener("query-marked-read", handleQueryRead);
      window.removeEventListener("show-admin-toast", handleToastEvent);
      clearInterval(poll);
    };
  }, [isLoginPage, supabase, router, syncUnreadCount]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const removeToast = (toastId: string) => {
    setToasts((prev) => prev.filter(t => t.id !== toastId));
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ClipboardList },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/admins", label: "Admins", icon: Users },
    { href: "/admin/queries", label: "Queries", icon: MessageSquare },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
  ];

  const getInitials = (name: string) => {
    if (!name) return "AD";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <AdminProvider>
      <div className="min-h-screen bg-brand-cream-light flex font-sans text-brand-espresso">
      {/* Sidebar for Desktop */}
      <aside className={`hidden md:flex bg-brand-espresso text-brand-cream-light flex-col justify-between shrink-0 border-r border-brand-espresso/10 transition-all duration-300 ${
        isSidebarCollapsed ? "w-20" : "w-64"
      }`}>
        <div>
          <div className="h-20 flex items-center justify-between px-6 border-b border-brand-cream-warm/10 animate-fade-in">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2">
                <BrandLogo width={90} height={30} showText={false} href="/admin" />
                <span className="font-sans text-sm tracking-wide font-semibold text-white">VanBasket Admin</span>
              </div>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-brand-cream-warm mx-auto"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isOrders = item.href === "/admin/orders";
              const isQueries = item.href === "/admin/queries";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center ${
                    isSidebarCollapsed ? "justify-center" : "justify-between"
                  } px-4 h-11 rounded-xl text-xs font-bold tracking-wider uppercase transition-all relative group ${
                    isActive
                      ? "bg-brand-honey text-white shadow-lg shadow-brand-honey/15"
                      : "text-brand-cream-warm/75 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isSidebarCollapsed && isOrders && unreadCount > 0 && (
                    <span className="bg-brand-honey-dark text-white font-sans text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                  {!isSidebarCollapsed && isQueries && unreadQueriesCount > 0 && (
                    <span className="bg-amber-500 text-white font-sans text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                      {unreadQueriesCount}
                    </span>
                  )}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-brand-espresso text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
                      {item.label} {isOrders && unreadCount > 0 && `(${unreadCount})`} {isQueries && unreadQueriesCount > 0 && `(${unreadQueriesCount})`}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-brand-cream-warm/10">
          <div className={`flex items-center gap-3 px-2 py-3 mb-3 ${isSidebarCollapsed ? "justify-center" : ""}`}>
            <div className="w-10 h-10 rounded-full bg-brand-honey flex items-center justify-center font-bold text-white text-xs shrink-0">
              {getInitials(adminName)}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 transition-opacity duration-300">
                <p className="text-xs font-bold text-white truncate leading-snug">{adminName}</p>
                <p className="text-[10px] text-brand-cream-warm/60 truncate">{adminEmail}</p>
              </div>
            )}
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center ${
              isSidebarCollapsed ? "justify-center" : "gap-3 px-4"
            } h-10 rounded-lg text-[11px] font-bold uppercase tracking-wider text-brand-cream-warm/60 hover:text-white transition relative group`}
          >
            <Store className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Storefront</span>}
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-brand-espresso text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
                Storefront
              </div>
            )}
          </a>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              isSidebarCollapsed ? "justify-center" : "gap-3 px-4"
            } h-10 rounded-lg text-[11px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition mt-1 relative group`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Logout</span>}
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-brand-espresso text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
                Logout
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Header / Navbar */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 md:hidden bg-brand-espresso text-brand-cream-light flex items-center justify-between px-6 border-b border-brand-cream-warm/15 shrink-0 z-30">
          <div className="flex items-center gap-2">
            <BrandLogo width={70} height={24} showText={false} href="/admin" />
            <span className="font-sans text-sm tracking-wide font-semibold text-white">VanBasket Admin</span>
          </div>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-1.5 rounded-lg hover:bg-white/10"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Slide Drawer */}
        {isMobileOpen && (
          <div className="md:hidden fixed inset-0 z-20 flex animate-fade-in">
            <div className="fixed inset-0 bg-brand-espresso/60 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
            <div className="relative w-4/5 max-w-xs bg-brand-espresso text-brand-cream-light flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-brand-cream-warm/10 mb-6">
                  <div className="flex items-center gap-2">
                    <BrandLogo width={70} height={24} showText={false} href="/admin" />
                    <span className="font-serif text-sm tracking-wider font-bold text-white">VanBasket Admin</span>
                  </div>
                  <button onClick={() => setIsMobileOpen(false)} className="p-1 text-brand-cream-warm">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    const isOrders = item.href === "/admin/orders";
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center justify-between px-4 h-11 rounded-xl text-xs font-bold tracking-wider uppercase transition-all ${
                          isActive
                            ? "bg-brand-honey text-white shadow-lg shadow-brand-honey/15"
                            : "text-brand-cream-warm/75 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {isOrders && unreadCount > 0 && (
                          <span className="bg-brand-honey-dark text-white font-sans text-[10px] px-2 py-0.5 rounded-full font-bold">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-brand-cream-warm/10 pt-4">
                <div className="flex items-center gap-3 px-2 py-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-brand-honey flex items-center justify-center font-bold text-white text-xs">
                    {getInitials(adminName)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-none">{adminName}</p>
                    <p className="text-[10px] text-brand-cream-warm/60 mt-1">{adminEmail}</p>
                  </div>
                </div>
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 h-10 rounded-lg text-xs font-bold uppercase tracking-wider text-brand-cream-warm/60 hover:text-white transition"
                >
                  <Store className="w-4 h-4" />
                  <span>Storefront</span>
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 h-10 rounded-lg text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:p-12 relative">
          {children}
        </main>

        {/* Floating Realtime Toast Notifications (Bottom Right) */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="bg-brand-espresso text-brand-cream-light border border-brand-honey/40 rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-slide-in pointer-events-auto"
            >
              <div className="w-8 h-8 rounded-full bg-brand-honey flex items-center justify-center shrink-0 text-white">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-grow space-y-1">
                <h5 className="text-[11px] uppercase tracking-wider font-extrabold text-brand-honey leading-none animate-bounce">
                  {t.title}
                </h5>
                <p className="text-[10px] font-mono font-bold text-white select-all">
                  {t.detail}
                </p>
                <p className="text-[10px] text-brand-cream-warm font-sans">
                  {t.kind === "order" && t.total_amount !== undefined ? `Total Amount: Rs. ${t.total_amount.toFixed(2)}` : "A new customer message is waiting."}
                </p>
                <div className="flex gap-3 pt-1">
                  <Link
                    href="/admin/orders"
                    onClick={() => removeToast(t.id)}
                    className="text-[9px] uppercase font-bold text-brand-honey hover:underline"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => removeToast(t.id)}
                    className="text-[9px] uppercase font-bold text-brand-cream-warm/60 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </AdminProvider>
  );
}
