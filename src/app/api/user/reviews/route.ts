import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const userId = authData.user.id;

    const { data: userReviews, error } = await supabase
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
        products (
          id,
          name,
          slug,
          product_images (
            image_url,
            display_order
          )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch user reviews error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reviews: userReviews || [] });
  } catch (err: any) {
    console.error("GET /api/user/reviews internal error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
