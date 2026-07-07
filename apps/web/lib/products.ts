import { supabase } from "@/lib/supabase";
import { SupabaseProduct } from "@/types/supabaseProduct";

export async function getProducts(): Promise<SupabaseProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching products:", error.message);
    return [];
  }

  return data ?? [];
}