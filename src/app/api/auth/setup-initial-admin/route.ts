import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body?.email || "smartyvishalprajapati@gmail.com";
    const password = body?.password || "123456";
    const fullName = body?.fullName || "Vishal Prajapati";
    const phone = body?.phone || "+918433696619";

    const adminSupabase = createServiceRoleClient();

    // List users to check if user already exists
    const { data: { users }, error: listError } = await adminSupabase.auth.admin.listUsers();

    if (listError) {
      return NextResponse.json({ error: `Failed to list users: ${listError.message}` }, { status: 500 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = users?.find((u) => u.email?.toLowerCase() === cleanEmail);

    let userId: string;

    if (existingUser) {
      // Update password & confirm user using official Supabase GoTrue Auth API
      const { data: updated, error: updateError } = await adminSupabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password: password,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        }
      );

      if (updateError) {
        return NextResponse.json({ error: `Auth update error: ${updateError.message}` }, { status: 500 });
      }

      userId = updated.user.id;
    } else {
      // Create new user using official Supabase GoTrue Auth API
      const { data: created, error: createError } = await adminSupabase.auth.admin.createUser({
        email: cleanEmail,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

      if (createError || !created.user) {
        return NextResponse.json(
          { error: `Auth creation error: ${createError?.message || "User creation failed"}` },
          { status: 500 }
        );
      }

      userId = created.user.id;
    }

    // Set role = 'admin' in profiles table
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .upsert({
        id: userId,
        email: cleanEmail,
        full_name: fullName,
        phone: phone,
        role: "admin",
      });

    if (profileError) {
      return NextResponse.json({ error: `Profile assignment error: ${profileError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Admin account for ${cleanEmail} created/updated successfully.`,
      user_id: userId,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
