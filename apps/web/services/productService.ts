import { supabase } from "@/lib/supabase";
import { mapProduct } from "@/utils/mapProduct";
import { Product } from "@/types/product";
import { SupabaseProduct } from "@/types/supabaseProduct";

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id");

  if (error) throw error;

  return (data as SupabaseProduct[]).map(mapProduct);
}

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}

export async function getProduct(id: number): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      product_images (
        id,
        image_url,
        sort_order
      ),
      product_variants (
        id,
        product_id,
        name,
        unit,
        price,
        mrp,
        stock,
        is_default
      )
      `
    )
    .eq("id", id)
    .single();

  if (error) return null;

  const product = mapProduct(data as SupabaseProduct);

  return {
    ...product,
    images: data.product_images ?? [],
    variants: data.product_variants ?? [],
  };
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("featured", true);

  if (error) throw error;

  return (data as SupabaseProduct[]).map(mapProduct);
}

export async function getBestSellerProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("bestseller", true);

  if (error) throw error;

  return (data as SupabaseProduct[]).map(mapProduct);
}

export async function getFlashSaleProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .gte("discount", 15);

  if (error) throw error;

  return (data as SupabaseProduct[]).map(mapProduct);
}

export async function getProductsByCategory(
  category: string
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category);

  if (error) throw error;

  return (data as SupabaseProduct[]).map(mapProduct);
}

export async function searchProducts(
  query: string
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .ilike("name", `%${query}%`);

  if (error) throw error;

  return (data as SupabaseProduct[]).map(mapProduct);
}