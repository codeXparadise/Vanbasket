import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import fs from "fs";
import path from "path";

const BACKUP_QUERIES_FILE = path.join(process.cwd(), "src/app/api/admin/logs/queries_backup.json");

// Helper to save backup queries if Supabase table does not exist
function saveBackupQuery(query: Record<string, unknown>) {
  try {
    fs.mkdirSync(path.dirname(BACKUP_QUERIES_FILE), { recursive: true });
    let existing: Record<string, unknown>[] = [];
    if (fs.existsSync(BACKUP_QUERIES_FILE)) {
      const data = fs.readFileSync(BACKUP_QUERIES_FILE, "utf8");
      existing = JSON.parse(data || "[]");
    }
    existing.unshift({
      id: Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      ...query,
    });
    fs.writeFileSync(BACKUP_QUERIES_FILE, JSON.stringify(existing, null, 2));
  } catch (err) {
    console.error("Failed to save backup query file:", err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, company, quantity, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required fields." },
        { status: 400 }
      );
    }

    const formattedMessage = [
      `[Target Reserve / Batch]: ${quantity || "General"}`,
      company ? `[Company]: ${company}` : null,
      phone ? `[Phone]: ${phone}` : null,
      "\n--- Message Details ---",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    const subjectText = `Inquiry: ${quantity || "General"} ${company ? `(${company})` : ""}`.trim();

    try {
      const supabase = await createClient();

      // 1. Attempt insert with full columns
      const { error: primaryError } = await supabase.from("contact_queries").insert({
        name,
        email,
        phone: phone || null,
        company: company || null,
        quantity: quantity || null,
        message: message,
        subject: subjectText,
      });

      if (!primaryError) {
        return NextResponse.json({ success: true, message: "Inquiry registered successfully." });
      }

      // 2. Attempt insert with standard columns
      const { error: fallbackError } = await supabase.from("contact_queries").insert({
        name,
        email,
        phone: phone || null,
        subject: subjectText,
        message: formattedMessage,
      });

      if (!fallbackError) {
        return NextResponse.json({ success: true, message: "Inquiry registered successfully." });
      }

      // If table is missing in Supabase schema cache
      if (fallbackError.message?.includes("schema cache") || fallbackError.code === "PGRST205" || fallbackError.code === "42P01") {
        console.warn("contact_queries table missing in Supabase DB. Saving to local backup registry...");
        saveBackupQuery({ name, email, phone, company, quantity, message, subject: subjectText });
        return NextResponse.json({ success: true, message: "Inquiry registered successfully." });
      }

      throw fallbackError;
    } catch (dbErr: unknown) {
      const err = dbErr as Error;
      if (err.message?.includes("schema cache") || (err as { code?: string }).code === "PGRST205") {
        console.warn("contact_queries table missing. Storing in local backup file...");
        saveBackupQuery({ name, email, phone, company, quantity, message, subject: subjectText });
        return NextResponse.json({ success: true, message: "Inquiry registered successfully." });
      }
      throw dbErr;
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Failed to submit contact query:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit query. Please try again later." },
      { status: 500 }
    );
  }
}
