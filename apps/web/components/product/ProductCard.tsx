"use client";



import Link from "next/link";

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

import { Product } from "@/types/product";

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

  const items = useCartStore((state) => state.items);

  const addItem = useCartStore((state) => state.addItem);

  const increaseQuantity = useCartStore(

    (state) => state.increaseQuantity

  );

  const decreaseQuantity = useCartStore(

    (state) => state.decreaseQuantity

  );



  const toggleWishlist = useWishlistStore(

    (state) => state.toggle

  );



  const liked = useWishlistStore((state) =>

    state.isWishlisted(product.id)

  );



  const openQuickView = useQuickViewStore(

    (state) => state.open

  );



  const user = useAuthStore((state) => state.user);



  const cartKey = `${product.id}-base`;



  const cartItem = items.find(

    (item) => item.cartKey === cartKey

  );



  const inStock = product.stock > 0;



  async function handleNotifyMe() {

    if (!user) {

      toast.error("Please login to get stock alerts");

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



  return (

    <motion.article

      layout

      initial={{

        opacity: 0,

        y: 18,

      }}

      whileInView={{

        opacity: 1,

        y: 0,

      }}

      viewport={{ once: true }}

      whileHover={{

        y: -5,

        transition: {

          duration: 0.2,

        },

      }}

      transition={{

        duration: 0.3,

      }}

      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg sm:rounded-3xl"

    >

      <div

        onClick={() => openQuickView(product)}

        className="relative flex h-40 cursor-pointer items-center justify-center overflow-hidden bg-white sm:h-56 lg:h-64"

      >

        {product.discount > 0 && (

          <span className="absolute left-2 top-2 z-10 rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold text-white shadow-sm sm:left-4 sm:top-4 sm:px-3 sm:text-xs">

            {product.discount}% OFF

          </span>

        )}



        {product.bestseller && (

          <span className="absolute left-2 top-9 z-10 rounded-full bg-yellow-400 px-2 py-1 text-[9px] font-bold text-black shadow-sm sm:left-4 sm:top-12 sm:px-3 sm:text-xs">

            Best Seller

          </span>

        )}



        <button

          type="button"

          onClick={(event) => {

            event.stopPropagation();



            toggleWishlist(product);



            toast(

              liked

                ? "Removed from wishlist"

                : "Added to wishlist"

            );

          }}

          className="absolute right-2 top-2 z-20 rounded-full border border-gray-100 bg-white/95 p-1.5 shadow-sm transition hover:bg-red-50 sm:right-4 sm:top-4 sm:p-2"

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

                    scale: [1, 1.3, 1],

                  }

                : {}

            }

          >

            <Heart

              size={17}

              className={

                liked

                  ? "fill-red-500 text-red-500"

                  : "text-gray-500"

              }

            />

          </motion.div>

        </button>



        <motion.div

          whileHover={{ scale: 1.04 }}

          transition={{ duration: 0.22 }}

          className="relative h-full w-full p-2.5 sm:p-5"

        >

          <ProductImage

            src={product.image}

            alt={product.name}

          />

        </motion.div>



        <button

          type="button"

          onClick={(event) => {

            event.stopPropagation();

            openQuickView(product);

          }}

          className="absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-gray-100 bg-white/95 px-4 py-2 text-sm font-semibold opacity-0 shadow-md transition group-hover:opacity-100 sm:flex"

        >

          <Eye size={16} />

          Quick View

        </button>

      </div>



      <div className="flex flex-1 flex-col border-t border-gray-100 p-3 sm:p-5">

        <div className="flex items-center justify-between gap-1.5">

          <div className="flex min-w-0 items-center gap-1 text-[11px] sm:gap-2 sm:text-sm">

            <Star

              size={13}

              className="shrink-0 fill-yellow-400 text-yellow-400 sm:size-4"

            />



            <span className="font-semibold">

              {product.rating}

            </span>



            <span className="hidden truncate text-gray-500 sm:inline">

              ({product.reviews})

            </span>

          </div>



          <span

            className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold sm:px-3 sm:text-xs ${

              inStock

                ? "bg-green-100 text-green-700"

                : "bg-red-100 text-red-700"

            }`}

          >

            {inStock ? "In Stock" : "Out"}

          </span>

        </div>



        <Link href={`/product/${product.id}`}>

          <h3 className="mt-2 line-clamp-2 min-h-10 text-sm font-bold leading-5 transition hover:text-green-700 sm:mt-3 sm:min-h-14 sm:text-lg sm:leading-7">

            {product.name}

          </h3>

        </Link>



        <p className="mt-0.5 line-clamp-1 text-xs text-gray-500 sm:mt-1 sm:text-sm">

          {product.unit}

        </p>



        <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:mt-4 sm:gap-3">

          <span className="text-lg font-bold sm:text-2xl">

            ₹{product.price}

          </span>



          {product.mrp > product.price && (

            <span className="text-xs text-gray-400 line-through sm:text-base">

              ₹{product.mrp}

            </span>

          )}

        </div>



        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-500 sm:mt-2 sm:gap-2 sm:text-sm">

          <Truck size={13} className="shrink-0 sm:size-[15px]" />

          <span className="line-clamp-1">

            {product.deliveryTime}

          </span>

        </div>



        <div className="mt-auto pt-3 sm:pt-5">

          {cartItem ? (

            <div className="flex w-full items-center justify-between rounded-xl border border-green-600 bg-green-50 px-2 py-2 sm:px-4 sm:py-3">

              <button

                type="button"

                onClick={() => {

                  decreaseQuantity(cartKey);

                  toast("Cart updated");

                }}

                className="rounded-lg bg-green-600 p-1.5 text-white transition hover:bg-green-700 sm:p-2"

                aria-label={`Decrease ${product.name} quantity`}

              >

                <Minus size={15} className="sm:size-[18px]" />

              </button>



              <span className="text-sm font-bold text-green-700 sm:text-base">

                {cartItem.quantity}

              </span>



              <button

                type="button"

                onClick={() => {

                  const success =

                    increaseQuantity(cartKey);



                  if (success) {

                    toast.success(

                      `${product.name} quantity increased`

                    );

                  } else {

                    toast.error(

                      "Maximum available stock reached"

                    );

                  }

                }}

                className="rounded-lg bg-green-600 p-1.5 text-white transition hover:bg-green-700 sm:p-2"

                aria-label={`Increase ${product.name} quantity`}

              >

                <Plus size={15} className="sm:size-[18px]" />

              </button>

            </div>

          ) : inStock ? (

            <motion.button

              type="button"

              whileTap={{ scale: 0.96 }}

              onClick={() => {

                addItem(product, null);



                toast.success(

                  `${product.name} added to cart`

                );

              }}

              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-green-600 py-2.5 text-xs font-semibold text-white transition hover:bg-green-700 sm:gap-2 sm:py-3 sm:text-base"

            >

              <ShoppingCart size={15} className="sm:size-[18px]" />

              Add to Cart

            </motion.button>

          ) : (

            <motion.button

              type="button"

              whileTap={{ scale: 0.96 }}

              onClick={handleNotifyMe}

              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-green-600 bg-white py-2.5 text-xs font-semibold text-green-700 transition hover:bg-green-50 sm:gap-2 sm:py-3 sm:text-base"

            >

              <Bell size={15} className="sm:size-[18px]" />

              Notify Me

            </motion.button>

          )}

        </div>

      </div>

    </motion.article>

  );

}