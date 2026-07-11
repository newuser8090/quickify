import { supabase } from "@/lib/supabase";
import { SupabaseProduct } from "@/types/supabaseProduct";
import { Product } from "@/types/product";
import { mapProduct } from "@/utils/mapProduct";

export type CartItem = Product & {
  quantity: number;
  variantId?: number | null;
  variantName?: string | null;
  cartKey: string;
};

type CartVariant = {
  id: number;
  name: string;
  unit: string;
  price: number;
  mrp: number;
  stock: number;
};

type CartRow = {
  quantity: number;
  variant_id: number | null;
  product: SupabaseProduct | SupabaseProduct[] | null;
  variant: CartVariant | CartVariant[] | null;
};

function getCartKey(productId: number, variantId?: number | null) {
  return `${productId}-${variantId ?? "base"}`;
}

export async function fetchUserCart(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select(
      `
      quantity,
      variant_id,
      product:products (*),
      variant:product_variants (*)
      `
    )
    .eq("user_id", userId);

  if (error) {
    console.error("Fetch cart error:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as CartRow[])
    .map((item) => {
      const product = Array.isArray(item.product)
        ? item.product[0]
        : item.product;

      const variant = Array.isArray(item.variant)
        ? item.variant[0]
        : item.variant;

      if (!product) return null;

      const mappedProduct = mapProduct(product);

      return {
        ...mappedProduct,
        quantity: item.quantity,
        variantId: item.variant_id,
        variantName: variant?.name ?? null,
        unit: variant?.unit ?? mappedProduct.unit,
        price: variant?.price ?? mappedProduct.price,
        mrp: variant?.mrp ?? mappedProduct.mrp,
        stock: variant?.stock ?? mappedProduct.stock,
        cartKey: getCartKey(mappedProduct.id, item.variant_id),
      };
    })
    .filter(Boolean) as CartItem[];
}

export async function upsertCartItem(
  userId: string,
  productId: number,
  quantity: number,
  variantId?: number | null
) {
  let query = supabase
    .from("cart_items")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId);

  query =
    variantId == null
      ? query.is("variant_id", null)
      : query.eq("variant_id", variantId);

  const { data: existing, error: fetchError } = await query.maybeSingle();

  if (fetchError) {
    console.error("Find cart item error:", fetchError.message);
    return;
  }

  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", existing.id);

    if (error) console.error("Update cart error:", error.message);

    return;
  }

  const { error } = await supabase.from("cart_items").insert({
    user_id: userId,
    product_id: productId,
    variant_id: variantId ?? null,
    quantity,
  });

  if (error) console.error("Insert cart error:", error.message);
}

export async function deleteCartItem(
  userId: string,
  productId: number,
  variantId?: number | null
) {
  let query = supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  query =
    variantId == null
      ? query.is("variant_id", null)
      : query.eq("variant_id", variantId);

  const { error } = await query;

  if (error) console.error("Delete cart error:", error.message);
}

export async function clearUserCart(userId: string) {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId);

  if (error) console.error("Clear cart error:", error.message);

}
export async function fetchUserSavedCart(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("saved_cart_items")
    .select(
      `
      quantity,
      variant_id,
      product:products (*),
      variant:product_variants (*)
      `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch saved cart error:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as CartRow[])
    .map((item) => {
      const product = Array.isArray(item.product)
        ? item.product[0]
        : item.product;

      const variant = Array.isArray(item.variant)
        ? item.variant[0]
        : item.variant;

      if (!product) return null;

      const mappedProduct = mapProduct(product);

      return {
        ...mappedProduct,
        quantity: item.quantity,
        variantId: item.variant_id,
        variantName: variant?.name ?? null,
        unit: variant?.unit ?? mappedProduct.unit,
        price: variant?.price ?? mappedProduct.price,
        mrp: variant?.mrp ?? mappedProduct.mrp,
        stock: variant?.stock ?? mappedProduct.stock,
        cartKey: getCartKey(mappedProduct.id, item.variant_id),
      };
    })
    .filter(Boolean) as CartItem[];
}

export async function upsertSavedCartItem(
  userId: string,
  productId: number,
  quantity: number,
  variantId?: number | null
) {
  let query = supabase
    .from("saved_cart_items")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId);

  query =
    variantId == null
      ? query.is("variant_id", null)
      : query.eq("variant_id", variantId);

  const { data: existing, error: fetchError } = await query.maybeSingle();

  if (fetchError) {
    console.error("Find saved item error:", fetchError.message);
    return;
  }

  if (existing) {
    const { error } = await supabase
      .from("saved_cart_items")
      .update({ quantity })
      .eq("id", existing.id);

    if (error) console.error("Update saved item error:", error.message);

    return;
  }

  const { error } = await supabase.from("saved_cart_items").insert({
    user_id: userId,
    product_id: productId,
    variant_id: variantId ?? null,
    quantity,
  });

  if (error) console.error("Insert saved item error:", error.message);
}

export async function deleteSavedCartItem(
  userId: string,
  productId: number,
  variantId?: number | null
) {
  let query = supabase
    .from("saved_cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  query =
    variantId == null
      ? query.is("variant_id", null)
      : query.eq("variant_id", variantId);

  const { error } = await query;

  if (error) console.error("Delete saved item error:", error.message);
}

export async function clearUserSavedCart(userId: string) {
  const { error } = await supabase
    .from("saved_cart_items")
    .delete()
    .eq("user_id", userId);

  if (error) console.error("Clear saved cart error:", error.message);
}