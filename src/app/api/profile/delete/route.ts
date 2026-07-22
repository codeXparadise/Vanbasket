import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";

export async function POST() {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const adminSupabase = createServiceRoleClient();
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Could not delete account." }, { status: 500 });
  }
}
