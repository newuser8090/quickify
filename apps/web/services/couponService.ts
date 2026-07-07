import { supabase } from "@/lib/supabase";

export type Coupon = {
  id: number;
  code: string;
  discount: number;
  min_order_value: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
};

export type CouponFormValues = {
  code: string;
  discount: number;
  min_order_value: number;
  is_active: boolean;
  expires_at: string | null;
};

export async function getCoupons() {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data as Coupon[];
}

export async function createCoupon(values: CouponFormValues) {
  const { error } = await supabase.from("coupons").insert(values);

  if (error) throw error;
}

export async function updateCoupon(id: number, values: CouponFormValues) {
  const { error } = await supabase
    .from("coupons")
    .update(values)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteCoupon(id: number) {
  const { error } = await supabase.from("coupons").delete().eq("id", id);

  if (error) throw error;
}