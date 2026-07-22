import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceRoleClient } from "@/utils/supabase/service-role";

export async function POST(request: Request) {
  const adminSupabase = createServiceRoleClient();
  let rawBody = "";
  let signature = "";

  try {
    signature = request.headers.get("x-razorpay-signature") || "";
    rawBody = await request.text();

    if (!signature) {
      console.warn("Webhook signature missing. Ignoring request.");
      return NextResponse.json({ error: "Missing signature header." }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "razorpay_webhook_secret_123";

    // 1. Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("Invalid webhook signature mismatch. Ignoring request.");
      return NextResponse.json({ error: "Signature verification failed." }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event;
    const eventId = payload.id || `evt_fallback_${eventType}_${crypto.randomUUID().slice(0, 8)}`;

    // 2. Webhook idempotency check using database constraint
    const { error: dbInsertError } = await adminSupabase
      .from("webhook_events")
      .insert({
        gateway: "razorpay",
        event_type: eventType,
        event_id: eventId,
        payload: payload,
        processed: false,
      });

    if (dbInsertError) {
      // If code is 23505 (unique_violation in Postgres), it's a duplicate. Ignore it.
      if (dbInsertError.code === "23505") {
        console.log(`Webhook duplicate event ${eventId} already recorded. Skipping.`);
        return NextResponse.json({ success: true, message: "Duplicate event ignored." });
      }

      console.error("Failed to log webhook event:", dbInsertError);
      return NextResponse.json({ error: "Database error recording event." }, { status: 500 });
    }

    // 3. Process the event based on type
    const paymentData = payload.payload?.payment?.entity;
    const orderData = payload.payload?.order?.entity;

    const rzpPaymentId = paymentData?.id;
    const rzpOrderId = paymentData?.order_id || orderData?.id;

    if (rzpOrderId) {
      // Find matching payment in DB
      const { data: dbPayment } = await adminSupabase
        .from("payments")
        .select("id, order_id")
        .eq("gateway_order_id", rzpOrderId)
        .maybeSingle();

      if (dbPayment) {
        if (eventType === "payment.captured" || eventType === "order.paid") {
          // Update payment record
          await adminSupabase
            .from("payments")
            .update({
              gateway_payment_id: rzpPaymentId,
              status: "captured",
              method: paymentData?.method || "unknown",
              verified_at: new Date().toISOString(),
            })
            .eq("id", dbPayment.id);

          // Update order record
          await adminSupabase
            .from("orders")
            .update({ status: "PAYMENT_SUCCESS" })
            .eq("id", dbPayment.order_id);

          // Write audit log
          await adminSupabase.from("payment_logs").insert({
            payment_id: dbPayment.id,
            order_id: dbPayment.order_id,
            event_type: "webhook",
            payload: { event: eventType, payload },
          });

        } else if (eventType === "payment.failed") {
          // Update payment record
          await adminSupabase
            .from("payments")
            .update({
              gateway_payment_id: rzpPaymentId,
              status: "failed",
              failure_reason: paymentData?.error_description || "Payment failed via gateway",
            })
            .eq("id", dbPayment.id);

          // Update order record
          await adminSupabase
            .from("orders")
            .update({ status: "PAYMENT_FAILED" })
            .eq("id", dbPayment.order_id);

          // Write audit log
          await adminSupabase.from("payment_logs").insert({
            payment_id: dbPayment.id,
            order_id: dbPayment.order_id,
            event_type: "webhook",
            payload: { event: eventType, payload },
          });

        } else if (eventType === "refund.processed") {
          // Update payment record
          await adminSupabase
            .from("payments")
            .update({
              status: "refunded",
            })
            .eq("id", dbPayment.id);

          // Update order record
          await adminSupabase
            .from("orders")
            .update({ status: "REFUNDED" })
            .eq("id", dbPayment.order_id);

          // Write audit log
          await adminSupabase.from("payment_logs").insert({
            payment_id: dbPayment.id,
            order_id: dbPayment.order_id,
            event_type: "webhook",
            payload: { event: eventType, payload },
          });
        }
      } else {
        console.warn(`No matching order/payment record found for Razorpay Order: ${rzpOrderId}`);
      }
    }

    // 4. Mark webhook event as processed
    await adminSupabase
      .from("webhook_events")
      .update({ processed: true })
      .eq("gateway", "razorpay")
      .eq("event_id", eventId);

    return NextResponse.json({ success: true, message: "Webhook processed successfully." });
  } catch (error: unknown) {
    console.error("Webhook processing server error:", error);
    return NextResponse.json({ error: "Server error during webhook processing." }, { status: 500 });
  }
}
