"use client";

import Image from "next/image";
import {
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "motion/react";

import useCart from "@/hooks/useCart";
import { useUIStore } from "@/store/uiStore";

const COLLAPSED_WIDTH = 52;

const CAPSULE_WIDTHS: Record<
  number,
  number
> = {
  1: 168,
  2: 196,
  3: 220,
};

const IMAGE_OFFSETS: Record<
  number,
  number
> = {
  1: -54,
  2: -54,
  3: -54,
};

export default function StickyCartBar() {
  const {
    items,
    totalItems,
  } = useCart();

  const openCart = useUIStore(
    (state) => state.openCart
  );

  const visibleProducts =
    items.slice(-3);

  const visibleCount = Math.max(
    1,
    visibleProducts.length
  );

  const expandedWidth =
    CAPSULE_WIDTHS[
      visibleCount
    ] ?? CAPSULE_WIDTHS[3];

  const expandedImageOffset =
    IMAGE_OFFSETS[
      visibleCount
    ] ?? IMAGE_OFFSETS[3];

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          key="mobile-sticky-cart"
          initial="hidden"
          animate="visible"
          exit="exit"
          custom={{
            expandedWidth,
            expandedImageOffset,
          }}
          className="fixed left-1/2 z-[60] h-16 w-[250px] -translate-x-1/2 md:hidden"
          style={{
            bottom:
              "max(32px, env(safe-area-inset-bottom))",
          }}
        >
          <motion.button
            type="button"
            onClick={openCart}
            aria-label="View cart"
            custom={{
              expandedWidth,
            }}
            variants={{
              hidden: {
                width:
                  COLLAPSED_WIDTH,
                opacity: 0,
              },

              visible: ({
                expandedWidth,
              }: {
                expandedWidth: number;
              }) => ({
                width:
                  expandedWidth,
                opacity: 1,

                transition: {
                  width: {
  delay: 0,
  duration: 0.3,
  ease: [
    0.22,
    1,
    0.36,
    1,
  ],
},

                  opacity: {
                    delay: 0.2,
                    duration: 0.12,
                  },
                },
              }),

              exit: {
                width:
                  COLLAPSED_WIDTH,
                opacity: 0,

                transition: {
                  width: {
                    duration: 0.3,
                    ease: [
                      0.4,
                      0,
                      1,
                      1,
                    ],
                  },

                  /*
                   * The capsule disappears only
                   * after it has fully contracted.
                   */
                  opacity: {
                    delay: 0.3,
                    duration: 0.01,
                  },
                },
              },
            }}
            className="absolute left-1/2 top-1/2 flex h-[60px] -translate-x-1/2 -translate-y-1/2 items-center overflow-hidden rounded-full border border-green-500 bg-green-600 text-white shadow-[0_16px_38px_rgba(22,163,74,0.42)]"
          >
            <motion.div
              variants={{
                hidden: {
                  opacity: 0,
                  x: 8,
                },

                visible: {
                  opacity: 1,
                  x: 0,

                  transition: {
                    delay: 0.14,
                    duration: 0.18,
                  },
                },

                exit: {
                  opacity: 0,
                  x: 8,

                  transition: {
                    duration: 0.1,
                  },
                },
              }}
              className="absolute right-2.5 flex items-center gap-1"
            >
              <div className="text-left leading-tight">
                <p className="whitespace-nowrap text-[10px] font-semibold text-green-50">
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "item"
                    : "items"}
                </p>

                <p className="whitespace-nowrap text-[13px] font-extrabold">
                  View Cart
                </p>
              </div>

              <ChevronRight
                size={21}
                className="shrink-0 text-white"
              />
            </motion.div>
          </motion.button>

          <motion.div
            custom={{
              expandedImageOffset,
            }}
            variants={{
              hidden: {
                x: 0,
                y: 82,
                opacity: 0,
                scale: 0.75,
              },

              visible: ({
                expandedImageOffset,
              }: {
                expandedImageOffset: number;
              }) => ({
                x:
                  expandedImageOffset,
                y: 0,
                opacity: 1,
                scale: 1,

                transition: {
                  x: {
                    delay: 0.23,
                    duration: 0.28,
                    ease: [
                      0.22,
                      1,
                      0.36,
                      1,
                    ],
                  },

                  y: {
                    type: "spring",
                    stiffness: 390,
                    damping: 25,
                  },

                  opacity: {
                    duration: 0.15,
                  },

                  scale: {
                    type: "spring",
                    stiffness: 390,
                    damping: 25,
                  },
                },
              }),

              exit: ({
                expandedImageOffset,
              }: {
                expandedImageOffset: number;
              }) => ({
                /*
                 * Stage 1:
                 * While the capsule contracts,
                 * the images return to the exact centre.
                 *
                 * Stage 2:
                 * The images stay completely still until
                 * the capsule has disappeared.
                 *
                 * Stage 3:
                 * Only then do the images slide down.
                 */
                x: 0,

                y: 82,

                opacity: 0,

                scale: 0.75,

                transition: {
                  x: {
                    duration: 0.3,
                    ease: [
                      0.4,
                      0,
                      1,
                      1,
                    ],
                  },

                  y: {
                    delay: 0.34,
                    duration: 0.24,
                    ease: [
                      0.4,
                      0,
                      1,
                      1,
                    ],
                  },

                  opacity: {
                    delay: 0.34,
                    duration: 0.2,
                  },

                  scale: {
                    delay: 0.34,
                    duration: 0.24,
                  },
                },
              }),
            }}
            className="absolute left-1/2 top-1/2 z-20 flex h-11 -translate-x-1/2 -translate-y-1/2 items-center"
          >
            <AnimatePresence
              initial={false}
              mode="popLayout"
            >
              {visibleProducts.map(
                (item, index) => {
                  const newestIndex =
                    visibleProducts.length -
                    1;

                  const distanceFromNewest =
                    newestIndex - index;

                  return (
                    <motion.div
                      layout
                      key={item.cartKey}
                      initial={{
                        y: -48,
                        opacity: 0,
                        scale: 0.68,
                      }}
                      animate={{
                        y: 0,
                        opacity: 1,
                        scale: 1,
                      }}
                      exit={{
                        y: -48,
                        opacity: 0,
                        scale: 0.68,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 430,
                        damping: 27,
                      }}
                      className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-[3px] border-white bg-white shadow-md"
                      style={{
                        marginLeft:
  index === 0
    ? 0
    : -18,

                        zIndex:
                          20 +
                          index,
                      }}
                    >
                      {item.image ? (
                        <Image
                          src={
                            item.image
                          }
                          alt={
                            item.name
                          }
                          fill
                          sizes="44px"
                          className="object-contain p-0.5"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-green-50 text-green-700">
                          <ShoppingCart
                            size={17}
                          />
                        </div>
                      )}

                      {distanceFromNewest >
                        0 && (
                        <div
                          className="pointer-events-none absolute inset-0 bg-black/10"
                          style={{
                            opacity:
                              distanceFromNewest *
                              0.12,
                          }}
                        />
                      )}
                    </motion.div>
                  );
                }
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
