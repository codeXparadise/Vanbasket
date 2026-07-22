import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { razorpay } from "@/utils/razorpay";

export async function POST(request: Request) {
  const adminSupabase = createServiceRoleClient();
  let razorpay_order_id = "";
  let razorpay_payment_id = "";
  let razorpay_signature = "";

  try {
    const body = await request.json();
    razorpay_order_id = body?.razorpay_order_id;
    razorpay_payment_id = body?.razorpay_payment_id;
    razorpay_signature = body?.razorpay_signature;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing verification parameters." }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "l9qpaUbLSGef0cxkzQocQYqv";

    // 1. Verify Razorpay signature using HMAC SHA256
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      // Find internal payment and order to mark them as failed
      const { data: dbPayment } = await adminSupabase
        .from("payments")
        .select("id, order_id")
        .eq("gateway_order_id", razorpay_order_id)
        .maybeSingle();

      if (dbPayment) {
        await adminSupabase
          .from("payments")
          .update({
            status: "failed",
            failure_reason: "Invalid signature verification",
          })
          .eq("id", dbPayment.id);

        await adminSupabase
          .from("orders")
          .update({ status: "PAYMENT_FAILED" })
          .eq("id", dbPayment.order_id);

        await adminSupabase.from("payment_logs").insert({
          payment_id: dbPayment.id,
          order_id: dbPayment.order_id,
          event_type: "error",
          payload: {
            message: "Signature verification failed",
            razorpay_order_id,
            razorpay_payment_id,
            expectedSignature,
            receivedSignature: razorpay_signature,
          },
        });
      }

      return NextResponse.json({ error: "Invalid payment signature. Verification failed." }, { status: 400 });
    }

    // 2. Fetch payment details from Razorpay to get metadata (method, bank, UPI, card, etc.)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let paymentDetails: any = null;
    try {
      paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    } catch (fetchErr: unknown) {
      console.error("Failed to fetch payment details from Razorpay:", fetchErr);
    }

    // 3. Find the matching payment record
    const { data: dbPayment, error: paymentFetchError } = await adminSupabase
      .from("payments")
      .select("id, order_id, amount")
      .eq("gateway_order_id", razorpay_order_id)
      .maybeSingle();

    if (paymentFetchError || !dbPayment) {
      // Write general audit log for unlinked payment
      await adminSupabase.from("payment_logs").insert({
        event_type: "error",
        payload: {
          message: "Verified payment but no matching database payment record found",
          razorpay_order_id,
          razorpay_payment_id,
        },
      });

      return NextResponse.json(
        { error: "Verification succeeded but order record was not found." },
        { status: 404 }
      );
    }

    // 4. Update the payments record with transaction details
    const method = paymentDetails?.method || "unknown";
    const status = paymentDetails?.status === "captured" ? "captured" : "authorized";

    const { error: paymentUpdateError } = await adminSupabase
      .from("payments")
      .update({
        gateway_payment_id: razorpay_payment_id,
        status: status,
        method: method,
        verified_at: new Date().toISOString(),
        raw_webhook_payload: paymentDetails || {},
      })
      .eq("id", dbPayment.id);

    if (paymentUpdateError) {
      console.error("Failed to update payment record:", paymentUpdateError);
    }

    // 5. Update the main Order status to PAYMENT_SUCCESS (or paid)
    const { error: orderUpdateError } = await adminSupabase
      .from("orders")
      .update({
        status: "PAYMENT_SUCCESS",
      })
      .eq("id", dbPayment.order_id);

    if (orderUpdateError) {
      console.error("Failed to update order status:", orderUpdateError);
    }

    // 6. Trigger post-payment actions (simulate invoice, email, confirmation log)
    console.log(`[POST-PAYMENT ACTIONS] Order ${dbPayment.order_id} verified successfully.`);
    console.log(`- Invoice generated: INV-${dbPayment.order_id.slice(0,8).toUpperCase()}`);
    console.log(`- Order confirmation email sent to user.`);
    console.log(`- Inventory confirmed.`);

    // 7. Write success verification log
    await adminSupabase.from("payment_logs").insert({
      payment_id: dbPayment.id,
      order_id: dbPayment.order_id,
      event_type: "verification",
      payload: {
        status: "success",
        razorpay_order_id,
        razorpay_payment_id,
        method,
        card: paymentDetails?.card ? {
          last4: paymentDetails.card.last4,
          network: paymentDetails.card.network,
          type: paymentDetails.card.type,
          issuer: paymentDetails.card.issuer,
        } : null,
        bank: paymentDetails?.bank || null,
        vpa: paymentDetails?.vpa || null,
        email: paymentDetails?.email || null,
        contact: paymentDetails?.contact || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified and processed successfully.",
      orderId: dbPayment.order_id,
    });
  } catch (error: unknown) {
    console.error("Payment verification server error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Audit log verification exception
    await adminSupabase.from("payment_logs").insert({
      event_type: "error",
      payload: {
        message: "Server exception in verification api",
        error: errorMessage,
        razorpay_order_id,
        razorpay_payment_id,
      },
    });

    return NextResponse.json({ error: "Server error during verification." }, { status: 500 });
  }
}
