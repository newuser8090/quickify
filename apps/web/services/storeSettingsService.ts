import { supabase } from "@/lib/supabase";

export type StoreSettings = {
  id: number;
  store_name: string;
  support_email: string | null;
  support_phone: string | null;
  delivery_fee: number;
  free_delivery_threshold: number;
  platform_fee: number;
  default_delivery_time: string;
  currency: string;
  tax_percentage: number;
  opening_time: string | null;
  closing_time: string | null;
  maintenance_mode: boolean;
  order_notifications: boolean;
  payment_notifications: boolean;
  updated_at: string | null;
};

export type StoreSettingsFormValues = {
  store_name: string;
  support_email: string;
  support_phone: string;
  delivery_fee: number;
  free_delivery_threshold: number;
  platform_fee: number;
  default_delivery_time: string;
  currency: string;
  tax_percentage: number;
  opening_time: string;
  closing_time: string;
  maintenance_mode: boolean;
  order_notifications: boolean;
  payment_notifications: boolean;
};

export async function getStoreSettings(): Promise<StoreSettings> {
  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) throw error;

  return data as StoreSettings;
}

export async function updateStoreSettings(
  values: StoreSettingsFormValues
): Promise<void> {
  const { error } = await supabase
    .from("store_settings")
    .update({
      store_name: values.store_name.trim(),
      support_email: values.support_email.trim() || null,
      support_phone: values.support_phone.trim() || null,
      delivery_fee: values.delivery_fee,
      free_delivery_threshold: values.free_delivery_threshold,
      platform_fee: values.platform_fee,
      default_delivery_time: values.default_delivery_time.trim(),
      currency: values.currency,
      tax_percentage: values.tax_percentage,
      opening_time: values.opening_time || null,
      closing_time: values.closing_time || null,
      maintenance_mode: values.maintenance_mode,
      order_notifications: values.order_notifications,
      payment_notifications: values.payment_notifications,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) throw error;
}