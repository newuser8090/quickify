import { supabase } from "@/lib/supabase";

export type CouponDiscountType =
  | "fixed"
  | "percentage";

export type Coupon = {
  id: number;
  code: string;
  discount_type: CouponDiscountType;
  discount: number;
  discount_percentage: number | null;
  min_order_value: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
};

export type CouponFormValues = {
  code: string;
  discount_type: CouponDiscountType;
  discount: number;
  discount_percentage: number | null;
  min_order_value: number;
  is_active: boolean;
  expires_at: string | null;
};

function normalizeCoupon(
  coupon: Partial<Coupon> & {
    id: number;
    code: string;
    min_order_value: number;
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
  }
): Coupon {
  return {
    id: coupon.id,
    code: coupon.code,
    discount_type:
      coupon.discount_type === "percentage"
        ? "percentage"
        : "fixed",
    discount: Number(coupon.discount ?? 0),
    discount_percentage:
      coupon.discount_percentage === null ||
      coupon.discount_percentage === undefined
        ? null
        : Number(coupon.discount_percentage),
    min_order_value: Number(
      coupon.min_order_value ?? 0
    ),
    is_active: Boolean(coupon.is_active),
    expires_at: coupon.expires_at,
    created_at: coupon.created_at,
  };
}

function prepareCouponValues(
  values: CouponFormValues
) {
  const isPercentage =
    values.discount_type === "percentage";

  return {
    code: values.code.trim().toUpperCase(),
    discount_type: values.discount_type,
    discount: isPercentage
      ? 0
      : Number(values.discount ?? 0),
    discount_percentage: isPercentage
      ? Number(values.discount_percentage ?? 0)
      : null,
    min_order_value: Number(
      values.min_order_value ?? 0
    ),
    is_active: values.is_active,
    expires_at: values.expires_at || null,
  };
}

export async function getCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return (data ?? []).map((coupon) =>
    normalizeCoupon(coupon)
  );
}

export async function createCoupon(
  values: CouponFormValues
) {
  const payload = prepareCouponValues(values);

  const { error } = await supabase
    .from("coupons")
    .insert(payload);

  if (error) throw error;
}

export async function updateCoupon(
  id: number,
  values: CouponFormValues
) {
  const payload = prepareCouponValues(values);

  const { error } = await supabase
    .from("coupons")
    .update(payload)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteCoupon(id: number) {
  const { error } = await supabase
    .from("coupons")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export function calculateCouponDiscount(
  coupon: Coupon,
  orderAmount: number
) {
  const safeOrderAmount = Math.max(
    0,
    Number(orderAmount ?? 0)
  );

  if (
    coupon.discount_type === "percentage"
  ) {
    const percentage = Math.min(
      100,
      Math.max(
        0,
        Number(
          coupon.discount_percentage ?? 0
        )
      )
    );

    return Math.min(
      safeOrderAmount,
      Math.round(
        (safeOrderAmount * percentage) /
          100
      )
    );
  }

  return Math.min(
    safeOrderAmount,
    Math.max(
      0,
      Number(coupon.discount ?? 0)
    )
  );
}
