"use client";

import { use, useEffect, useMemo, useState } from "react";
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

export default function ProductPage({ params }: Props) {
  const { id } = use(params);
  const productId = Number(id);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
  });

  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);

  const user = useAuthStore((state) => state.user);

  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isWishlisted = useWishlistStore((state) =>
    product ? state.isWishlisted(product.id) : false
  );

  const addRecent = useRecentStore((state) => state.addRecent);

  const defaultVariant = useMemo(() => {
    if (!product?.variants?.length) return null;

    return (
      product.variants.find((variant) => variant.is_default) ??
      product.variants[0]
    );
  }, [product]);

  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);

  useEffect(() => {
    setSelectedVariant(defaultVariant);
  }, [defaultVariant]);

  useEffect(() => {
    if (product) {
      addRecent(product);
    }
  }, [product, addRecent]);

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (!product) {
    return <main className="p-10 text-3xl font-bold">Product not found</main>;
  }

  const currentPrice = selectedVariant?.price ?? product.price;
  const currentMrp = selectedVariant?.mrp ?? product.mrp;
  const currentStock = selectedVariant?.stock ?? product.stock;
  const currentUnit = selectedVariant?.unit ?? product.unit;

  const cartKey = `${product.id}-${selectedVariant?.id ?? "base"}`;
  const cartItem = items.find((item) => item.cartKey === cartKey);
  const inStock = currentStock > 0;

  async function handleShareProduct() {
  if (!product) return;

  const productUrl = window.location.href;

  if (navigator.share) {
    await navigator.share({
      title: product.name,
      text: `Check out ${product.name} on Quickify`,
      url: productUrl,
    });
    return;
  }

  await navigator.clipboard.writeText(productUrl);
  toast.success("Product link copied to clipboard");
}

  async function handleNotifyMe() {
  if (!product) return;

  if (!user) {
    toast.error("Please login to get stock alerts");
    return;
  }

  try {
    await subscribeStockNotification(user.id, product.id);
    toast.success("We'll notify you when this product is back in stock");
  } catch {
    toast.error("Failed to subscribe for stock alert");
  }
}
  function handleAddToCart() {
    if (!product) return;
    addItem(
      {
        ...product,
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
      `${product.name}${
        selectedVariant ? ` (${selectedVariant.unit})` : ""
      } added to cart`
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-semibold text-green-700 hover:underline"
          >
            <ArrowLeft size={18} />
            Back to shopping
          </Link>

          <CartButton />
        </div>

        <div className="grid gap-8 rounded-3xl bg-white p-6 shadow-sm lg:grid-cols-2 lg:p-8">
          <ProductGallery product={product} />

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-green-100 px-4 py-2 font-semibold text-green-700">
                {product.category}
              </span>

              {product.bestseller && (
                <span className="rounded-full bg-yellow-100 px-4 py-2 font-semibold text-yellow-700">
                  Best Seller
                </span>
              )}

              <span
                className={`rounded-full px-4 py-2 font-semibold ${
                  inStock
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {inStock ? `${currentStock} in stock` : "Out of Stock"}
              </span>
            </div>

            <div className="mt-6 flex items-start justify-between gap-5">
              <div className="flex-1">
                <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
                  {product.name}
                </h1>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    toggleWishlist(product);
                    toast.success(
                      isWishlisted
                        ? `${product.name} removed from wishlist`
                        : `${product.name} added to wishlist`
                    );
                  }}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all ${
                    isWishlisted
                      ? "border-red-200 bg-red-50 text-red-500"
                      : "border-gray-200 bg-white text-gray-500 hover:border-red-300 hover:text-red-500"
                  }`}
                  title="Wishlist"
                >
                  <Heart
                    size={22}
                    className={isWishlisted ? "fill-red-500" : ""}
                  />
                </button>

                <button
                  onClick={handleShareProduct}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-all hover:border-green-300 hover:text-green-600"
                  title="Share product"
                >
                  <Share2 size={22} />
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-yellow-50 px-3 py-2">
                <Star size={19} className="fill-yellow-400 text-yellow-400" />
                <span className="font-bold">{product.rating}</span>
              </div>

              <span className="text-gray-500">
                {product.reviews} customer reviews
              </span>
            </div>

            <div className="mt-7 rounded-3xl bg-gray-50 p-5">
              <div className="flex flex-wrap items-end gap-4">
                <span className="text-5xl font-extrabold">
                  ₹{currentPrice}
                </span>

                <span className="pb-1 text-2xl text-gray-400 line-through">
                  ₹{currentMrp}
                </span>

                {product.discount > 0 && (
                  <span className="pb-2 font-bold text-green-700">
                    You save {product.discount}%
                  </span>
                )}
              </div>

              <p className="mt-2 text-gray-500">{currentUnit}</p>
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-lg font-bold">Choose Size</h3>

                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => {
                    const active = selectedVariant?.id === variant.id;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`rounded-2xl border px-5 py-4 text-left transition ${
                          active
                            ? "border-green-600 bg-green-50"
                            : "hover:border-green-400"
                        }`}
                      >
                        <p className="font-bold">{variant.unit}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          ₹{variant.price}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="mt-7 text-lg leading-8 text-gray-600">
              {product.description}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <InfoCard
                icon={<Truck className="text-green-600" />}
                title="Fast Delivery"
                text={product.deliveryTime}
              />

              <InfoCard
                icon={<ShieldCheck className="text-green-600" />}
                title="Quality Checked"
                text="Fresh & safe"
              />

              <InfoCard
                icon={<BadgeCheck className="text-green-600" />}
                title="Assured Quality"
                text="Verified product"
              />

              <InfoCard
                icon={<Undo2 className="text-green-600" />}
                title="Easy Return"
                text="If damaged"
              />
            </div>

            {inStock && (
              <div className="mt-8 flex items-center gap-3 rounded-2xl bg-orange-50 p-4 text-orange-700">
                <Clock3 />
                <span className="font-semibold">
                  Order now and get it in {product.deliveryTime}
                </span>
              </div>
            )}

            {cartItem ? (
              <div className="mt-8 flex w-full items-center justify-between rounded-2xl border border-green-600 bg-green-50 px-6 py-5">
                <button
                  onClick={() => {
                    decreaseQuantity(cartKey);
                    toast("Cart updated");
                  }}
                  className="rounded-xl bg-green-600 p-3 text-white hover:bg-green-700"
                >
                  <Minus size={22} />
                </button>

                <span className="text-2xl font-bold text-green-700">
                  {cartItem.quantity}
                </span>

                <button
                  onClick={() => {
                    const success = increaseQuantity(cartItem.cartKey);

                    if (success) {
                      toast.success(`${product.name} quantity increased`);
                    } else {
                      toast.error("Maximum available stock reached");
                    }
                  }}
                  className="rounded-xl bg-green-600 p-3 text-white hover:bg-green-700"
                >
                  <Plus size={22} />
                </button>
              </div>
            ) : inStock ? (
              <button
                onClick={handleAddToCart}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 py-5 text-lg font-bold text-white shadow-sm hover:bg-green-700"
              >
                <ShoppingCart />
                Add To Cart
              </button>
            ) : (
              <button
                onClick={handleNotifyMe}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-green-600 bg-white py-5 text-lg font-bold text-green-700 shadow-sm hover:bg-green-50"
              >
                <Bell />
                Notify Me When Available
              </button>
            )}
          </div>
        </div>

        <FrequentlyBoughtTogether product={product} />
        <ProductReviews product={product} />
        <RelatedProducts product={product} />
        <RecentlyViewed currentProductId={product.id} />
      </div>

      <ProductQuickView />
      <CartDrawer />
    </main>
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
    <div className="rounded-2xl bg-green-50 p-4">
      {icon}
      <p className="mt-2 font-bold">{title}</p>
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}