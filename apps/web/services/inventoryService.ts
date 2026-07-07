import { supabase } from "@/lib/supabase";
import { notifyLowStock } from "@/services/adminNotifyService";

export type InventoryChangeType =
  | "restock"
  | "deduct"
  | "adjustment"
  | "damage"
  | "return";

export type InventoryLog = {
  id: string;
  product_id: number | null;
  variant_id: number | null;
  product_name: string;
  variant_name: string | null;
  change_type: InventoryChangeType;
  quantity_change: number;
  previous_stock: number;
  new_stock: number;
  note: string | null;
  created_at: string;
};

type AdjustProductStockInput = {
  productId: number;
  productName: string;
  currentStock: number;
  newStock: number;
  lowStockThreshold?: number;
  changeType: InventoryChangeType;
  note?: string;
};

type AdjustVariantStockInput = {
  productId: number;
  variantId: number;
  productName: string;
  variantName: string;
  currentStock: number;
  newStock: number;
  lowStockThreshold?: number;
  changeType: InventoryChangeType;
  note?: string;
};

async function maybeCreateLowStockNotification({
  productId,
  variantId,
  productName,
  variantName,
  newStock,
  lowStockThreshold = 5,
}: {
  productId: number;
  variantId?: number | null;
  productName: string;
  variantName?: string | null;
  newStock: number;
  lowStockThreshold?: number;
}) {
  if (newStock > lowStockThreshold) return;

  await notifyLowStock({
    productId,
    variantId,
    productName,
    variantName,
    stock: newStock,
  });
}

export async function getInventoryLogs() {
  const { data, error } = await supabase
    .from("inventory_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;

  return data as InventoryLog[];
}

export async function adjustProductStock({
  productId,
  productName,
  currentStock,
  newStock,
  lowStockThreshold = 5,
  changeType,
  note,
}: AdjustProductStockInput) {
  const { error: updateError } = await supabase
    .from("products")
    .update({ stock: newStock })
    .eq("id", productId);

  if (updateError) throw updateError;

  const { error: logError } = await supabase.from("inventory_logs").insert({
    product_id: productId,
    variant_id: null,
    product_name: productName,
    variant_name: null,
    change_type: changeType,
    quantity_change: newStock - currentStock,
    previous_stock: currentStock,
    new_stock: newStock,
    note: note ?? null,
  });

  if (logError) throw logError;

  await maybeCreateLowStockNotification({
    productId,
    productName,
    newStock,
    lowStockThreshold,
  });
}

export async function adjustVariantStock({
  productId,
  variantId,
  productName,
  variantName,
  currentStock,
  newStock,
  lowStockThreshold = 5,
  changeType,
  note,
}: AdjustVariantStockInput) {
  const { error: updateError } = await supabase
    .from("product_variants")
    .update({ stock: newStock })
    .eq("id", variantId);

  if (updateError) throw updateError;

  const { error: logError } = await supabase.from("inventory_logs").insert({
    product_id: productId,
    variant_id: variantId,
    product_name: productName,
    variant_name: variantName,
    change_type: changeType,
    quantity_change: newStock - currentStock,
    previous_stock: currentStock,
    new_stock: newStock,
    note: note ?? null,
  });

  if (logError) throw logError;

  await maybeCreateLowStockNotification({
    productId,
    variantId,
    productName,
    variantName,
    newStock,
    lowStockThreshold,
  });
}