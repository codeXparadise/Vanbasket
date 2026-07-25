import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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

    const supabase = await createClient();

    // Format rich message content
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

    // 1. First attempt: Insert using complete columns (if schema updated)
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

    // 2. Fallback attempt: Standard schema columns (name, email, phone, subject, message)
    const { error: fallbackError } = await supabase.from("contact_queries").insert({
      name,
      email,
      phone: phone || null,
      subject: subjectText,
      message: formattedMessage,
    });

    if (fallbackError) {
      console.error("Contact inquiry submission error:", fallbackError);
      throw fallbackError;
    }

    return NextResponse.json({ success: true, message: "Inquiry registered successfully." });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Failed to submit contact query:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit query. Please try again later." },
      { status: 500 }
    );
  }
}
