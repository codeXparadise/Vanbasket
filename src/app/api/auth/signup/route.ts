// [FIXED] - API Rate Limiting & Input Sanitization
import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { sanitizeInput } from "@/lib/sanitize";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(`signup-${ip}`, 5, 60000)) {
      return NextResponse.json(
        { error: "Too many signup requests. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const rawEmail = typeof body?.email === "string" ? body.email : "";
    const email = sanitizeInput(rawEmail.trim().toLowerCase());
    const password = typeof body?.password === "string" ? body.password : "";
    const fullName = sanitizeInput(typeof body?.fullName === "string" ? body.fullName.trim() : "");
    const rawPhone = typeof body?.phone === "string" ? body.phone : "";
    const phone = sanitizeInput(rawPhone.trim());

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    if (fullName.length < 2 || fullName.length > 120) {
      return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
    }

    if (!phone || !/^[+()0-9\s-]{7,20}$/.test(phone)) {
      return NextResponse.json({ error: "Mandatory phone number is required." }, { status: 400 });
    }

    const supabaseAdmin = createServiceRoleClient();

    // Check if an existing profile with this email already exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, role, email")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      if (existingProfile.role === "admin") {
        return NextResponse.json(
          { error: "This email address is already assigned as an Administrator. Please log in via the Admin Portal." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "This email address is already registered. Please log in to your account instead." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      phone: phone.replace(/[^\d+]/g, ""), // cleaned phone format for auth
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone: phone,
      },
    });

    if (error) {
      const errMsg = error.message.toLowerCase();
      if (errMsg.includes("already registered") || errMsg.includes("already exists") || errMsg.includes("user_already_exists")) {
        return NextResponse.json(
          { error: "This email address is already registered. Please log in to your account instead." },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.user) {
      // Upsert profile with mandatory phone number
      await supabaseAdmin.from("profiles").upsert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        phone: phone,
        role: "user",
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      userId: data.user?.id,
    });
  } catch {
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}
