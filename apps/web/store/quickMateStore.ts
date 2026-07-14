import {
  create,
} from "zustand";
import {
  createJSONStorage,
  persist,
} from "zustand/middleware";

import type {
  QuickMateMessage,
  QuickMatePlan,
} from "@/types/quickMate";

type QuickMateStore = {
  open: boolean;
  messages: QuickMateMessage[];
  currentPlan: QuickMatePlan | null;

  openQuickMate: () => void;
  closeQuickMate: () => void;
  toggleQuickMate: () => void;

  addMessage: (
    message: QuickMateMessage
  ) => void;

  setCurrentPlan: (
    plan: QuickMatePlan | null
  ) => void;

  togglePlanItem: (
    productId: number
  ) => void;

  setPlanItemQuantity: (
    productId: number,
    quantity: number
  ) => void;

  clearConversation: () => void;
};

function createWelcomeMessage(): QuickMateMessage {
  return {
    id: "quickmate-welcome",
    role: "assistant",
    text:
      "Hi! I’m QuickMate, your AI shopping companion. Tell me what you want to cook, plan or buy.",
    createdAt:
      new Date().toISOString(),
  };
}

export const useQuickMateStore =
  create<QuickMateStore>()(
    persist(
      (set) => ({
        open: false,

        messages: [
          createWelcomeMessage(),
        ],

        currentPlan: null,

        openQuickMate: () =>
          set({
            open: true,
          }),

        closeQuickMate: () =>
          set({
            open: false,
          }),

        toggleQuickMate: () =>
          set((state) => ({
            open:
              !state.open,
          })),

        addMessage: (
          message
        ) =>
          set((state) => ({
            messages: [
              ...state.messages,
              message,
            ],
          })),

        setCurrentPlan: (
          currentPlan
        ) =>
          set({
            currentPlan,
          }),

        togglePlanItem: (
          productId
        ) =>
          set((state) => {
            if (
              !state.currentPlan
            ) {
              return state;
            }

            const nextItems =
              state.currentPlan.items.map(
                (item) =>
                  item.product.id ===
                  productId
                    ? {
                        ...item,
                        selected:
                          !item.selected,
                      }
                    : item
              );

            return {
              currentPlan: {
                ...state.currentPlan,

                items:
                  nextItems,

                estimatedTotal:
                  calculateSelectedTotal(
                    nextItems
                  ),
              },
            };
          }),

        setPlanItemQuantity: (
          productId,
          quantity
        ) =>
          set((state) => {
            if (
              !state.currentPlan
            ) {
              return state;
            }

            const nextItems =
              state.currentPlan.items.map(
                (item) => {
                  if (
                    item.product.id !==
                    productId
                  ) {
                    return item;
                  }

                  const safeQuantity =
                    Math.min(
                      item.product.stock,
                      Math.max(
                        1,
                        Math.round(
                          quantity
                        )
                      )
                    );

                  return {
                    ...item,
                    cartQuantity:
                      safeQuantity,
                  };
                }
              );

            return {
              currentPlan: {
                ...state.currentPlan,

                items:
                  nextItems,

                estimatedTotal:
                  calculateSelectedTotal(
                    nextItems
                  ),
              },
            };
          }),

        clearConversation:
          () =>
            set({
              messages: [
                createWelcomeMessage(),
              ],
              currentPlan:
                null,
            }),
      }),
      {
        name:
          "quickify-quickmate",

        storage:
          createJSONStorage(
            () =>
              localStorage
          ),

        partialize:
          (state) => ({
            messages:
              state.messages,

            currentPlan:
              state.currentPlan,
          }),
      }
    )
  );

function calculateSelectedTotal(
  items: QuickMatePlan["items"]
) {
  return items.reduce(
    (total, item) =>
      item.selected &&
      item.product.stock > 0
        ? total +
          item.product.price *
            item.cartQuantity
        : total,
    0
  );
}