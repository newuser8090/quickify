import { supabase } from "@/lib/supabase";

export type ProductImageRow = {
  id: number;
  product_id: number;
  image_url: string;
  sort_order: number;
};

export async function getProductImages(productId: number) {
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return data as ProductImageRow[];
}

export async function addProductImage(
  productId: number,
  imageUrl: string,
  sortOrder = 0
) {
  const { error } = await supabase.from("product_images").insert({
    product_id: productId,
    image_url: imageUrl,
    sort_order: sortOrder,
  });

  if (error) throw error;
}

export async function deleteProductImage(id: number) {
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", id);

  if (error) throw error;
}