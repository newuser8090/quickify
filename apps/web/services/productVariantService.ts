import { supabase } from "@/lib/supabase";

export type ProductVariant = {
  id: number;
  product_id: number;
  name: string;
  unit: string;
  price: number;
  mrp: number;
  stock: number;
  is_default: boolean;
};

export type ProductVariantFormValues = {
  name: string;
  unit: string;
  price: number;
  mrp: number;
  stock: number;
  is_default: boolean;
};

export async function getProductVariants(productId: number) {
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("id");

  if (error) throw error;

  return data as ProductVariant[];
}

export async function addProductVariant(
  productId: number,
  values: ProductVariantFormValues
) {
  const { error } = await supabase.from("product_variants").insert({
    product_id: productId,
    ...values,
  });

  if (error) throw error;
}

export async function updateProductVariant(
  id: number,
  values: ProductVariantFormValues
) {
  const { error } = await supabase
    .from("product_variants")
    .update(values)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteProductVariant(id: number) {
  const { error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", id);

  if (error) throw error;
}