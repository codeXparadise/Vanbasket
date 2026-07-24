"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

export interface Profile {
  full_name: string | null;
  email: string | null;
  phone?: string | null;
}

export interface OrderItem {
  id?: string;
  product_name_snapshot: string;
  variant_label_snapshot: string;
  quantity: number;
  unit_price?: number;
  line_total?: number;
}

export interface Payment {
  id: string;
  order_id: string;
  gateway: string;
  gateway_order_id: string | null;
  gateway_payment_id: string | null;
  status: string;
  amount: number;
  currency: string;
  method?: string | null;
  payment_method?: string | null;
  created_at: string;
  orders?: {
    order_number: string;
    status: string;
  } | null;
}

export interface Address {
  id: string;
  user_id?: string;
  label?: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  country?: string;
  is_default?: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  profiles: Profile | null;
  order_items: OrderItem[];
  payments?: Payment[];
  addresses?: Address | null;
  subtotal?: number;
  shipping_fee?: number;
  coupon_code?: string | null;
  discount_amount?: number;
  user_id?: string;
}

export interface ProductVariant {
  id?: string;
  size_label: string;
  price: number;
  stock_qty: number;
  sku: string;
  is_active: boolean;
  low_stock_threshold: number;
}

export interface ProductImage {
  id?: string;
  image_url: string;
  display_order: number;
  media_type: "image" | "video";
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  compare_at_price: number | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  seo_tags: string[] | null;
  currency: string;
  is_active: boolean;
  product_variants: ProductVariant[];
  product_images: ProductImage[];
}

export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
}

export interface ContactQuery {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  quantity: string | null;
  message: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed_amount" | string;
  discount_value: number;
  min_order_amount: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  admin: string;
  details: string;
  timestamp: string;
}

interface DashboardStats {
  revenue: number;
  activeProductsCount: number;
  successfulPaymentsCount: number;
  uniqueCustomersCount: number;
}

interface AdminContextType {
  // Loading States
  loadingDashboard: boolean;
  loadingProducts: boolean;
  loadingOrders: boolean;
  loadingUsers: boolean;
  loadingQueries: boolean;
  loadingCoupons: boolean;
  loadingLogs: boolean;

  // Loaded Checkers
  isDashboardLoaded: boolean;
  isProductsLoaded: boolean;
  isOrdersLoaded: boolean;
  isUsersLoaded: boolean;
  isQueriesLoaded: boolean;
  isCouponsLoaded: boolean;
  isLogsLoaded: boolean;

  // Data States
  dashboardStats: DashboardStats | null;
  recentOrders: Order[];
  recentPayments: Payment[];
  recentProducts: Product[];
  products: Product[];
  orders: Order[];
  users: AdminUser[];
  addresses: Address[];
  queries: ContactQuery[];
  coupons: Coupon[];
  logs: AuditLog[];

  // Fetch Functions
  fetchDashboardData: (silent?: boolean) => Promise<void>;
  fetchProducts: (silent?: boolean) => Promise<void>;
  fetchOrders: (silent?: boolean) => Promise<void>;
  fetchUsers: (silent?: boolean) => Promise<void>;
  fetchQueries: (silent?: boolean) => Promise<void>;
  fetchCoupons: (silent?: boolean) => Promise<void>;
  fetchLogs: (silent?: boolean) => Promise<void>;

  // Manual Setters for instant local updates (e.g. edits, deletes)
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  setQueries: React.Dispatch<React.SetStateAction<ContactQuery[]>>;
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  setLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = createClient();

