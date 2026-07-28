import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_ROUTES = ["/profile", "/checkout", "/complete-profile"];

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://iyzhmgyfxqpwchfdhvei.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5emhtZ3lmeHFwd2NoZmRodmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MTU0NzAsImV4cCI6MjEwMDI5MTQ3MH0.FpCgjLlKbWsahvlxrFSmKyP3-4ajIvv5ffUKFK--12c";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const createRedirect = (targetUrl: URL) => {
    const redirectResponse = NextResponse.redirect(targetUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  };

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh the session if expired
  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) {
      user = data.user;
    } else {
      // Auth error or missing user (e.g. Invalid Refresh Token)
      const allCookies = request.cookies.getAll();
      for (const cookie of allCookies) {
        if (cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token")) {
          response.cookies.set(cookie.name, "", { maxAge: 0, path: "/" });
        }
      }
    }
  } catch {
    const allCookies = request.cookies.getAll();
    for (const cookie of allCookies) {
      if (cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token")) {
        response.cookies.set(cookie.name, "", { maxAge: 0, path: "/" });
      }
    }
  }

  // Check user role if authenticated
  let userRole = "user";
  if (user) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role === "admin") {
        userRole = "admin";
      }
    } catch {
      // Fallback if db query fails
    }
  }

  const isCustomerRoute =
    PROTECTED_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route)) ||
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup");

  // If an admin user accesses customer auth/profile routes (/login, /signup, /profile, /checkout),
  // clear admin session from customer context so clicking "Sign In" opens customer login instead of admin panel.
  if (user && userRole === "admin" && isCustomerRoute) {
    const loginUrl = new URL("/login", request.url);
    if (!request.nextUrl.pathname.startsWith("/login") && !request.nextUrl.pathname.startsWith("/signup")) {
      loginUrl.searchParams.set("error", "admin_account_restricted");
    }
    const redirectResponse = NextResponse.redirect(loginUrl);
    const allCookies = request.cookies.getAll();
    for (const cookie of allCookies) {
      if (cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token")) {
        redirectResponse.cookies.set(cookie.name, "", { maxAge: 0, path: "/" });
      }
    }
    return redirectResponse;
  }

  // Protected customer route enforcement — redirect unauthenticated users to login
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return createRedirect(loginUrl);
  }

  // Protect Admin Routes in Middleware
  const isAdminRoute =
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login");

  if (isAdminRoute) {
    if (!user || userRole !== "admin") {
      return createRedirect(new URL("/admin/login", request.url));
    }
  }

  // Redirect logged in admins away from admin login
  if (request.nextUrl.pathname.startsWith("/admin/login") && user && userRole === "admin") {
    return createRedirect(new URL("/admin", request.url));
  }

  // Redirect authenticated customer users away from auth pages
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup");

  if (isAuthRoute && user && userRole !== "admin") {
    const redirect = request.nextUrl.searchParams.get("redirect") || "/";
    return createRedirect(new URL(redirect, request.url));
  }

  return response;
}

export const middleware = proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)",
  ],
};
