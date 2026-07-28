import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: reviewId } = await params;

    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const userId = authData.user.id;
    const body = await req.json();
    const { rating, title, comment, image_url } = body;

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5 stars." }, { status: 400 });
    }

    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return NextResponse.json({ error: "Comment is required." }, { status: 400 });
    }

    // Verify ownership
    const { data: existingReview, error: fetchError } = await supabase
      .from("product_reviews")
      .select("id, user_id")
      .eq("id", reviewId)
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json({ error: "Review not found." }, { status: 404 });
    }

    if (existingReview.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden. You can only edit your own review." }, { status: 403 });
    }

    const { data: updatedReview, error: updateError } = await supabase
      .from("product_reviews")
      .update({
        rating: Math.round(numRating),
        title: title ? title.trim() : null,
        comment: comment.trim(),
        image_url: image_url !== undefined ? image_url : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reviewId)
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

    if (updateError) {
      console.error("Update review error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Review updated successfully!",
      review: updatedReview,
    });
  } catch (err: any) {
    console.error("PUT /api/reviews/[id] internal error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: reviewId } = await params;

    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const userId = authData.user.id;

    // Check if user is admin or owner
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    const isAdmin = profile?.role === "admin";

    const { data: existingReview, error: fetchError } = await supabase
      .from("product_reviews")
      .select("id, user_id")
      .eq("id", reviewId)
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json({ error: "Review not found." }, { status: 404 });
    }

    if (!isAdmin && existingReview.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden. You can only delete your own review." }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from("product_reviews")
      .delete()
      .eq("id", reviewId);

    if (deleteError) {
      console.error("Delete review error:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Review deleted successfully." });
  } catch (err: any) {
    console.error("DELETE /api/reviews/[id] internal error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
