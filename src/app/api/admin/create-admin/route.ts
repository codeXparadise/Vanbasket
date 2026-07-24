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
    const supabaseServer = await createServerClient();
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
    const { email, password, fullName, phone } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // 3. Initialize service role client
    const supabaseAdmin = createServiceRoleClient();

    // 4. Create auth user in Supabase
    const { data: adminUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError || !adminUser.user) {
      return NextResponse.json({ error: createError?.message || "Failed to create user" }, { status: 500 });
    }

    // 5. Explicitly insert/upsert profile to ensure they are admin
    const { error: profileUpdateError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: adminUser.user.id,
        email: email,
        full_name: fullName,
        phone: phone || null,
        role: "admin",
      });

    if (profileUpdateError) {
      return NextResponse.json({ error: `User created but profile assignment failed: ${profileUpdateError.message}` }, { status: 500 });
    }

    // 6. Write to local logs
    const adminName = profile.full_name || user.email || "Admin Partner";
    appendAuditLog("CREATE_ADMIN", adminName, `Assigned new admin: ${email} (${fullName})`);

    return NextResponse.json({ success: true, user: adminUser.user });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
