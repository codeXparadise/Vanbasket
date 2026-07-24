import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";

export async function POST(request: Request) {
  try {
    // 1. Verify user is authenticated and has admin role
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const adminSupabase = createServiceRoleClient();
    
    // Fetch profile role
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
    }

    // 2. Read target email from body
    const body = await request.json();
    const targetEmail = body?.email;

    if (!targetEmail || typeof targetEmail !== "string") {
      return NextResponse.json({ error: "Target customer email is required." }, { status: 400 });
    }

    // 3. Generate password reset recovery link using Supabase Admin Auth API
    const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
      type: "recovery",
      email: targetEmail.trim(),
    });

    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      recovery_link: linkData.properties?.action_link || "",
    });
  } catch (error: unknown) {
    console.error("Password link generator server error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
