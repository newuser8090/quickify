import { supabase } from "@/lib/supabase";
import { CartItem } from "@/store/cartStore";

export async function validateCartStock(items: CartItem[]) {
  const issues: string[] = [];

  for (const item of items) {
    if (item.variantId) {
      const { data } = await supabase
        .from("product_variants")
        .select("stock")
        .eq("id", item.variantId)
        .single();

      if (!data) {
        issues.push(`${item.name} is no longer available.`);
        continue;
      }

      if (item.quantity > data.stock) {
        issues.push(
          `${item.name} (${item.unit}) has only ${data.stock} left.`
        );
      }
    } else {
      const { data } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.id)
        .single();

      if (!data) {
        issues.push(`${item.name} is no longer available.`);
        continue;
      }

      if (item.quantity > data.stock) {
        issues.push(
          `${item.name} has only ${data.stock} left.`
        );
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}