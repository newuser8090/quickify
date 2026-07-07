import { create } from "zustand";

import { validateCoupon } from "@/services/customerCouponService";

type CouponStore = {
  code: string;
  discount: number;
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

export const useCouponStore = create<CouponStore>((set) => ({
  code: "",
  discount: 0,
  loading: false,

  applyCoupon: async (couponCode, subtotal) => {
    set({ loading: true });

    try {
      const result = await validateCoupon(
        couponCode,
        subtotal
      );

      if (!result.valid || !result.coupon) {
        set({ loading: false });

        return {
          success: false,
          message: result.message ?? "Invalid coupon",
        };
      }

      set({
        code: result.coupon.code,
        discount: Number(result.coupon.discount),
        loading: false,
      });

      return {
        success: true,
        message: "Coupon applied successfully",
      };
    } catch {
      set({ loading: false });

      return {
        success: false,
        message: "Something went wrong",
      };
    }
  },

  clearCoupon: () =>
    set({
      code: "",
      discount: 0,
    }),
}));