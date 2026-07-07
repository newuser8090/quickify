import { supabase } from "@/lib/supabase";

export async function validateCoupon(
  code: string,
  subtotal: number
) {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    return {
      valid: false,
      message: "Coupon not found",
    };
  }

  if (
    data.expires_at &&
    new Date(data.expires_at) < new Date()
  ) {
    return {
      valid: false,
      message: "Coupon expired",
    };
  }

  if (subtotal < data.min_order_value) {
    return {
      valid: false,
      message: `Minimum order ₹${data.min_order_value}`,
    };
  }

  return {
    valid: true,
    coupon: data,
  };
}