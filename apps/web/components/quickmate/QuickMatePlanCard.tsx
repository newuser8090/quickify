"use client";

import Image from "next/image";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import {
  motion,
} from "motion/react";
import {
  toast,
} from "sonner";

import type {
  QuickMatePlan,
} from "@/types/quickMate";
import {
  useCartStore,
} from "@/store/cartStore";
import {
  useQuickMateStore,
} from "@/store/quickMateStore";
import {
  useUIStore,
} from "@/store/uiStore";

type Props = {
  plan: QuickMatePlan;
  onClose: () => void;
};

export default function QuickMatePlanCard({
  plan,
  onClose,
}: Props) {
  const cartItems =
    useCartStore(
      (state) =>
        state.items
    );

  const addItem =
    useCartStore(
      (state) =>
        state.addItem
    );

  const openCart =
    useUIStore(
      (state) =>
        state.openCart
    );

  const setCurrentPlan =
    useQuickMateStore(
      (state) =>
        state.setCurrentPlan
    );

  const togglePlanItem =
    useQuickMateStore(
      (state) =>
        state.togglePlanItem
    );

  const setPlanItemQuantity =
    useQuickMateStore(
      (state) =>
        state.setPlanItemQuantity
    );

  const addMessage =
    useQuickMateStore(
      (state) =>
        state.addMessage
    );

  const selectedItems =
    plan.items.filter(
      (item) =>
        item.selected &&
        item.product.stock >
          0
    );

  const estimatedTotal =
    selectedItems.reduce(
      (total, item) =>
        total +
        item.product.price *
          item.cartQuantity,
      0
    );

  function updateQuantity(
    productId: number,
    change: number
  ) {
    const item =
      plan.items.find(
        (planItem) =>
          planItem.product.id ===
          productId
      );

    if (!item) {
      return;
    }

    setPlanItemQuantity(
      productId,
      item.cartQuantity +
        change
    );
  }

  function getExistingQuantity(
    productId: number
  ) {
    return (
      cartItems.find(
        (item) =>
          item.cartKey ===
          `${productId}-base`
      )?.quantity ?? 0
    );
  }

  function handleAddSelected() {
    if (
      selectedItems.length ===
      0
    ) {
      toast.error(
        "Select at least one item"
      );

      return;
    }

    const addedProducts:
      string[] = [];

    const limitedProducts:
      string[] = [];

    let unitsAdded = 0;

    for (
      const item of
      selectedItems
    ) {
      const existingQuantity =
        getExistingQuantity(
          item.product.id
        );

      const remainingStock =
        Math.max(
          0,
          item.product.stock -
            existingQuantity
        );

      const unitsToAdd =
        Math.min(
          item.cartQuantity,
          remainingStock
        );

      if (
        unitsToAdd <= 0
      ) {
        limitedProducts.push(
          item.product.name
        );

        continue;
      }

      let successfullyAdded =
        0;

      for (
        let index = 0;
        index <
        unitsToAdd;
        index += 1
      ) {
        const success =
          addItem(
            item.product,
            null
          );

        if (!success) {
          break;
        }

        successfullyAdded +=
          1;

        unitsAdded += 1;
      }

      if (
        successfullyAdded >
        0
      ) {
        addedProducts.push(
          item.product.name
        );
      }

      if (
        successfullyAdded <
        item.cartQuantity
      ) {
        limitedProducts.push(
          item.product.name
        );
      }
    }

    if (
      unitsAdded === 0
    ) {
      toast.error(
        "These products have already reached their available stock"
      );

      return;
    }

    const uniqueLimitedProducts =
      Array.from(
        new Set(
          limitedProducts
        )
      );

    const confirmationText =
      uniqueLimitedProducts.length >
      0
        ? `Added ${unitsAdded} units from ${addedProducts.length} products. Some quantities were limited by stock.`
        : `Added ${unitsAdded} units from ${addedProducts.length} products to your cart.`;

    addMessage({
      id:
        crypto.randomUUID(),

      role:
        "assistant",

      text:
        confirmationText,

      createdAt:
        new Date().toISOString(),

      suggestions: [
        "Suggest a drink",
        "Add dessert options",
        "Plan another meal",
      ],
    });

    toast.success(
      uniqueLimitedProducts.length >
      0
        ? `${unitsAdded} units added with stock limits`
        : `${unitsAdded} units added`
    );

    setCurrentPlan(
      null
    );

    onClose();

    window.setTimeout(
      () => {
        openCart();
      },
      220
    );
  }

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 p-4 text-white">
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/15 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Sparkles
                size={17}
              />
            </span>

            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-green-100">
                QuickMate plan
              </p>

              <h3 className="mt-0.5 line-clamp-2 text-base font-black">
                {plan.title}
              </h3>
            </div>
          </div>

          {plan.summary && (
            <p className="mt-3 text-xs leading-5 text-white/80">
              {plan.summary}
            </p>
          )}

          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-green-100">
                Estimated total
              </p>

              <p className="mt-0.5 text-2xl font-black">
                ₹
                {estimatedTotal.toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>

            <div className="rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-black backdrop-blur">
              {selectedItems.length}{" "}
              selected
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 p-3">
        {plan.items.map(
          (item) => {
            const unavailable =
              item.product.stock <=
              0;

            const existingQuantity =
              getExistingQuantity(
                item.product.id
              );

            const remainingStock =
              Math.max(
                0,
                item.product.stock -
                  existingQuantity
              );

            const cannotAddMore =
              remainingStock <=
              0;

            return (
              <article
                key={`${item.ingredient}-${item.product.id}`}
                className={`relative rounded-2xl border p-2.5 transition ${
                  item.selected &&
                  !unavailable &&
                  !cannotAddMore
                    ? "border-green-200 bg-green-50/60"
                    : "border-gray-100 bg-white"
                } ${
                  unavailable ||
                  cannotAddMore
                    ? "opacity-60"
                    : ""
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <button
                    type="button"
                    disabled={
                      unavailable ||
                      cannotAddMore
                    }
                    onClick={() =>
                      togglePlanItem(
                        item.product.id
                      )
                    }
                    aria-label={
                      item.selected
                        ? `Remove ${item.product.name}`
                        : `Select ${item.product.name}`
                    }
                    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                      item.selected &&
                      !unavailable &&
                      !cannotAddMore
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-gray-300 bg-white text-transparent"
                    }`}
                  >
                    <Check
                      size={13}
                    />
                  </button>

                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-white">
                    {item.product.image ? (
                      <Image
                        src={
                          item.product.image
                        }
                        alt={
                          item.product.name
                        }
                        fill
                        sizes="56px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        📦
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-xs font-black text-gray-900">
                      {item.product.name}
                    </p>

                    <p className="mt-0.5 text-[10px] text-gray-500">
                      {item.product.unit}
                      {" • ₹"}
                      {item.product.price}
                    </p>

                    <p className="mt-1 line-clamp-2 text-[10px] text-gray-400">
                      For{" "}
                      {item.ingredient}

                      {item.reason
                        ? ` — ${item.reason}`
                        : ""}
                    </p>

                    {existingQuantity >
                      0 && (
                      <p className="mt-1 text-[9px] font-bold text-blue-600">
                        {existingQuantity} already
                        in cart
                      </p>
                    )}

                    {!unavailable &&
                      !cannotAddMore && (
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center rounded-lg border border-green-200 bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  -1
                                )
                              }
                              disabled={
                                item.cartQuantity <=
                                1
                              }
                              className="flex h-7 w-7 items-center justify-center text-green-700 disabled:text-gray-300"
                            >
                              <Minus
                                size={12}
                              />
                            </button>

                            <span className="min-w-6 text-center text-[11px] font-black text-green-700">
                              {item.cartQuantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  1
                                )
                              }
                              disabled={
                                item.cartQuantity >=
                                remainingStock
                              }
                              className="flex h-7 w-7 items-center justify-center text-green-700 disabled:text-gray-300"
                            >
                              <Plus
                                size={12}
                              />
                            </button>
                          </div>

                          <p className="text-xs font-black text-gray-900">
                            ₹
                            {(
                              item.product.price *
                              item.cartQuantity
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>
                      )}

                    {unavailable && (
                      <p className="mt-2 text-[10px] font-bold text-red-600">
                        Currently out of stock
                      </p>
                    )}

                    {!unavailable &&
                      cannotAddMore && (
                        <p className="mt-2 text-[10px] font-bold text-orange-600">
                          Available stock is already
                          in your cart
                        </p>
                      )}
                  </div>
                </div>
              </article>
            );
          }
        )}

        {plan.missingItems.length >
          0 && (
          <div className="rounded-2xl border border-orange-100 bg-orange-50 p-3">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertCircle
                size={15}
              />

              <p className="text-xs font-black">
                Not found in Quickify
              </p>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {plan.missingItems.map(
                (item) => (
                  <span
                    key={
                      item.ingredient
                    }
                    className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-orange-700"
                  >
                    {item.ingredient}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {plan.followUpQuestion && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-blue-700">
              QuickMate asks
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-900">
              {plan.followUpQuestion}
            </p>
          </div>
        )}

        <motion.button
          type="button"
          whileTap={{
            scale: 0.98,
          }}
          onClick={
            handleAddSelected
          }
          disabled={
            selectedItems.length ===
            0
          }
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-3 text-xs font-black text-white shadow-[0_12px_26px_rgba(22,163,74,0.25)] transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
        >
          <ShoppingCart
            size={16}
          />

          Add selected to cart
        </motion.button>

        <div className="flex items-center justify-center gap-1.5 py-1 text-[9px] font-semibold text-gray-400">
          <CheckCircle2
            size={12}
            className="text-green-600"
          />

          Nothing is added without your
          confirmation
        </div>
      </div>
    </motion.section>
  );
}