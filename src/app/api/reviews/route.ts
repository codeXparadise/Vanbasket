import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    let productId = searchParams.get("product_id");

    // If product_id not provided, try to find default product
    if (!productId) {
      const { data: defaultProduct } = await supabase
        .from("products")
        .select("id")
        .eq("is_active", true)
        .limit(1)
        .single();

      if (defaultProduct) {
        productId = defaultProduct.id;
      }
    }

    let query = supabase
      .from("product_reviews")
      .select(`
        id,
        product_id,
        user_id,
        rating,
        title,
        comment,
        image_url,
        is_verified_purchase,
        created_at,
        updated_at,
        profiles (
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (productId) {
      query = query.eq("product_id", productId);
    }

    const { data: reviewsData, error } = await query;

    if (error) {
      console.error("Fetch reviews error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const reviews = reviewsData || [];
    const total_reviews = reviews.length;

    // Calculate rating statistics
    const rating_counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum_rating = 0;

    reviews.forEach((r) => {
      const rating = Math.min(5, Math.max(1, Number(r.rating) || 5));
      rating_counts[rating] = (rating_counts[rating] || 0) + 1;
      sum_rating += rating;
    });

    const average_rating = total_reviews > 0 ? Number((sum_rating / total_reviews).toFixed(1)) : 0;

    const rating_percentages: Record<number, number> = {
      5: total_reviews > 0 ? Math.round((rating_counts[5] / total_reviews) * 100) : 0,
      4: total_reviews > 0 ? Math.round((rating_counts[4] / total_reviews) * 100) : 0,
      3: total_reviews > 0 ? Math.round((rating_counts[3] / total_reviews) * 100) : 0,
      2: total_reviews > 0 ? Math.round((rating_counts[2] / total_reviews) * 100) : 0,
      1: total_reviews > 0 ? Math.round((rating_counts[1] / total_reviews) * 100) : 0,
    };

    return NextResponse.json({
      reviews,
      stats: {
        total_reviews,
        average_rating,
        rating_counts,
        rating_percentages,
      },
    });
  } catch (err: any) {
    console.error("GET /api/reviews internal error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ error: "Unauthorized. Please log in to post a review." }, { status: 401 });
    }

    const userId = authData.user.id;
    const body = await req.json();
    const { product_id, rating, title, comment, image_url } = body;

    if (!product_id) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5 stars." }, { status: 400 });
    }

    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return NextResponse.json({ error: "Review text comment is required." }, { status: 400 });
    }

    // Check if user has purchased this product (or mark as verified if orders exist)
    const { data: orderCheck } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    const is_verified_purchase = Boolean(orderCheck && orderCheck.length > 0);

    // Upsert review for this user and product
    const { data: upsertedReview, error: upsertError } = await supabase
      .from("product_reviews")
      .upsert(
        {
          product_id,
          user_id: userId,
          rating: Math.round(numRating),
          title: title ? title.trim() : null,
          comment: comment.trim(),
          image_url: image_url || null,
          is_verified_purchase,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "product_id,user_id" }
      )
      .select(`
        id,
        product_id,
        user_id,
        rating,
        title,
        comment,
        image_url,
        is_verified_purchase,
        created_at,
        updated_at,
        profiles (
          full_name,
          email
        )
      `)
      .single();

    if (upsertError) {
      console.error("Upsert review error:", upsertError);
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Review saved successfully!",
      review: upsertedReview,
    });
  } catch (err: any) {
    console.error("POST /api/reviews internal error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
