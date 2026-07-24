import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { razorpay } from "@/utils/razorpay";

interface CartInputItem {
  id: string;
  quantity: number;
}

interface DBVariant {
  id: string;
  price: number;
  stock_qty: number;
  size_label: string;
  is_active: boolean;
  products: {
    name: string;
    is_active: boolean;
  } | null;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidCartItem(item: unknown): item is CartInputItem {
  if (!item || typeof item !== "object") return false;
  const candidate = item as CartInputItem;
  return (
    typeof candidate.id === "string" &&
    UUID_PATTERN.test(candidate.id) &&
    Number.isInteger(candidate.quantity) &&
    candidate.quantity > 0 &&
    candidate.quantity <= 99
  );
}

export async function POST(request: Request) {
  try {
    // 1. Verify user is authenticated server-side
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    // 2. Read cart items and address ID from body
    const body = await request.json();
    const cartItems = body?.cartItems;
    const shippingAddressId = body?.shippingAddressId;
    const couponCode = body?.couponCode;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    if (cartItems.length > 25 || !cartItems.every(isValidCartItem)) {
      return NextResponse.json({ error: "Cart contains invalid items." }, { status: 400 });
    }

    if (typeof shippingAddressId !== "string" || !UUID_PATTERN.test(shippingAddressId)) {
      return NextResponse.json({ error: "Shipping address is required." }, { status: 400 });
    }

    const adminSupabase = createServiceRoleClient();
    
    // Deduplicate cart items
    const typedCartItems = Array.from(
      cartItems.reduce((acc: Map<string, CartInputItem>, item: CartInputItem) => {
        const existing = acc.get(item.id);
        acc.set(item.id, {
          id: item.id,
          quantity: (existing?.quantity || 0) + item.quantity,
        });
        return acc;
      }, new Map<string, CartInputItem>()).values()
    );

    if (typedCartItems.some((item) => item.quantity > 99)) {
      return NextResponse.json({ error: "Cart contains invalid item quantities." }, { status: 400 });
    }
    const variantIds = typedCartItems.map((item) => item.id);

    // Validate shipping address belongs to user
    const { data: address, error: addressError } = await adminSupabase
      .from("addresses")
      .select("id")
      .eq("id", shippingAddressId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (addressError || !address) {
      return NextResponse.json({ error: "Please choose a valid shipping address." }, { status: 400 });
    }

    // Fetch database pricing and stock information
    const { data: dbVariants, error: variantError } = await adminSupabase
      .from("product_variants")
      .select("id, price, stock_qty, size_label, is_active, products (name, is_active)")
      .in("id", variantIds);

    if (variantError || !dbVariants || dbVariants.length !== variantIds.length) {
      return NextResponse.json(
        { error: "Failed to validate product variants. Some products might no longer exist." },
        { status: 400 }
      );
    }

    const dbVariantsTyped = dbVariants as unknown as DBVariant[];

    // Calculate totals based on database prices (never trust client)
    let subtotal = 0;
    const itemsToInsert: {
      order_id?: string;
      variant_id: string | null;
      product_name_snapshot: string;
      variant_label_snapshot: string;
      unit_price: number;
      quantity: number;
      line_total: number;
    }[] = [];

    for (const item of typedCartItems) {
      const dbVariant = dbVariantsTyped.find((v) => v.id === item.id);
      
      if (!dbVariant) {
        return NextResponse.json({ error: `Product variant with ID ${item.id} not found.` }, { status: 400 });
      }

      if (!dbVariant.is_active || !dbVariant.products?.is_active) {
        return NextResponse.json({ error: `${dbVariant.size_label} is no longer available.` }, { status: 400 });
      }

      if (dbVariant.stock_qty < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for size ${dbVariant.size_label}. Only ${dbVariant.stock_qty} left.` },
          { status: 400 }
        );
      }

      const itemPrice = Number(dbVariant.price);
      const lineTotal = itemPrice * item.quantity;
      subtotal += lineTotal;

      const productName = dbVariant.products && !Array.isArray(dbVariant.products)
        ? (dbVariant.products as { name: string }).name
        : "Raw Wildflower Honey";

      itemsToInsert.push({
        variant_id: dbVariant.id,
        product_name_snapshot: productName,
        variant_label_snapshot: dbVariant.size_label,
        unit_price: itemPrice,
        quantity: item.quantity,
        line_total: lineTotal,
      });
    }

    // Apply Coupon Code Rules
    let discountAmount = 0;
    if (couponCode && typeof couponCode === "string" && couponCode.trim() !== "") {
      const { data: coupon, error: couponError } = await adminSupabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (couponError || !coupon) {
        return NextResponse.json({ error: "Invalid or inactive coupon code." }, { status: 400 });
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return NextResponse.json({ error: "Coupon code has expired." }, { status: 400 });
      }

      if (subtotal < Number(coupon.min_order_amount)) {
        return NextResponse.json({
          error: `Coupon requires a minimum order total of ₹${Number(coupon.min_order_amount).toFixed(2)}.`
        }, { status: 400 });
      }

      if (coupon.discount_type === "percentage") {
        discountAmount = (subtotal * Number(coupon.discount_value)) / 100;
      } else {
        discountAmount = Number(coupon.discount_value);
      }

      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }
    }

    const finalTotal = subtotal - discountAmount;

    // Generate human-readable order number
    const orderNumber = `ORD-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    // [FIXED] - Add Cash on Delivery (COD) Payment Option
    const paymentMethod = typeof body?.paymentMethod === "string" ? body.paymentMethod : "online";
    const initialStatus = "pending";

    // 5. Insert order
    const { data: orderData, error: orderInsertError } = await adminSupabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: initialStatus,
        subtotal: subtotal,
        shipping_fee: 0,
        total_amount: finalTotal,
        currency: "INR",
        shipping_address_id: shippingAddressId,
        coupon_code: couponCode ? couponCode.trim().toUpperCase() : null,
        discount_amount: discountAmount,
      })
      .select()
      .single();

    if (orderInsertError || !orderData) {
      return NextResponse.json(
        { error: `Failed to create order: ${orderInsertError?.message}` },
        { status: 500 }
      );
    }

    // 6. Insert order items
    const orderItemsWithId = itemsToInsert.map((item) => ({
      ...item,
      order_id: orderData.id,
    }));

    const { error: itemsInsertError } = await adminSupabase
      .from("order_items")
      .insert(orderItemsWithId);

    if (itemsInsertError) {
      // Rollback order if items insertion fails
      await adminSupabase.from("orders").delete().eq("id", orderData.id);
      return NextResponse.json(
        { error: `Failed to insert order items: ${itemsInsertError.message}` },
        { status: 500 }
      );
    }

    // 7. Update inventory stock quantities (deduction)
    for (const item of typedCartItems) {
      const dbVariant = dbVariantsTyped.find((v) => v.id === item.id);
      if (dbVariant) {
        const newStock = dbVariant.stock_qty - item.quantity;
        const { data: stockUpdateRows, error: stockUpdateError } = await adminSupabase
          .from("product_variants")
          .update({ stock_qty: newStock })
          .eq("id", item.id)
          .gte("stock_qty", item.quantity)
          .select("id");

        if (stockUpdateError || !stockUpdateRows || stockUpdateRows.length !== 1) {
          // Rollback order
          await adminSupabase.from("orders").delete().eq("id", orderData.id);
          return NextResponse.json(
            { error: "Inventory changed while placing your order. Please review your cart and try again." },
            { status: 409 }
          );
        }
      }
    }

    // [FIXED] - Add Cash on Delivery (COD) Payment Option
    if (paymentMethod === "cod") {
      const { error: paymentInsertError } = await adminSupabase
        .from("payments")
        .insert({
          order_id: orderData.id,
          gateway: "cod",
          gateway_order_id: `COD-${orderNumber}`,
          gateway_payment_id: `COD-PAY-${orderNumber}`,
          status: "pending_cod",
          amount: finalTotal,
          currency: "INR",
          method: "Cash on Delivery",
        })
        .select()
        .single();

      if (paymentInsertError) {
        console.error("Warning: Failed to log COD payment record:", paymentInsertError);
      }

      return NextResponse.json({
        success: true,
        payment_method: "cod",
        is_cod: true,
        order_id: `COD-${orderNumber}`,
        amount: Math.round(finalTotal * 100),
        currency: "INR",
        receipt: orderNumber,
        db_order_id: orderData.id,
        order_number: orderNumber,
        status: "pending_cod",
      });
    }

    // 8. Create Razorpay order
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(finalTotal * 100), // in paise (e.g. ₹950 -> 95000)
        currency: "INR",
        receipt: orderNumber,
        notes: {
          db_order_id: orderData.id,
          user_id: user.id,
        },
      });
    } catch (rzpErr: unknown) {
      const errorMessage = rzpErr instanceof Error ? rzpErr.message : String(rzpErr);
      // Rollback order database rows and stock
      // Restore stock
      for (const item of typedCartItems) {
        const dbVariant = dbVariantsTyped.find((v) => v.id === item.id);
        if (dbVariant) {
          await adminSupabase
            .from("product_variants")
            .update({ stock_qty: dbVariant.stock_qty })
            .eq("id", item.id);
        }
      }
      await adminSupabase.from("orders").delete().eq("id", orderData.id);

      return NextResponse.json(
        { error: `Failed to create payment order with gateway: ${errorMessage}` },
        { status: 502 }
      );
    }

    // 9. Store pending payment record
    const { data: paymentData, error: paymentInsertError } = await adminSupabase
      .from("payments")
      .insert({
        order_id: orderData.id,
        gateway: "razorpay",
        gateway_order_id: razorpayOrder.id,
        status: "created",
        amount: finalTotal,
        currency: "INR",
      })
      .select()
      .single();

    if (paymentInsertError) {
      console.error("Warning: Failed to log initial payment record:", paymentInsertError);
    }

    // 10. Audit log the order creation request/response (optional logger)
    try {
      await adminSupabase.from("payment_logs").insert({
        payment_id: paymentData?.id || null,
        order_id: orderData.id,
        event_type: "request",
        payload: {
          action: "create-order",
          cartItems: typedCartItems,
          dbOrder: orderData,
          razorpayOrder: {
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            receipt: razorpayOrder.receipt,
          },
        },
      });
    } catch {
      // Optional logger
    }

    return NextResponse.json({
      success: true,
      payment_method: "online",
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      db_order_id: orderData.id,
      order_number: orderNumber,
    });
  } catch (error: unknown) {
    console.error("Payment order create server error:", error);
    return NextResponse.json({ error: "Server error while initializing payment order." }, { status: 500 });
  }
}
