import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import fs from "fs";
import path from "path";

const BACKUP_QUERIES_FILE = path.join(process.cwd(), "src/app/api/admin/logs/queries_backup.json");

// Helper to get local backup queries
function getBackupQueries(): Record<string, unknown>[] {
  try {
    if (!fs.existsSync(BACKUP_QUERIES_FILE)) return [];
    const data = fs.readFileSync(BACKUP_QUERIES_FILE, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Error reading backup queries file:", err);
    return [];
  }
}

// Helper to remove a query from backup file
function deleteBackupQuery(id: string) {
  try {
    if (!fs.existsSync(BACKUP_QUERIES_FILE)) return;
    const data = fs.readFileSync(BACKUP_QUERIES_FILE, "utf8");
    const queries = JSON.parse(data || "[]");
    const filtered = queries.filter((q: Record<string, unknown>) => q.id !== id);
    fs.writeFileSync(BACKUP_QUERIES_FILE, JSON.stringify(filtered, null, 2));
  } catch (err) {
    console.error("Error deleting backup query:", err);
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const backupQueries = getBackupQueries();

    const { data: dbQueries, error } = await supabase
      .from("contact_queries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("DB contact_queries fetch warning:", error.message);
    }

    const mergedMap = new Map<string, Record<string, unknown>>();

    // 1. Add local backup queries
    backupQueries.forEach((q) => {
      if (q.id) {
        mergedMap.set(String(q.id), q);
      }
    });

    // 2. Add DB queries (override if present)
    if (dbQueries && Array.isArray(dbQueries)) {
      dbQueries.forEach((q) => {
        mergedMap.set(q.id, q);
      });
    }

    const mergedList = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(String(b.created_at || "")).getTime() - new Date(String(a.created_at || "")).getTime()
    );

    return NextResponse.json(mergedList);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Failed to fetch admin queries:", error);
    // Return backup queries if DB fails
    const backupQueries = getBackupQueries();
    return NextResponse.json(backupQueries);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Query ID is required" }, { status: 400 });
    }

    // Delete from local backup
    deleteBackupQuery(id);

    // Delete from Supabase DB
    try {
      const supabase = await createClient();
      await supabase.from("contact_queries").delete().eq("id", id);
    } catch {
      // Ignore if table missing in DB
    }

    return NextResponse.json({ success: true, message: "Query deleted successfully." });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
