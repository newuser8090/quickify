"use client";

import {
  use,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BadgeCheck,
  Bell,
  Clock3,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
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
    queryKey: [
      "product",
      productId,
    ],
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
  }, [
    product,
    addRecent,
  ]);

  if (isLoading) {
    return (
      <ProductDetailsSkeleton />
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <p className="text-5xl">
            📦
          </p>

          <h1 className="mt-4 text-2xl font-extrabold text-gray-900">
            Product not found
          </h1>
        </div>
      </main>
    );
  }

  const resolvedProduct =
    product;

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

  const cartKey = `${
    product.id
  }-${
    selectedVariant?.id ??
    "base"
  }`;

  const cartItem = items.find(
    (item) =>
      item.cartKey === cartKey
  );

  const inStock =
    currentStock > 0;

  async function handleShareProduct() {
    const productUrl =
      window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title:
            resolvedProduct.name,
          text: `Check out ${resolvedProduct.name} on Quickify`,
          url: productUrl,
        });

        return;
      }

      await navigator.clipboard.writeText(
        productUrl
      );

      toast.success(
        "Product link copied"
      );
    } catch (error) {
      if (
        error instanceof
          DOMException &&
        error.name ===
          "AbortError"
      ) {
        return;
      }

      toast.error(
        "Product could not be shared"
      );
    }
  }

  function handleWishlistToggle() {
    toggleWishlist(
      resolvedProduct
    );

    toast.success(
      isWishlisted
        ? `${resolvedProduct.name} removed from wishlist`
        : `${resolvedProduct.name} added to wishlist`
    );
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
    const success = addItem(
      {
        ...resolvedProduct,
        price: currentPrice,
        mrp: currentMrp,
        stock: currentStock,
        unit: currentUnit,
      },
      selectedVariant
        ? {
            id:
              selectedVariant.id,
            name:
              selectedVariant.name,
            unit:
              selectedVariant.unit,
            price:
              selectedVariant.price,
            mrp:
              selectedVariant.mrp,
            stock:
              selectedVariant.stock,
          }
        : null
    );

    if (success === false) {
      toast.error(
        "Maximum available stock reached"
      );
      return;
    }

    toast.success(
      `${resolvedProduct.name}${
        selectedVariant
          ? ` (${selectedVariant.unit})`
          : ""
      } added to cart`
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-50 pb-32 sm:pb-0">
      <div className="mx-auto max-w-7xl sm:px-6 sm:py-6">
        <div className="overflow-hidden bg-white sm:grid sm:rounded-[32px] sm:border sm:border-gray-100 sm:shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
          <ProductGallery
            product={product}
            currentStock={
              currentStock
            }
            isWishlisted={
              isWishlisted
            }
            onToggleWishlist={
              handleWishlistToggle
            }
            onShare={
              handleShareProduct
            }
          />

          <section className="relative z-20 -mt-7 rounded-t-[30px] bg-white px-4 pb-5 pt-7 sm:mt-0 sm:rounded-none sm:px-7 sm:py-8 lg:px-9">
            <div className="pointer-events-none absolute inset-x-0 -top-16 h-20 bg-gradient-to-b from-transparent via-white/80 to-white sm:hidden" />

            <div className="relative">
              <h1 className="text-[26px] font-extrabold leading-[1.15] text-gray-950 sm:text-4xl lg:text-[42px]">
                {product.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1.5 text-sm font-extrabold text-yellow-800">
                  <span className="text-yellow-500">
                    ★
                  </span>

                  {product.rating}
                </div>

                <span className="text-sm font-medium text-gray-500">
                  {
                    product.reviews
                  }{" "}
                  customer reviews
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="text-[34px] font-extrabold leading-none text-gray-950 sm:text-5xl">
                  ₹{currentPrice}
                </span>

                {currentMrp >
                  currentPrice && (
                  <span className="pb-0.5 text-lg font-medium text-gray-400 line-through sm:text-2xl">
                    ₹{currentMrp}
                  </span>
                )}

                {product.discount >
                  0 && (
                  <span className="pb-1 text-sm font-extrabold text-green-700">
                    You save{" "}
                    {
                      product.discount
                    }
                    %
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm font-medium text-gray-500">
                {currentUnit}
              </p>

              {product.variants &&
                product.variants
                  .length > 0 && (
                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="font-extrabold text-gray-900">
                        Choose a size
                      </h2>

                      <span className="text-xs font-semibold text-gray-400">
                        {
                          product
                            .variants
                            .length
                        }{" "}
                        options
                      </span>
                    </div>

                    <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
                      {product.variants.map(
                        (
                          variant
                        ) => {
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
                              className={`min-w-[112px] shrink-0 rounded-2xl border px-4 py-3 text-left transition ${
                                active
                                  ? "border-green-600 bg-green-50 shadow-sm ring-1 ring-green-100"
                                  : "border-gray-200 bg-white hover:border-green-300"
                              }`}
                            >
                              <p
                                className={`text-sm font-extrabold ${
                                  active
                                    ? "text-green-800"
                                    : "text-gray-900"
                                }`}
                              >
                                {
                                  variant.unit
                                }
                              </p>

                              <p className="mt-1 text-xs font-semibold text-gray-500">
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

              {product.description && (
                <p className="mt-6 text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
                  {
                    product.description
                  }
                </p>
              )}

              <div className="mt-6 grid grid-cols-2 gap-2.5">
                <BenefitCard
                  icon={<Truck />}
                  title="Fast Delivery"
                  text={
                    product.deliveryTime
                  }
                />

                <BenefitCard
                  icon={
                    <ShieldCheck />
                  }
                  title="Quality Checked"
                  text="Fresh and safe"
                />

                <BenefitCard
                  icon={
                    <BadgeCheck />
                  }
                  title="Assured Quality"
                  text="Verified product"
                />

                <BenefitCard
                  icon={<Undo2 />}
                  title="Easy Return"
                  text="If damaged"
                />
              </div>

              {inStock && (
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 p-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-orange-600 shadow-sm">
                    <Clock3
                      size={19}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-orange-600">
                      Express delivery
                    </p>

                    <p className="mt-0.5 text-sm font-extrabold text-orange-900">
                      Get it in{" "}
                      {
                        product.deliveryTime
                      }
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 hidden sm:block">
                {cartItem ? (
                  <QuantityControl
                    quantity={
                      cartItem.quantity
                    }
                    onDecrease={() =>
                      decreaseQuantity(
                        cartKey
                      )
                    }
                    onIncrease={() => {
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
                  />
                ) : inStock ? (
                  <button
                    type="button"
                    onClick={
                      handleAddToCart
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-4 text-base font-extrabold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700"
                  >
                    <ShoppingCart
                      size={20}
                    />
                    Add To Cart
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={
                      handleNotifyMe
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-green-600 bg-white py-4 font-extrabold text-green-700 transition hover:bg-green-50"
                  >
                    <Bell
                      size={20}
                    />
                    Notify Me When Available
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="px-3 sm:px-0">
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
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 px-3 pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur sm:hidden"
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
                  cartKey
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 font-extrabold text-white"
          >
            <ShoppingCart
              size={19}
            />
            Add To Cart
          </button>
        ) : (
          <button
            type="button"
            onClick={
              handleNotifyMe
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-600 py-3.5 font-extrabold text-green-700"
          >
            <Bell size={19} />
            Notify Me
          </button>
        )}
      </div>

      <ProductQuickView />
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
          : "px-6 py-4"
      }`}
    >
      <button
        type="button"
        onClick={onDecrease}
        className={`rounded-xl bg-green-600 text-white transition hover:bg-green-700 ${
          compact
            ? "p-2"
            : "p-3"
        }`}
        aria-label="Decrease quantity"
      >
        <Minus
          size={
            compact ? 19 : 22
          }
        />
      </button>

      <div className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          Quantity
        </p>

        <span
          className={`font-extrabold text-green-700 ${
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
        className={`rounded-xl bg-green-600 text-white transition hover:bg-green-700 ${
          compact
            ? "p-2"
            : "p-3"
        }`}
        aria-label="Increase quantity"
      >
        <Plus
          size={
            compact ? 19 : 22
          }
        />
      </button>
    </div>
  );
}

function BenefitCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-white to-green-50 p-3.5 shadow-[0_8px_24px_rgba(22,163,74,0.06)]">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-700 [&>svg]:h-[18px] [&>svg]:w-[18px]">
        {icon}
      </div>

      <p className="mt-3 text-[13px] font-extrabold leading-4 text-gray-900 sm:text-sm">
        {title}
      </p>

      <p className="mt-1 text-[11px] font-medium text-gray-500 sm:text-xs">
        {text}
      </p>
    </div>
  );
}
