import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirect = requestUrl.searchParams.get("redirect") || "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if user profile is complete
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (!profile || !profile.full_name) {
          return NextResponse.redirect(
            new URL(`/complete-profile?redirect=${encodeURIComponent(redirect)}`, request.url)
          );
        }
      }
      return NextResponse.redirect(new URL(redirect, request.url));
    }
  }

  // Return user to home page on error
  return NextResponse.redirect(new URL("/", request.url));
}
