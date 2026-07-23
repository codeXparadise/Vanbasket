// [FIXED] - Fix "Forgot Password" Flow
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { sanitizeInput } from "@/lib/sanitize";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(`forgot-password-${ip}`, 5, 60000)) {
      return NextResponse.json(
        { error: "Too many password reset requests. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const rawEmail = typeof body?.email === "string" ? body.email : "";
    const email = sanitizeInput(rawEmail.toLowerCase().trim());

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const adminSupabase = createServiceRoleClient();

    // Verify user exists in profiles or auth
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (!profile) {
      // Return vague success response to prevent email enumeration attacks
      return NextResponse.json({
        success: true,
        message: "If an account exists with that email, a password reset link has been generated.",
      });
    }

    // Generate cryptographically secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour expiry

    // Save token to password_resets table
    const { error: resetError } = await adminSupabase
      .from("password_resets")
      .insert({
        user_id: profile.id,
        email: email,
        token: token,
        expires_at: expiresAt,
      });

    if (resetError) {
      // If table doesn't exist yet, fallback to Supabase Admin Auth link generation
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.APP_URL || "https://vanbasket.com";
      const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
        type: "recovery",
        email: email,
        options: {
          redirectTo: `${baseUrl}/reset-password`,
        },
      });

      if (linkError) {
        return NextResponse.json({ error: linkError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Password reset link created successfully.",
        reset_link: linkData.properties?.action_link,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.APP_URL || "https://vanbasket.com";
    const resetUrl = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${token}`;

    return NextResponse.json({
      success: true,
      message: "Password reset link created successfully.",
      reset_url: resetUrl,
      expires_in: "1 hour",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error processing password reset request." },
      { status: 500 }
    );
  }
}