  // Data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [queries, setQueries] = useState<ContactQuery[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  // Loaders
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingQueries, setLoadingQueries] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Loaded Checkers
  const [isDashboardLoaded, setIsDashboardLoaded] = useState(false);
  const [isProductsLoaded, setIsProductsLoaded] = useState(false);
  const [isOrdersLoaded, setIsOrdersLoaded] = useState(false);
  const [isUsersLoaded, setIsUsersLoaded] = useState(false);
  const [isQueriesLoaded, setIsQueriesLoaded] = useState(false);
  const [isCouponsLoaded, setIsCouponsLoaded] = useState(false);
  const [isLogsLoaded, setIsLogsLoaded] = useState(false);

  // Fetch Actions
  const fetchDashboardData = useCallback(async (silent = false) => {
    if (!silent) setLoadingDashboard(true);
    try {
      const [
        recentOrdersRes,
        statsOrdersRes,
        recentPaymentsRes,
        statsPaymentsCountRes,
        recentProductsRes,
        statsProductsCountRes,
      ] = await Promise.all([
        supabase
          .from("orders")
          .select("id, order_number, status, total_amount, created_at, profiles(full_name, email), order_items(product_name_snapshot, variant_label_snapshot, quantity)")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("orders")
          .select("total_amount, status, user_id, created_at, order_items(product_name_snapshot, variant_label_snapshot, quantity)"),
        supabase
          .from("payments")
          .select("id, order_id, gateway, gateway_order_id, gateway_payment_id, status, amount, currency, method, created_at, orders(order_number, status)")
          .order("created_at", { ascending: false })
          .limit(6),
        supabase
          .from("payments")
          .select("id", { count: "exact", head: true })
          .in("status", ["captured", "authorized", "created"]),
        supabase
          .from("products")
          .select("id, name, is_active")
          .order("updated_at", { ascending: false })
          .limit(5),
        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true),
      ]);

      if (recentOrdersRes.error) throw recentOrdersRes.error;
      if (statsOrdersRes.error) throw statsOrdersRes.error;
      if (recentPaymentsRes.error) throw recentPaymentsRes.error;
      if (recentProductsRes.error) throw recentProductsRes.error;

      const mappedOrders = ((recentOrdersRes.data || []) as unknown as Order[]).map((order) => ({
        ...order,
        profiles: Array.isArray(order.profiles) ? order.profiles[0] || null : order.profiles,
      }));

      // Calculate Stats
      const paidOrdersList = (statsOrdersRes.data || []).filter((order) =>
        ["paid", "shipped", "delivered", "PAID", "PAYMENT_SUCCESS"].includes(order.status)
      );
      const revenueVal = paidOrdersList.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
      const uniqueCustomersVal = new Set((statsOrdersRes.data || []).map((order) => order.user_id).filter(Boolean)).size;

      setRecentOrders(mappedOrders);
      // Store all stats orders in local context storage (like orders array or let dashboard page reuse orders array)
      setOrders((statsOrdersRes.data || []) as unknown as Order[]);
      setRecentPayments((recentPaymentsRes.data || []) as unknown as Payment[]);
      setRecentProducts((recentProductsRes.data || []) as unknown as Product[]);
      setDashboardStats({
        revenue: revenueVal,
        activeProductsCount: statsProductsCountRes.count || 0,
        successfulPaymentsCount: statsPaymentsCountRes.count || 0,
        uniqueCustomersCount: uniqueCustomersVal,
      });
      setIsDashboardLoaded(true);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoadingDashboard(false);
    }
  }, [supabase]);

  const fetchProducts = useCallback(async (silent = false) => {
    if (!silent) setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_variants(*), product_images(*)")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setProducts((data || []) as Product[]);
      setIsProductsLoaded(true);
    } catch (err) {
      console.error("Products fetch error:", err);
    } finally {
      setLoadingProducts(false);
    }
  }, [supabase]);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles(full_name, email, phone),
          order_items(*),
          payments(*),
          addresses:shipping_address_id(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped = (data || []).map((o: any) => ({
        ...o,
        profiles: Array.isArray(o.profiles) ? o.profiles[0] || null : o.profiles || null,
        addresses: Array.isArray(o.addresses) ? o.addresses[0] || null : o.addresses || null,
      }));
      setOrders(mapped);
      setIsOrdersLoaded(true);
    } catch (err) {
      console.error("Orders fetch error:", err);
    } finally {
      setLoadingOrders(false);
    }
  }, [supabase]);

  const fetchUsers = useCallback(async (silent = false) => {
    if (!silent) setLoadingUsers(true);
    try {
      let finalUsers: AdminUser[] = [];
      const { data: usersData, error: usersError } = await supabase
        .from("admin_user_view")
        .select("*")
        .order("created_at", { ascending: false });

      if (!usersError && usersData && usersData.length > 0) {
        finalUsers = usersData as AdminUser[];
      } else {
        const { data: pData } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
        if (pData) {
          finalUsers = pData as AdminUser[];
        }
      }

      const { data: addrData } = await supabase
        .from("addresses")
        .select("*");

      setUsers(finalUsers);
      setAddresses((addrData || []) as Address[]);
      setIsUsersLoaded(true);
    } catch (err) {
      console.error("Users fetch error:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, [supabase]);

  const fetchQueries = useCallback(async (silent = false) => {
    if (!silent) setLoadingQueries(true);
    try {
      const { data, error } = await supabase
        .from("contact_queries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQueries(data || []);
      setIsQueriesLoaded(true);
    } catch (err) {
      console.error("Queries fetch error:", err);
    } finally {
      setLoadingQueries(false);
    }
  }, [supabase]);

  const fetchCoupons = useCallback(async (silent = false) => {
    if (!silent) setLoadingCoupons(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
      setIsCouponsLoaded(true);
    } catch (err) {
      console.error("Coupons fetch error:", err);
    } finally {
      setLoadingCoupons(false);
    }
  }, [supabase]);

  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setLoadingLogs(true);
    try {
      const response = await fetch("/api/admin/logs");
      if (!response.ok) throw new Error("Failed to load audit logs");
      const data = await response.json();
      setLogs(data as AuditLog[]);
      setIsLogsLoaded(true);
    } catch (err) {
      console.error("Logs fetch error:", err);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  return (
    <AdminContext.Provider
      value={{
        loadingDashboard,
        loadingProducts,
        loadingOrders,
        loadingUsers,
        loadingQueries,
        loadingCoupons,
        loadingLogs,
        isDashboardLoaded,
        isProductsLoaded,
        isOrdersLoaded,
        isUsersLoaded,
        isQueriesLoaded,
        isCouponsLoaded,
        isLogsLoaded,
        dashboardStats,
        recentOrders,
        recentPayments,
        recentProducts,
        products,
        orders,
        users,
        addresses,
        queries,
        coupons,
        logs,
        fetchDashboardData,
        fetchProducts,
        fetchOrders,
        fetchUsers,
        fetchQueries,
        fetchCoupons,
        fetchLogs,
        setProducts,
        setOrders,
        setUsers,
        setQueries,
        setCoupons,
        setLogs,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminState = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdminState must be used within an AdminProvider");
  return context;
};
