"use client";

import Link from "next/link";
import ProductImage from "./ProductImage";
import { toast } from "sonner";
import { motion } from "motion/react";
import {
  Eye,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Truck,
  Bell,
} from "lucide-react";

import { Product } from "@/types/product";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useQuickViewStore } from "@/store/quickViewStore";
import { useAuthStore } from "@/store/authStore";
import { subscribeStockNotification } from "@/services/stockNotificationService";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);

  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const liked = useWishlistStore((state) => state.isWishlisted(product.id));

  const openQuickView = useQuickViewStore((state) => state.open);
  const user = useAuthStore((state) => state.user);

  const cartKey = `${product.id}-base`;
  const cartItem = items.find((item) => item.cartKey === cartKey);

  const inStock = product.stock > 0;
  async function handleNotifyMe() {
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{
        y: -8,
        transition: { duration: 0.2 },
      }}
      transition={{ duration: 0.35 }}
      className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
    >
      <div
        onClick={() => openQuickView(product)}
        className="relative flex h-56 cursor-pointer items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100"
      >
        {product.discount > 0 && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
            {product.discount}% OFF
          </span>
        )}

        {product.bestseller && (
          <span className="absolute left-4 top-12 z-10 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black">
            Best Seller
          </span>
        )}

        <motion.div
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.2 }}
          className="relative h-40 w-40"
        >
          <ProductImage src={product.image} alt={product.name} />
        </motion.div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
            toast(liked ? "Removed from wishlist" : "Added to wishlist");
          }}
          className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 shadow transition hover:bg-red-50"
        >
          <motion.div
            animate={liked ? { scale: [1, 1.35, 1] } : {}}
            transition={{ duration: 0.35 }}
          >
            <Heart
              size={20}
              className={
                liked ? "fill-red-500 text-red-500" : "text-gray-500"
              }
            />
          </motion.div>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            openQuickView(product);
          }}
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow transition hover:bg-green-50"
        >
          <Eye size={16} />
          Quick View
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Star size={16} className="fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{product.rating}</span>
            <span className="text-gray-500">({product.reviews})</span>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              inStock
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {inStock ? "In Stock" : "Out"}
          </span>
        </div>

        <Link href={`/product/${product.id}`}>
          <h3 className="mt-3 line-clamp-1 text-xl font-bold hover:text-green-700">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-500">{product.unit}</p>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-2xl font-bold">₹{product.price}</span>
          <span className="text-gray-400 line-through">₹{product.mrp}</span>
        </div>

        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
          <Truck size={15} />
          {product.deliveryTime}
        </div>

        {cartItem ? (
          <div className="mt-5 flex w-full items-center justify-between rounded-xl border border-green-600 bg-green-50 px-4 py-3">
            <button
              onClick={() => {
                decreaseQuantity(cartKey);
                toast("Cart updated");
              }}
              className="rounded-lg bg-green-600 p-2 text-white hover:bg-green-700"
            >
              <Minus size={18} />
            </button>

            <span className="font-bold text-green-700">
              {cartItem.quantity}
            </span>

            <button
             onClick={() => {
  const success = increaseQuantity(cartKey);

  if (success) {
    toast.success(`${product.name} quantity increased`);
  } else {
    toast.error("Maximum available stock reached");
  }
}}
              className="rounded-lg bg-green-600 p-2 text-white hover:bg-green-700"
            >
              <Plus size={18} />
            </button>
          </div>
        ) : (
          inStock ? (
  <motion.button
    whileTap={{ scale: 0.96 }}
    onClick={() => {
      addItem(product, null);
      toast.success(`${product.name} added to cart`);
    }}
    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700"
  >
    <ShoppingCart size={18} />
    Add to Cart
  </motion.button>
) : (
  <motion.button
    whileTap={{ scale: 0.96 }}
    onClick={handleNotifyMe}
    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-green-600 bg-white py-3 font-semibold text-green-700 transition hover:bg-green-50"
  >
    <Bell size={18} />
    Notify Me
  </motion.button>
)
        )}
      </div>
    </motion.div>
  );
}