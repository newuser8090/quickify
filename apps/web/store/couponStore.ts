import { create } from "zustand";

import { validateCoupon } from "@/services/customerCouponService";

type CouponDiscountType =
  | "fixed"
  | "percentage";

type AppliedCoupon = {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  discountAmount: number;
};

type CouponStore = {
  code: string;
  discount: number;
  discountType: CouponDiscountType | null;
  discountValue: number;
  loading: boolean;

  applyCoupon: (
    code: string,
    subtotal: number
  ) => Promise<{
    success: boolean;
    message: string;
  }>;

  clearCoupon: () => void;
};

function calculateDiscountAmount({
  subtotal,
  discountType,
  discount,
  discountPercentage,
}: {
  subtotal: number;
  discountType: CouponDiscountType;
  discount: number;
  discountPercentage: number | null;
}) {
  const safeSubtotal = Math.max(
    0,
    Number(subtotal ?? 0)
  );

  if (discountType === "percentage") {
    const percentage = Math.min(
      100,
      Math.max(
        0,
        Number(
          discountPercentage ?? 0
        )
      )
    );

    return Math.min(
      safeSubtotal,
      Math.round(
        (safeSubtotal * percentage) / 100
      )
    );
  }

  return Math.min(
    safeSubtotal,
    Math.max(
      0,
      Number(discount ?? 0)
    )
  );
}

export const useCouponStore =
  create<CouponStore>((set) => ({
    code: "",
    discount: 0,
    discountType: null,
    discountValue: 0,
    loading: false,

    applyCoupon: async (
      couponCode,
      subtotal
    ) => {
      set({ loading: true });

      try {
        const result =
          await validateCoupon(
            couponCode,
            subtotal
          );

        if (
          !result.valid ||
          !result.coupon
        ) {
          set({
            loading: false,
          });

          return {
            success: false,
            message:
              result.message ??
              "Invalid coupon",
          };
        }

        const discountType:
          CouponDiscountType =
          result.coupon.discount_type ===
          "percentage"
            ? "percentage"
            : "fixed";

        const discountValue =
          discountType === "percentage"
            ? Number(
                result.coupon
                  .discount_percentage ?? 0
              )
            : Number(
                result.coupon.discount ?? 0
              );

        const discountAmount =
          calculateDiscountAmount({
            subtotal,
            discountType,
            discount: Number(
              result.coupon.discount ?? 0
            ),
            discountPercentage:
              result.coupon
                .discount_percentage ??
              null,
          });

        const appliedCoupon:
          AppliedCoupon = {
          code: result.coupon.code,
          discountType,
          discountValue,
          discountAmount,
        };

        set({
          code: appliedCoupon.code,
          discount:
            appliedCoupon.discountAmount,
          discountType:
            appliedCoupon.discountType,
          discountValue:
            appliedCoupon.discountValue,
          loading: false,
        });

        return {
          success: true,
          message:
            discountType ===
            "percentage"
              ? `${discountValue}% coupon applied`
              : `₹${discountAmount} coupon applied`,
        };
      } catch (error) {
        console.error(
          "Coupon application failed:",
          error
        );

        set({
          loading: false,
        });

        return {
          success: false,
          message:
            "Something went wrong",
        };
      }
    },

    clearCoupon: () =>
      set({
        code: "",
        discount: 0,
        discountType: null,
        discountValue: 0,
        loading: false,
      }),
  }));
