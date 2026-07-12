"use client";

import {
  use,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  Clock3,
  Heart,
  Minus,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Undo2,
} from "lucide-react";

import ProductQuickView from "@/components/product/ProductQuickView";
import FrequentlyBoughtTogether from "@/components/product/FrequentlyBoughtTogether";
import RelatedProducts from "@/components/product/RelatedProducts";
import RecentlyViewed from "@/components/product/RecentlyViewed";
import ProductReviews from "@/components/product/ProductReviews";
import ProductDetailsSkeleton from "@/components/skeleton/ProductDetailsSkeleton";
import ProductGallery from "@/components/product/ProductGallery";
import CartDrawer from "@/components/cart/CartDrawer";
import CartButton from "@/components/layout/CartButton";

import { getProduct } from "@/services/productService";
import { subscribeStockNotification } from "@/services/stockNotificationService";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useRecentStore } from "@/store/recentStore";
import { useWishlistStore } from "@/store/wishlistStore";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function ProductPage({
  params,
}: Props) {
  const { id } = use(params);
  const productId = Number(id);

  const {
    data: product,
    isLoading,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () =>
      getProduct(productId),
  });

  const items = useCartStore(
    (state) => state.items
  );
  const addItem = useCartStore(
    (state) => state.addItem
  );
  const increaseQuantity =
    useCartStore(
      (state) =>
        state.increaseQuantity
    );
  const decreaseQuantity =
    useCartStore(
      (state) =>
        state.decreaseQuantity
    );

  const user = useAuthStore(
    (state) => state.user
  );

  const toggleWishlist =
    useWishlistStore(
      (state) => state.toggle
    );

  const isWishlisted =
    useWishlistStore((state) =>
      product
        ? state.isWishlisted(
            product.id
          )
        : false
    );

  const addRecent =
    useRecentStore(
      (state) => state.addRecent
    );

  const defaultVariant =
    useMemo(() => {
      if (
        !product?.variants?.length
      ) {
        return null;
      }

      return (
        product.variants.find(
          (variant) =>
            variant.is_default
        ) ??
        product.variants[0]
      );
    }, [product]);

  const [
    selectedVariant,
    setSelectedVariant,
  ] = useState(defaultVariant);

  useEffect(() => {
    setSelectedVariant(
      defaultVariant
    );
  }, [defaultVariant]);

  useEffect(() => {
    if (product) {
      addRecent(product);
    }
  }, [product, addRecent]);

  if (isLoading) {
    return (
      <ProductDetailsSkeleton />
    );
  }

  if (!product) {
    return (
      <main className="p-6 text-2xl font-bold sm:p-10 sm:text-3xl">
        Product not found
      </main>
    );
  }
  const resolvedProduct = product;

  const currentPrice =
    selectedVariant?.price ??
    product.price;

  const currentMrp =
    selectedVariant?.mrp ??
    product.mrp;

  const currentStock =
    selectedVariant?.stock ??
    product.stock;

  const currentUnit =
    selectedVariant?.unit ??
    product.unit;

  const cartKey = `${product.id}-${
    selectedVariant?.id ?? "base"
  }`;

  const cartItem = items.find(
    (item) =>
      item.cartKey === cartKey
  );

  const inStock =
    currentStock > 0;

  async function handleShareProduct() {
  const productUrl = window.location.href;

  try {
    if (navigator.share) {
      await navigator.share({
        title: resolvedProduct.name,
        text: `Check out ${resolvedProduct.name} on Quickify`,
        url: productUrl,
      });

      return;
    }

    await navigator.clipboard.writeText(productUrl);

    toast.success(
      "Product link copied to clipboard"
    );
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      return;
    }

    toast.error(
      "Product could not be shared"
    );
  }
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
      resolvedProduct.id
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
  addItem(
    {
      ...resolvedProduct,
      price: currentPrice,
      mrp: currentMrp,
      stock: currentStock,
      unit: currentUnit,
    },
    selectedVariant
      ? {
          id: selectedVariant.id,
          name: selectedVariant.name,
          unit: selectedVariant.unit,
          price: selectedVariant.price,
          mrp: selectedVariant.mrp,
          stock: selectedVariant.stock,
        }
      : null
  );

  toast.success(
    `${resolvedProduct.name}${
      selectedVariant
        ? ` (${selectedVariant.unit})`
        : ""
    } added to cart`
  );
}

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-50 pb-24 sm:pb-0">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between sm:mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:underline sm:text-base"
          >
            <ArrowLeft size={18} />
            Back to shopping
          </Link>

          <CartButton />
        </div>

        <div className="grid gap-5 overflow-hidden rounded-2xl bg-white p-3 shadow-sm sm:gap-8 sm:rounded-3xl sm:p-6 lg:grid-cols-2 lg:p-8">
          <ProductGallery
            product={product}
          />

          <div className="min-w-0 px-1 pb-2 sm:px-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 sm:px-4 sm:py-2 sm:text-base">
                {product.category}
              </span>

              {product.bestseller && (
                <span className="rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-700 sm:px-4 sm:py-2 sm:text-base">
                  Best Seller
                </span>
              )}

              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold sm:px-4 sm:py-2 sm:text-base ${
                  inStock
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {inStock
                  ? `${currentStock} in stock`
                  : "Out of Stock"}
              </span>
            </div>

            <div className="mt-4 flex items-start justify-between gap-3 sm:mt-6 sm:gap-5">
              <h1 className="min-w-0 flex-1 text-2xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
                {product.name}
              </h1>

              <div className="flex shrink-0 gap-2 sm:flex-col sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    toggleWishlist(
                      product
                    );

                    toast.success(
                      isWishlisted
                        ? `${product.name} removed from wishlist`
                        : `${product.name} added to wishlist`
                    );
                  }}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all sm:h-12 sm:w-12 ${
                    isWishlisted
                      ? "border-red-200 bg-red-50 text-red-500"
                      : "border-gray-200 bg-white text-gray-500 hover:border-red-300 hover:text-red-500"
                  }`}
                  title="Wishlist"
                  aria-label="Wishlist"
                >
                  <Heart
                    size={20}
                    className={
                      isWishlisted
                        ? "fill-red-500"
                        : ""
                    }
                  />
                </button>

                <button
                  type="button"
                  onClick={
                    handleShareProduct
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-all hover:border-green-300 hover:text-green-600 sm:h-12 sm:w-12"
                  title="Share product"
                  aria-label="Share product"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5 sm:gap-3">
              <div className="flex items-center gap-1.5 rounded-xl bg-yellow-50 px-3 py-2">
                <Star
                  size={17}
                  className="fill-yellow-400 text-yellow-400"
                />

                <span className="font-bold">
                  {product.rating}
                </span>
              </div>

              <span className="text-sm text-gray-500 sm:text-base">
                {product.reviews} customer reviews
              </span>
            </div>

            <div className="mt-5 rounded-2xl bg-gray-50 p-4 sm:mt-7 sm:rounded-3xl sm:p-5">
              <div className="flex flex-wrap items-end gap-2 sm:gap-4">
                <span className="text-3xl font-extrabold sm:text-5xl">
                  ₹{currentPrice}
                </span>

                {currentMrp >
                  currentPrice && (
                  <span className="pb-0.5 text-lg text-gray-400 line-through sm:pb-1 sm:text-2xl">
                    ₹{currentMrp}
                  </span>
                )}

                {product.discount > 0 && (
                  <span className="pb-1 text-sm font-bold text-green-700 sm:pb-2 sm:text-base">
                    Save{" "}
                    {product.discount}%
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                {currentUnit}
              </p>
            </div>

            {product.variants &&
              product.variants.length >
                0 && (
                <div className="mt-5 sm:mt-6">
                  <h3 className="mb-3 text-base font-bold sm:text-lg">
                    Choose Size
                  </h3>

                  <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:gap-3">
                    {product.variants.map(
                      (variant) => {
                        const active =
                          selectedVariant?.id ===
                          variant.id;

                        return (
                          <button
                            key={
                              variant.id
                            }
                            type="button"
                            onClick={() =>
                              setSelectedVariant(
                                variant
                              )
                            }
                            className={`min-w-[105px] shrink-0 rounded-xl border px-4 py-3 text-left transition sm:min-w-0 sm:rounded-2xl sm:px-5 sm:py-4 ${
                              active
                                ? "border-green-600 bg-green-50"
                                : "hover:border-green-400"
                            }`}
                          >
                            <p className="text-sm font-bold sm:text-base">
                              {
                                variant.unit
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                              ₹
                              {
                                variant.price
                              }
                            </p>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

            <p className="mt-5 text-sm leading-6 text-gray-600 sm:mt-7 sm:text-lg sm:leading-8">
              {product.description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-4">
              <InfoCard
                icon={
                  <Truck className="text-green-600" />
                }
                title="Fast Delivery"
                text={
                  product.deliveryTime
                }
              />

              <InfoCard
                icon={
                  <ShieldCheck className="text-green-600" />
                }
                title="Quality Checked"
                text="Fresh & safe"
              />

              <InfoCard
                icon={
                  <BadgeCheck className="text-green-600" />
                }
                title="Assured Quality"
                text="Verified product"
              />

              <InfoCard
                icon={
                  <Undo2 className="text-green-600" />
                }
                title="Easy Return"
                text="If damaged"
              />
            </div>

            {inStock && (
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-orange-50 p-3 text-sm text-orange-700 sm:mt-8 sm:p-4 sm:text-base">
                <Clock3 className="shrink-0" />

                <span className="font-semibold">
                  Get it in{" "}
                  {
                    product.deliveryTime
                  }
                </span>
              </div>
            )}

            <div className="mt-6 hidden sm:block">
              {cartItem ? (
                <QuantityControl
                  quantity={
                    cartItem.quantity
                  }
                  onDecrease={() => {
                    decreaseQuantity(
                      cartKey
                    );

                    toast(
                      "Cart updated"
                    );
                  }}
                  onIncrease={() => {
                    const success =
                      increaseQuantity(
                        cartItem.cartKey
                      );

                    if (!success) {
                      toast.error(
                        "Maximum available stock reached"
                      );
                    }
                  }}
                />
              ) : inStock ? (
                <button
                  type="button"
                  onClick={
                    handleAddToCart
                  }
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 py-5 text-lg font-bold text-white shadow-sm hover:bg-green-700"
                >
                  <ShoppingCart />
                  Add To Cart
                </button>
              ) : (
                <button
                  type="button"
                  onClick={
                    handleNotifyMe
                  }
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-green-600 bg-white py-5 text-lg font-bold text-green-700 shadow-sm hover:bg-green-50"
                >
                  <Bell />
                  Notify Me When Available
                </button>
              )}
            </div>
          </div>
        </div>

        <FrequentlyBoughtTogether
          product={product}
        />
        <ProductReviews
          product={product}
        />
        <RelatedProducts
          product={product}
        />
        <RecentlyViewed
          currentProductId={
            product.id
          }
        />
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-white px-3 pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] sm:hidden"
        style={{
          paddingBottom:
            "max(12px, env(safe-area-inset-bottom))",
        }}
      >
        {cartItem ? (
          <QuantityControl
            quantity={
              cartItem.quantity
            }
            compact
            onDecrease={() =>
              decreaseQuantity(
                cartKey
              )
            }
            onIncrease={() => {
              const success =
                increaseQuantity(
                  cartItem.cartKey
                );

              if (!success) {
                toast.error(
                  "Maximum available stock reached"
                );
              }
            }}
          />
        ) : inStock ? (
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 font-bold text-white"
          >
            <ShoppingCart size={19} />
            Add To Cart
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNotifyMe}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-600 py-3.5 font-bold text-green-700"
          >
            <Bell size={19} />
            Notify Me
          </button>
        )}
      </div>

      <ProductQuickView />
      <CartDrawer />
    </main>
  );
}

function QuantityControl({
  quantity,
  onDecrease,
  onIncrease,
  compact = false,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex w-full items-center justify-between rounded-2xl border border-green-600 bg-green-50 ${
        compact
          ? "px-4 py-2.5"
          : "px-6 py-5"
      }`}
    >
      <button
        type="button"
        onClick={onDecrease}
        className={`rounded-xl bg-green-600 text-white hover:bg-green-700 ${
          compact
            ? "p-2"
            : "p-3"
        }`}
      >
        <Minus
          size={compact ? 19 : 22}
        />
      </button>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Quantity
        </p>

        <span
          className={`font-bold text-green-700 ${
            compact
              ? "text-xl"
              : "text-2xl"
          }`}
        >
          {quantity}
        </span>
      </div>

      <button
        type="button"
        onClick={onIncrease}
        className={`rounded-xl bg-green-600 text-white hover:bg-green-700 ${
          compact
            ? "p-2"
            : "p-3"
        }`}
      >
        <Plus
          size={compact ? 19 : 22}
        />
      </button>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-green-50 p-3 sm:p-4">
      <div className="[&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-6 sm:[&>svg]:w-6">
        {icon}
      </div>

      <p className="mt-2 text-sm font-bold sm:text-base">
        {title}
      </p>

      <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
        {text}
      </p>
    </div>
  );
}
