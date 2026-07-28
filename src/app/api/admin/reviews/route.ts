import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const ratingFilter = searchParams.get("rating");
    const searchQuery = searchParams.get("search");

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
        ),
        products (
          id,
          name,
          slug
        )
      `, { count: "exact" })
      .order("created_at", { ascending: false });

    if (ratingFilter && ratingFilter !== "all") {
      const numStar = Number(ratingFilter);
      if (!isNaN(numStar) && numStar >= 1 && numStar <= 5) {
        query = query.eq("rating", numStar);
      }
    }

    if (searchQuery && searchQuery.trim()) {
      const term = `%${searchQuery.trim()}%`;
      query = query.or(`title.ilike.${term},comment.ilike.${term}`);
    }

    const { data: reviews, count, error } = await query;

    if (error) {
      console.error("Admin fetch reviews error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also get overall counts per star for admin summary metrics
    const { data: allRatings } = await supabase
      .from("product_reviews")
      .select("rating");

    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    (allRatings || []).forEach((r) => {
      const star = Math.min(5, Math.max(1, Number(r.rating) || 5));
      counts[star] = (counts[star] || 0) + 1;
    });

    return NextResponse.json({
      reviews: reviews || [],
      total: count || 0,
      rating_distribution: counts,
    });
  } catch (err: any) {
    console.error("GET /api/admin/reviews internal error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get("id");

    if (!reviewId) {
      return NextResponse.json({ error: "Review ID parameter missing." }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from("product_reviews")
      .delete()
      .eq("id", reviewId);

    if (deleteError) {
      console.error("Admin delete review error:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Review deleted successfully by admin." });
  } catch (err: any) {
    console.error("DELETE /api/admin/reviews internal error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
