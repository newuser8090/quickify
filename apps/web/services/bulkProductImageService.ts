import { supabase } from "@/lib/supabase";

export type BulkImageProduct = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
};

export async function getBulkImageProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, image")
    .order("name", { ascending: true });

  if (error) throw error;

  return (data ?? []) as BulkImageProduct[];
}

export async function updateProductMainImage(
  productId: number,
  imageUrl: string
) {
  const { error } = await supabase
    .from("products")
    .update({
      image: imageUrl,
    })
    .eq("id", productId);

  if (error) throw error;
}

export async function addBulkProductGalleryImage({
  productId,
  imageUrl,
  sortOrder,
}: {
  productId: number;
  imageUrl: string;
  sortOrder: number;
}) {
  const { error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      image_url: imageUrl,
      sort_order: sortOrder,
    });

  if (error) throw error;
}

export async function clearProductGalleryImages(
  productId: number
) {
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId);

  if (error) throw error;
}
