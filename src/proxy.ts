import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_ROUTES = ["/profile", "/checkout", "/complete-profile"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );

  // Refresh the session if expired
  const { data: { user } } = await supabase.auth.getUser();

  // Check user role if authenticated
  let userRole = "user";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "admin") {
      userRole = "admin";
    }
  }

  // Admin users are barred from customer user routes (/profile, /checkout, /complete-profile, /login, /signup)
  const isCustomerRoute = PROTECTED_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  ) || request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup");

  if (user && userRole === "admin" && isCustomerRoute) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Protected customer route enforcement — redirect unauthenticated users to login
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect Admin Routes in Middleware
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin") && !request.nextUrl.pathname.startsWith("/admin/login");
  if (isAdminRoute) {
    if (!user || userRole !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Redirect logged in admins away from admin login
  if (request.nextUrl.pathname.startsWith("/admin/login") && user && userRole === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Redirect authenticated customer users away from auth pages
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup");
  if (isAuthRoute && user && userRole !== "admin") {
    const redirect = request.nextUrl.searchParams.get("redirect") || "/";
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  return response;
}

export const middleware = proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
