import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { razorpay } from "@/utils/razorpay";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    // 1. Check user auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { orderId, reason } = body || {};

    if (typeof orderId !== "string" || !UUID_PATTERN.test(orderId)) {
      return NextResponse.json({ error: "Valid Order ID is required." }, { status: 400 });
    }

    const adminSupabase = createServiceRoleClient();

    // 3. Fetch order with order_items and payments
    const { data: order, error: orderError } = await adminSupabase
      .from("orders")
      .select("*, order_items(*), payments(*)")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // 4. Verify ownership
    if (order.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized. You cannot cancel this order." }, { status: 403 });
    }

    // 5. Verify status eligibility
    const statusLower = (order.status || "").toLowerCase();
    if (["cancelled", "refunded"].includes(statusLower)) {
      return NextResponse.json({ error: "This order is already cancelled." }, { status: 400 });
    }

    if (statusLower === "delivered") {
      return NextResponse.json({
        error: "Delivered orders cannot be cancelled directly. Please contact customer support."
      }, { status: 400 });
    }

    // 6. Check payments for online Razorpay payment to refund
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onlinePayment = (order.payments || []).find((p: any) => {
      const g = (p.gateway || "").toLowerCase();
      const st = (p.status || "").toLowerCase();
      return (
        g === "razorpay" &&
        ["captured", "authorized", "paid", "success"].includes(st) &&
        Boolean(p.gateway_payment_id)
      );
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let refundResult: any = null;
    let refundErrorMsg = null;

    if (onlinePayment && onlinePayment.gateway_payment_id) {
      try {
        const refundAmountPaise = Math.round(Number(order.total_amount) * 100);
        refundResult = await razorpay.payments.refund(onlinePayment.gateway_payment_id, {
          amount: refundAmountPaise,
          notes: {
            reason: reason || "User cancelled order from profile dashboard",
            order_id: order.id,
            order_number: order.order_number,
            user_email: user.email || "",
          },
        });

        const exactReason = reason && String(reason).trim() ? String(reason).trim() : "Cancelled by customer";

        // Update payment record in database
        await adminSupabase
          .from("payments")
          .update({
            status: "refunded",
            raw_webhook_payload: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...((onlinePayment.raw_webhook_payload as any) || {}),
              refund_id: refundResult.id,
              refund_amount: refundResult.amount,
              refund_status: refundResult.status,
              refunded_at: new Date().toISOString(),
              reason: exactReason,
              user_reason: exactReason,
            },
          })
          .eq("id", onlinePayment.id);
      } catch (rzpErr: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errObj = rzpErr as any;
        console.error("Razorpay refund error:", errObj);
        refundErrorMsg = errObj?.description || errObj?.message || String(errObj);
        return NextResponse.json({
          error: `Razorpay Refund Error: ${refundErrorMsg}. Please contact support.`
        }, { status: 502 });
      }
    }

    // 7. Restore Inventory Stock for variants
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const item of (order.order_items || []) as any[]) {
      if (item.variant_id) {
        const { data: dbVariant } = await adminSupabase
          .from("product_variants")
          .select("stock_qty")
          .eq("id", item.variant_id)
          .maybeSingle();

        if (dbVariant && typeof dbVariant.stock_qty === "number") {
          await adminSupabase
            .from("product_variants")
            .update({ stock_qty: dbVariant.stock_qty + item.quantity })
            .eq("id", item.variant_id);
        }
      }
    }

    // 8. Update order status to 'refunded' (if online refund) or 'cancelled' (if COD / unpaid)
    const finalStatus = onlinePayment ? "refunded" : "cancelled";
    const userInputReason = reason && String(reason).trim() ? String(reason).trim() : "Cancelled by customer";
    const cancelledTimestamp = new Date().toISOString();

    const { error: updateOrderError } = await adminSupabase
      .from("orders")
      .update({
        status: finalStatus,
        updated_at: cancelledTimestamp,
      })
      .eq("id", order.id);

    if (updateOrderError) {
      return NextResponse.json({ error: `Failed to update order status: ${updateOrderError.message}` }, { status: 500 });
    }

    // 9. Insert record into dedicated public.cancelled_orders database table
    try {
      // Fetch customer profile details if available
      const { data: profile } = await adminSupabase
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", user.id)
        .maybeSingle();

      await adminSupabase.from("cancelled_orders").insert([
        {
          order_id: order.id,
          order_number: order.order_number,
          user_id: user.id,
          customer_name: profile?.full_name || user.email || "Customer",
          customer_email: user.email || profile?.email || null,
          customer_phone: profile?.phone || null,
          cancel_reason: userInputReason,
          total_amount: Number(order.total_amount || 0),
          payment_gateway: onlinePayment ? "razorpay" : "cod",
          refund_id: refundResult?.id || null,
          refund_status: finalStatus,
          cancelled_at: cancelledTimestamp,
        },
      ]);
    } catch (insertErr) {
      console.error("Non-fatal: Could not insert into public.cancelled_orders table:", insertErr);
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      order_number: order.order_number,
      new_status: finalStatus,
      refund_processed: Boolean(onlinePayment),
      refund_id: refundResult?.id || null,
      message: onlinePayment
        ? `Order cancelled successfully. A full refund of ₹${Number(order.total_amount).toFixed(2)} has been initiated to your original bank account via Razorpay (Refund ID: ${refundResult?.id || 'Processed'}).`
        : "Order cancelled successfully.",
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Order cancel server error:", error);
    return NextResponse.json({ error: error.message || "Failed to process cancellation." }, { status: 500 });
  }
}
