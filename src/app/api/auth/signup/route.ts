import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    if (fullName.length < 2 || fullName.length > 120) {
      return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
    }

    const supabaseAdmin = createServiceRoleClient();

    // Check if an existing profile with this email already has the admin role assigned
    const { data: existingAdmin } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("email", email)
      .eq("role", "admin")
      .maybeSingle();

    if (existingAdmin) {
      return NextResponse.json(
        { error: "This email address is already assigned as an Administrator. You cannot sign up with this email; please use a different email ID or login via Admin Portal." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      userId: data.user?.id,
    });
  } catch {
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}
