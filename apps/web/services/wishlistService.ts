import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";
import { SupabaseProduct } from "@/types/supabaseProduct";
import { mapProduct } from "@/utils/mapProduct";

type WishlistRow = {
  product: SupabaseProduct | SupabaseProduct[] | null;
};

export async function fetchUserWishlist(userId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("product:products(*)")
    .eq("user_id", userId);

  if (error) {
    console.error("Fetch wishlist error:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as WishlistRow[])
    .map((item) => {
      const product = Array.isArray(item.product)
        ? item.product[0]
        : item.product;

      return product ? mapProduct(product) : null;
    })
    .filter(Boolean) as Product[];
}

export async function addWishlistItem(userId: string, productId: number) {
  const { error } = await supabase.from("wishlist_items").upsert(
    {
      user_id: userId,
      product_id: productId,
    },
    {
      onConflict: "user_id,product_id",
    }
  );

  if (error) console.error("Add wishlist error:", error.message);
}

export async function deleteWishlistItem(userId: string, productId: number) {
  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) console.error("Delete wishlist error:", error.message);
}