import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";

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

    const { data: address, error: addressError } = await adminSupabase
      .from("addresses")
      .select("id")
      .eq("id", shippingAddressId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (addressError || !address) {
      return NextResponse.json({ error: "Please choose a valid shipping address." }, { status: 400 });
    }

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

    // Cast response to our defined structure
    const dbVariantsTyped = dbVariants as unknown as DBVariant[];

    // 4. Validate all items exist and compute totals
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

    // Generate human-readable order number
    const orderNumber = `ORD-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    // 5. Insert order
    const { data: orderData, error: orderInsertError } = await adminSupabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: "pending",
        subtotal: subtotal,
        shipping_fee: 0,
        total_amount: subtotal,
        currency: "INR",
        shipping_address_id: shippingAddressId,
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
          await adminSupabase.from("orders").delete().eq("id", orderData.id);
          return NextResponse.json(
            { error: "Inventory changed while placing your order. Please review your cart and try again." },
            { status: 409 }
          );
        }
      }
    }

    // Return order ID and order details
    return NextResponse.json({ success: true, orderId: orderData.id, order: orderData });
  } catch {
    return NextResponse.json({ error: "Server error while creating order." }, { status: 500 });
  }
}
