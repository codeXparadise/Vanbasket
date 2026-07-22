import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LOGS_FILE_PATH = path.join(process.cwd(), "src/app/api/admin/logs/logs.json");

// Helper to ensure file exists and read logs
function getLogs() {
  try {
    if (!fs.existsSync(LOGS_FILE_PATH)) {
      // Create directories if needed
      fs.mkdirSync(path.dirname(LOGS_FILE_PATH), { recursive: true });
      fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(LOGS_FILE_PATH, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Error reading logs:", err);
    return [];
  }
}

// Helper to write logs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveLogs(logs: any[]) {
  try {
    fs.mkdirSync(path.dirname(LOGS_FILE_PATH), { recursive: true });
    fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error("Error saving logs:", err);
  }
}

export async function GET() {
  const logs = getLogs();
  // Sort logs by timestamp descending
  const sorted = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return NextResponse.json(sorted);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, admin, details } = body;
    
    if (!action || !admin) {
      return NextResponse.json({ error: "Action and Admin are required fields" }, { status: 400 });
    }

    const logs = getLogs();
    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      action,
      admin,
      details: details || "",
    };

    logs.push(newLog);
    saveLogs(logs);

    return NextResponse.json({ success: true, log: newLog });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
