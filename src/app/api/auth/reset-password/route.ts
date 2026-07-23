// [FIXED] - Fix "Forgot Password" Flow
import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(`reset-password-${ip}`, 5, 60000)) {
      return NextResponse.json(
        { error: "Too many password reset attempts. Please try again in a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const newPassword = typeof body?.password === "string" ? body.password : "";

    if (!token) {
      return NextResponse.json({ error: "Password reset token is required." }, { status: 400 });
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const adminSupabase = createServiceRoleClient();

    // 1. Check token in password_resets table
    const { data: resetRecord, error: tokenErr } = await adminSupabase
      .from("password_resets")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (tokenErr || !resetRecord) {
      return NextResponse.json(
        { error: "Invalid or expired password reset link. Please request a new one." },
        { status: 400 }
      );
    }

    // 2. Validate token expiry (1 hour limit)
    const expiresAt = new Date(resetRecord.expires_at).getTime();
    if (Date.now() > expiresAt) {
      // Delete expired token
      await adminSupabase.from("password_resets").delete().eq("id", resetRecord.id);
      return NextResponse.json(
        { error: "Password reset link has expired (valid for 1 hour). Please request a new link." },
        { status: 400 }
      );
    }

    // 3. Update user password using Supabase Admin Auth API
    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
      resetRecord.user_id,
      { password: newPassword }
    );

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 4. Delete token after successful use (single-use token)
    await adminSupabase.from("password_resets").delete().eq("id", resetRecord.id);

    return NextResponse.json({
      success: true,
      message: "Password reset successful! Redirecting to login...",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error while resetting password." },
      { status: 500 }
    );
  }
}
