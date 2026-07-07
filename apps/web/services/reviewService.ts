import { supabase } from "@/lib/supabase";

export type ProductReview = {
  id: number;
  product_id: number;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
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
  rating: number,
  comment: string
) {
  const { error } = await supabase.from("product_reviews").upsert(
    {
      product_id: productId,
      user_id: userId,
      rating,
      comment,
    },
    {
      onConflict: "product_id,user_id",
    }
  );

  if (error) throw error;
}