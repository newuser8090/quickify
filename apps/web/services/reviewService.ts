import { supabase } from "@/lib/supabase";

export type ProductReview = {
  id: number;
  product_id: number;
  user_id: string;
  rating: number;
  comment: string;
  reviewer_email: string | null;
  is_verified_buyer: boolean;
  created_at: string;
  order_item_id: number | null;
updated_at: string | null;
is_edited: boolean;
};

export async function getProductReviews(productId: number) {
  const { data, error } = await supabase
    .from("product_reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data as ProductReview[];
}

export async function upsertProductReview(
  productId: number,
  userId: string,
  userEmail: string | null,
  rating: number,
  comment: string,
  orderItemId?: number
) {
  const { data: existingReview, error: findError } = await supabase
    .from("product_reviews")
    .select("id")
    .eq("order_item_id", orderItemId)
    .eq("user_id", userId)
    .maybeSingle();

  if (findError) throw findError;

  if (existingReview) {
    const { error } = await supabase
      .from("product_reviews")
      .update({
        rating,
        comment,
        reviewer_email: userEmail,
        is_verified_buyer: true,
        updated_at: new Date().toISOString(),
        is_edited: true,
      })
      .eq("id", existingReview.id);

    if (error) throw error;
  } else {
    const { error } = await supabase.from("product_reviews").insert({
      product_id: productId,
      user_id: userId,
      reviewer_email: userEmail,
      is_verified_buyer: true,
      rating,
      comment,
      order_item_id: orderItemId ?? null,
      updated_at: null,
      is_edited: false,
    });

    if (error) throw error;
  }

  await updateProductReviewStats(productId);
}
async function checkVerifiedBuyer(productId: number, userId: string) {
  const { data, error } = await supabase
    .from("order_items")
    .select("id, orders!inner(user_id)")
    .eq("product_id", productId)
    .eq("orders.user_id", userId)
    .limit(1);

  if (error) {
    console.error("Verified buyer check failed:", error.message);
    return false;
  }

  return (data ?? []).length > 0;
}

async function updateProductReviewStats(productId: number) {
  const { data, error } = await supabase
    .from("product_reviews")
    .select("rating")
    .eq("product_id", productId);

  if (error) throw error;

  const reviews = data ?? [];
  const reviewCount = reviews.length;

  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;

  const { error: updateError } = await supabase
    .from("products")
    .update({
      rating: Number(averageRating.toFixed(1)),
      reviews: reviewCount,
    })
    .eq("id", productId);

  if (updateError) throw updateError;
}