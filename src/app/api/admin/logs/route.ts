import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import fs from "fs";
import path from "path";

const LOGS_FILE_PATH = path.join(process.cwd(), "src/app/api/admin/logs/logs.json");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getLocalLogs(): any[] {
  try {
    if (!fs.existsSync(LOGS_FILE_PATH)) {
      fs.mkdirSync(path.dirname(LOGS_FILE_PATH), { recursive: true });
      fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(LOGS_FILE_PATH, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Error reading local logs:", err);
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveLocalLog(logItem: any) {
  try {
    const logs = getLocalLogs();
    logs.push(logItem);
    fs.mkdirSync(path.dirname(LOGS_FILE_PATH), { recursive: true });
    fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error("Error saving local log:", err);
  }
}

export async function GET() {
  try {
    const adminSupabase = createServiceRoleClient();
    const { data: dbLogs, error } = await adminSupabase
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && dbLogs && dbLogs.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped = dbLogs.map((l: any) => ({
        id: l.id,
        timestamp: l.created_at,
        action: l.action_type,
        admin: l.admin_email,
        details: l.details,
        target_resource: l.target_resource,
        ip_address: l.ip_address,
      }));
      return NextResponse.json(mapped);
    }
  } catch (err) {
    console.error("Error fetching db admin_logs:", err);
  }

  const localLogs = getLocalLogs();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sorted = [...localLogs].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return NextResponse.json(sorted);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, admin, details, target_resource, ip_address } = body;
    
    if (!action || !admin) {
      return NextResponse.json({ error: "Action and Admin are required fields" }, { status: 400 });
    }

    const timestamp = new Date().toISOString();
    const newLog = {
      id: Math.random().toString(36).substring(2, 10),
      timestamp,
      action,
      admin,
      details: details || "",
      target_resource: target_resource || null,
      ip_address: ip_address || null,
    };

    // 1. Save to Supabase DB
    try {
      const adminSupabase = createServiceRoleClient();
      await adminSupabase.from("admin_logs").insert([
        {
          admin_email: admin,
          action_type: action,
          target_resource: target_resource || null,
          details: details || "",
          ip_address: ip_address || null,
          created_at: timestamp,
        },
      ]);
    } catch (dbErr) {
      console.error("Failed to insert log into Supabase admin_logs DB:", dbErr);
    }

    // 2. Save to local JSON log
    saveLocalLog(newLog);

    return NextResponse.json({ success: true, log: newLog });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
