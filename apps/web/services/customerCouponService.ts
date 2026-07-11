import { supabase } from "@/lib/supabase";

type CouponDiscountType =
  | "fixed"
  | "percentage";

type ValidatedCoupon = {
  id: number;
  code: string;
  discount_type: CouponDiscountType;
  discount: number;
  discount_percentage: number | null;
  min_order_value: number;
  is_active: boolean;
  expires_at: string | null;
};

export async function validateCoupon(
  code: string,
  subtotal: number
) {
  const normalizedCode = code
    .trim()
    .toUpperCase();

  const safeSubtotal = Math.max(
    0,
    Number(subtotal ?? 0)
  );

  if (!normalizedCode) {
    return {
      valid: false,
      message: "Please enter a coupon code",
    };
  }

  const { data, error } = await supabase
    .from("coupons")
    .select(
      `
      id,
      code,
      discount_type,
      discount,
      discount_percentage,
      min_order_value,
      is_active,
      expires_at
      `
    )
    .eq("code", normalizedCode)
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
    new Date(data.expires_at).getTime() <
      Date.now()
  ) {
    return {
      valid: false,
      message: "Coupon expired",
    };
  }

  const minimumOrder = Number(
    data.min_order_value ?? 0
  );

  if (safeSubtotal < minimumOrder) {
    return {
      valid: false,
      message: `Minimum order ₹${minimumOrder.toLocaleString(
        "en-IN"
      )}`,
    };
  }

  const discountType:
    CouponDiscountType =
    data.discount_type === "percentage"
      ? "percentage"
      : "fixed";

  const discount = Number(
    data.discount ?? 0
  );

  const discountPercentage =
    data.discount_percentage === null ||
    data.discount_percentage === undefined
      ? null
      : Number(data.discount_percentage);

  if (
    discountType === "fixed" &&
    discount <= 0
  ) {
    return {
      valid: false,
      message:
        "This coupon has an invalid discount amount",
    };
  }

  if (
    discountType === "percentage" &&
    (
      discountPercentage === null ||
      discountPercentage <= 0 ||
      discountPercentage > 100
    )
  ) {
    return {
      valid: false,
      message:
        "This coupon has an invalid discount percentage",
    };
  }

  const coupon: ValidatedCoupon = {
    id: data.id,
    code: data.code,
    discount_type: discountType,
    discount,
    discount_percentage:
      discountPercentage,
    min_order_value: minimumOrder,
    is_active: Boolean(data.is_active),
    expires_at: data.expires_at,
  };

  return {
    valid: true,
    coupon,
  };
}
