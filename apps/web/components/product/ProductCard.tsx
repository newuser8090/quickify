"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Bell,
  Eye,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import ProductImage from "./ProductImage";
import type { Product } from "@/types/product";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useQuickViewStore } from "@/store/quickViewStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { subscribeStockNotification } from "@/services/stockNotificationService";

type Props = {
  product: Product;
};

export default function ProductCard({
  product,
}: Props) {
  const router = useRouter();

  const items = useCartStore(
    (state) => state.items
  );

  const addItem = useCartStore(
    (state) => state.addItem
  );

  const increaseQuantity = useCartStore(
    (state) => state.increaseQuantity
  );

  const decreaseQuantity = useCartStore(
    (state) => state.decreaseQuantity
  );

  const toggleWishlist = useWishlistStore(
    (state) => state.toggle
  );

  const liked = useWishlistStore(
    (state) =>
      state.isWishlisted(product.id)
  );

  const openQuickView = useQuickViewStore(
    (state) => state.open
  );

  const user = useAuthStore(
    (state) => state.user
  );

  const cartKey = `${product.id}-base`;

  const cartItem = items.find(
    (item) => item.cartKey === cartKey
  );

  const inStock = product.stock > 0;

  function openProductPage() {
    router.push(
      `/product/${product.id}`
    );
  }

  function handleCardKeyDown(
    event: React.KeyboardEvent<HTMLElement>
  ) {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      openProductPage();
    }
  }

  function handleQuickView(
    event:
      | React.MouseEvent
      | React.KeyboardEvent
  ) {
    event.stopPropagation();
    openQuickView(product);
  }

  async function handleNotifyMe() {
    if (!user) {
      toast.error(
        "Please login to get stock alerts"
      );
      return;
    }

    try {
      await subscribeStockNotification(
        user.id,
        product.id
      );

      toast.success(
        "We'll notify you when this product is back in stock"
      );
    } catch {
      toast.error(
        "Failed to subscribe for stock alert"
      );
    }
  }

  function handleAddToCart() {
    const success = addItem(
      product,
      null
    );

    if (success === false) {
      toast.error(
        "Maximum available stock reached"
      );
      return;
    }

    toast.success(
      `${product.name} added to cart`
    );
  }

  return (
    <motion.article
      layout
      role="link"
      tabIndex={0}
      aria-label={`Open ${product.name}`}
      onClick={openProductPage}
      onKeyDown={
        handleCardKeyDown
      }
      initial={{
        opacity: 0,
        y: 14,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.1,
      }}
      whileHover={{
        y: -4,
        transition: {
          duration: 0.18,
        },
      }}
      transition={{
        duration: 0.26,
      }}
      className="group flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 sm:rounded-3xl"
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={`Quick view ${product.name}`}
        onClick={handleQuickView}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            handleQuickView(
              event
            );
          }
        }}
        className="relative flex h-28 cursor-pointer items-center justify-center overflow-hidden bg-white min-[390px]:h-32 sm:h-44 lg:h-48"
      >
        {product.discount > 0 && (
          <span className="pointer-events-none absolute left-1.5 top-1.5 z-10 rounded-full bg-red-500 px-1.5 py-0.5 text-[8px] font-extrabold text-white shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
            {product.discount}% OFF
          </span>
        )}

        {product.bestseller && (
          <span className="pointer-events-none absolute bottom-1.5 left-1.5 z-10 rounded-full bg-yellow-400 px-1.5 py-0.5 text-[8px] font-extrabold text-gray-900 shadow-sm sm:bottom-3 sm:left-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
            Bestseller
          </span>
        )}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();

            toggleWishlist(
              product
            );

            toast(
              liked
                ? "Removed from wishlist"
                : "Added to wishlist"
            );
          }}
          className="absolute right-1.5 top-1.5 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-gray-100 bg-white/95 shadow-sm transition hover:bg-red-50 sm:right-3 sm:top-3 sm:h-9 sm:w-9"
          aria-label={
            liked
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
        >
          <motion.div
            animate={
              liked
                ? {
                    scale: [
                      1,
                      1.28,
                      1,
                    ],
                  }
                : {}
            }
            transition={{
              duration: 0.3,
            }}
          >
            <Heart
              size={14}
              className={`sm:h-[18px] sm:w-[18px] ${
                liked
                  ? "fill-red-500 text-red-500"
                  : "text-gray-500"
              }`}
            />
          </motion.div>
        </button>

        <motion.div
          whileHover={{
            scale: 1.035,
          }}
          transition={{
            duration: 0.2,
          }}
          className="relative h-full w-full p-1.5 sm:p-3.5"
        >
          <ProductImage
            src={product.image}
            alt={product.name}
          />
        </motion.div>

        <button
          type="button"
          onClick={handleQuickView}
          className="absolute bottom-3 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-1.5 rounded-full border border-gray-100 bg-white/95 px-3 py-1.5 text-xs font-semibold opacity-0 shadow-md transition group-hover:opacity-100 sm:flex"
        >
          <Eye size={14} />
          Quick View
        </button>
      </div>

      <div className="flex flex-1 flex-col border-t border-gray-100 p-2.5 sm:p-4">
        <div className="flex items-center justify-between gap-1">
          <div className="flex min-w-0 items-center gap-1 text-[10px] sm:text-xs">
            <Star
              size={11}
              className="shrink-0 fill-yellow-400 text-yellow-400 sm:h-3.5 sm:w-3.5"
            />

            <span className="font-bold">
              {product.rating}
            </span>

            <span className="hidden truncate text-gray-400 min-[420px]:inline">
              ({product.reviews})
            </span>
          </div>

          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-extrabold sm:px-2 sm:py-1 sm:text-[10px] ${
              inStock
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {inStock
              ? "In stock"
              : "Out"}
          </span>
        </div>

        <h3 className="mt-1 line-clamp-2 text-[12px] font-extrabold leading-[17px] text-gray-900 transition group-hover:text-green-700 sm:mt-1.5 sm:text-sm sm:leading-5">
          {product.name}
        </h3>

        <p className="mt-1 truncate text-[9px] text-gray-500 sm:text-xs">
          {product.unit}
        </p>

        <div className="mt-1 flex min-w-0 items-baseline gap-1 sm:mt-1.5">
          <span className="text-sm font-extrabold text-gray-900 sm:text-lg">
            ₹{product.price}
          </span>

          {product.mrp >
            product.price && (
            <span className="truncate text-[9px] text-gray-400 line-through sm:text-xs">
              ₹{product.mrp}
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-1 text-[9px] text-gray-500 sm:text-xs">
          <Truck
            size={11}
            className="shrink-0 text-green-600 sm:h-3.5 sm:w-3.5"
          />

          <span className="truncate">
            {product.deliveryTime}
          </span>
        </div>

        <div className="mt-auto pt-2 sm:pt-3">
          {cartItem ? (
            <div
              onClick={(event) =>
                event.stopPropagation()
              }
              className="flex w-full items-center justify-between rounded-lg border border-green-600 bg-green-50 px-1.5 py-1.5 sm:rounded-xl sm:px-2.5 sm:py-2"
            >
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();

                  decreaseQuantity(
                    cartKey
                  );
                }}
                className="flex h-6 w-6 items-center justify-center rounded-md bg-green-600 text-white transition hover:bg-green-700 sm:h-8 sm:w-8 sm:rounded-lg"
                aria-label={`Decrease ${product.name} quantity`}
              >
                <Minus
                  size={12}
                  className="sm:h-4 sm:w-4"
                />
              </button>

              <span className="text-xs font-extrabold text-green-700 sm:text-sm">
                {cartItem.quantity}
              </span>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();

                  const success =
                    increaseQuantity(
                      cartKey
                    );

                  if (!success) {
                    toast.error(
                      "Maximum available stock reached"
                    );
                  }
                }}
                className="flex h-6 w-6 items-center justify-center rounded-md bg-green-600 text-white transition hover:bg-green-700 sm:h-8 sm:w-8 sm:rounded-lg"
                aria-label={`Increase ${product.name} quantity`}
              >
                <Plus
                  size={12}
                  className="sm:h-4 sm:w-4"
                />
              </button>
            </div>
          ) : inStock ? (
            <motion.button
              type="button"
              whileTap={{
                scale: 0.96,
              }}
              onClick={(event) => {
                event.stopPropagation();
                handleAddToCart();
              }}
              className="flex w-full items-center justify-center gap-1 rounded-lg bg-green-600 py-2 text-[10px] font-extrabold text-white transition hover:bg-green-700 sm:rounded-xl sm:py-2.5 sm:text-sm"
            >
              <ShoppingCart
                size={12}
                className="sm:h-4 sm:w-4"
              />

              Add
            </motion.button>
          ) : (
            <motion.button
              type="button"
              whileTap={{
                scale: 0.96,
              }}
              onClick={(event) => {
                event.stopPropagation();
                handleNotifyMe();
              }}
              className="flex w-full items-center justify-center gap-1 rounded-lg border border-green-600 bg-white py-2 text-[9px] font-extrabold text-green-700 transition hover:bg-green-50 sm:rounded-xl sm:py-2.5 sm:text-xs"
            >
              <Bell
                size={12}
                className="sm:h-4 sm:w-4"
              />

              Notify
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  );
}