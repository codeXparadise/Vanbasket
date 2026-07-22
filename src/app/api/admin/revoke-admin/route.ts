import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import fs from "fs";
import path from "path";

const LOGS_FILE_PATH = path.join(process.cwd(), "src/app/api/admin/logs/logs.json");

function appendAuditLog(action: string, admin: string, details: string) {
  try {
    let logs = [];
    if (fs.existsSync(LOGS_FILE_PATH)) {
      const data = fs.readFileSync(LOGS_FILE_PATH, "utf8");
      logs = JSON.parse(data || "[]");
    } else {
      fs.mkdirSync(path.dirname(LOGS_FILE_PATH), { recursive: true });
    }

    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      action,
      admin,
      details,
    };

    logs.push(newLog);
    fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate requesting user and verify admin role
    const supabaseServer = createServerClient();
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabaseServer
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    // 2. Parse request payload
    const { targetAdminId, targetEmail } = await request.json();

    if (!targetAdminId) {
      return NextResponse.json({ error: "Missing admin user ID" }, { status: 400 });
    }

    // Prevent self-deletion
    if (targetAdminId === user.id) {
      return NextResponse.json({ error: "Cannot revoke your own access" }, { status: 400 });
    }

    // 3. Initialize service role client
    const supabaseAdmin = createServiceRoleClient();

    // 4. Delete profile first (or update role to customer)
    const { error: profileDeleteError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", targetAdminId);

    if (profileDeleteError) {
      return NextResponse.json({ error: `Failed to remove profile: ${profileDeleteError.message}` }, { status: 500 });
    }

    // 5. Delete auth user completely
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(targetAdminId);
    if (deleteUserError) {
      return NextResponse.json({ error: `Profile deleted but auth revocation failed: ${deleteUserError.message}` }, { status: 500 });
    }

    // 6. Write to local logs
    const adminName = profile.full_name || user.email || "Admin Partner";
    appendAuditLog("REVOKE_ADMIN", adminName, `Revoked admin privileges and deleted auth profile: ${targetEmail || targetAdminId}`);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
