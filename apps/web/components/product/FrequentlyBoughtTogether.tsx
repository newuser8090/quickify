"use client";

import Image from "next/image";
import {
  Check,
  ImageOff,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Product } from "@/types/product";
import { getProductsByCategory } from "@/services/productService";
import { useCartStore } from "@/store/cartStore";

type Props = {
  product: Product;
};

export default function FrequentlyBoughtTogether({
  product,
}: Props) {
  const addItem = useCartStore(
    (state) => state.addItem
  );

  const [selectedIds, setSelectedIds] =
    useState<Set<number>>(new Set());

  const {
    data: categoryProducts = [],
    isLoading,
  } = useQuery({
    queryKey: [
      "frequently-bought-together",
      product.category,
    ],
    queryFn: () =>
      getProductsByCategory(
        product.category
      ),
  });

  const suggestions = useMemo(
    () =>
      categoryProducts
        .filter(
          (item) =>
            item.id !== product.id &&
            item.stock > 0
        )
        .slice(0, 3),
    [
      categoryProducts,
      product.id,
    ]
  );

  const bundleProducts = useMemo(
    () => [
      product,
      ...suggestions,
    ],
    [product, suggestions]
  );

  const bundleKey = useMemo(
    () =>
      bundleProducts
        .map((item) => item.id)
        .sort(
          (firstId, secondId) =>
            firstId - secondId
        )
        .join("-"),
    [bundleProducts]
  );

  useEffect(() => {
    const nextIds =
      bundleProducts.map(
        (item) => item.id
      );

    setSelectedIds(
      (currentIds) => {
        const currentKey =
          Array.from(
            currentIds
          )
            .sort(
              (
                firstId,
                secondId
              ) =>
                firstId -
                secondId
            )
            .join("-");

        const nextKey = [
          ...nextIds,
        ]
          .sort(
            (
              firstId,
              secondId
            ) =>
              firstId -
              secondId
          )
          .join("-");

        if (
          currentKey === nextKey
        ) {
          return currentIds;
        }

        return new Set(
          nextIds
        );
      }
    );
  }, [bundleKey]);

  const selectedProducts =
    bundleProducts.filter(
      (item) =>
        selectedIds.has(item.id)
    );

  const selectedTotal =
    selectedProducts.reduce(
      (total, item) =>
        total +
        Number(item.price ?? 0),
      0
    );

  function toggleProduct(
    productId: number
  ) {
    setSelectedIds(
      (currentIds) => {
        const updatedIds =
          new Set(currentIds);

        if (
          updatedIds.has(
            productId
          )
        ) {
          updatedIds.delete(
            productId
          );
        } else {
          updatedIds.add(
            productId
          );
        }

        return updatedIds;
      }
    );
  }

  function selectAllProducts() {
    setSelectedIds(
      new Set(
        bundleProducts.map(
          (item) => item.id
        )
      )
    );
  }

  function handleAddSelected() {
    if (
      selectedProducts.length ===
      0
    ) {
      toast.error(
        "Select at least one product"
      );

      return;
    }

    let addedCount = 0;
    let skippedCount = 0;

    selectedProducts.forEach(
      (selectedProduct) => {
        const success =
          addItem(
            selectedProduct,
            null
          );

        if (
          success === false
        ) {
          skippedCount += 1;
        } else {
          addedCount += 1;
        }
      }
    );

    if (addedCount > 0) {
      toast.success(
        `${addedCount} product${
          addedCount === 1
            ? ""
            : "s"
        } added to cart`
      );
    }

    if (skippedCount > 0) {
      toast.error(
        `${skippedCount} product${
          skippedCount === 1
            ? ""
            : "s"
        } could not be added`
      );
    }
  }

  if (
    !isLoading &&
    suggestions.length === 0
  ) {
    return null;
  }

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm sm:mt-10">
      <div className="border-b border-gray-100 bg-gradient-to-r from-green-50 via-emerald-50 to-white p-4 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-green-700 sm:text-xs">
              <Sparkles size={13} />
              Bundle and save time
            </div>

            <h2 className="mt-3 text-xl font-extrabold text-gray-900 sm:text-3xl">
              Frequently Bought Together
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
              Pick the products you need and add the complete bundle to your cart.
            </p>
          </div>

          {!isLoading &&
            selectedProducts.length <
              bundleProducts.length && (
              <button
                type="button"
                onClick={
                  selectAllProducts
                }
                className="shrink-0 rounded-xl border border-green-200 bg-white px-3 py-2 text-xs font-bold text-green-700 transition hover:bg-green-50 sm:px-4 sm:text-sm"
              >
                Select all
              </button>
            )}
        </div>
      </div>

      <div className="p-4 sm:p-7">
        {isLoading ? (
          <div className="flex gap-3 overflow-hidden sm:grid sm:grid-cols-4 sm:gap-4">
            {Array.from({
              length: 4,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-52 w-[138px] shrink-0 animate-pulse rounded-2xl bg-gray-100 sm:h-64 sm:w-auto"
                />
              )
            )}
          </div>
        ) : (
          <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible">
            {bundleProducts.map(
              (
                bundleProduct,
                index
              ) => {
                const selected =
                  selectedIds.has(
                    bundleProduct.id
                  );

                return (
                  <BundleProductCard
                    key={
                      bundleProduct.id
                    }
                    product={
                      bundleProduct
                    }
                    selected={
                      selected
                    }
                    primary={
                      index === 0
                    }
                    onToggle={() =>
                      toggleProduct(
                        bundleProduct.id
                      )
                    }
                  />
                );
              }
            )}
          </div>
        )}

        {!isLoading && (
          <div className="mt-5 overflow-hidden rounded-2xl border border-green-100 bg-green-50">
            <div className="flex items-center justify-between gap-4 border-b border-green-100 px-4 py-3 sm:px-5">
              <div>
                <p className="text-xs font-semibold text-green-700">
                  Selected bundle
                </p>

                <p className="mt-0.5 text-sm font-bold text-gray-900">
                  {
                    selectedProducts.length
                  }{" "}
                  of{" "}
                  {
                    bundleProducts.length
                  }{" "}
                  products
                </p>
              </div>

              <p className="text-2xl font-extrabold text-green-700 sm:text-3xl">
                ₹
                {selectedTotal.toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>

            <div className="p-3 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:p-4">
              <p className="hidden text-sm text-gray-600 sm:block">
                Products are added individually, so you can still change their quantities from the cart.
              </p>

              <button
                type="button"
                onClick={
                  handleAddSelected
                }
                disabled={
                  selectedProducts.length ===
                  0
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto sm:shrink-0"
              >
                <ShoppingCart
                  size={18}
                />

                Add Selected
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function BundleProductCard({
  product,
  selected,
  primary,
  onToggle,
}: {
  product: Product;
  selected: boolean;
  primary: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={`relative flex w-[138px] shrink-0 flex-col overflow-hidden rounded-2xl border text-left transition sm:w-auto ${
        selected
          ? "border-green-300 bg-green-50 shadow-sm ring-1 ring-green-100"
          : "border-gray-200 bg-gray-50 opacity-60 grayscale-[20%]"
      }`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-white">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 138px, 220px"
            className="object-contain p-3 sm:p-4"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-300">
            <ImageOff size={28} />

            <span className="text-[10px] font-medium">
              No image
            </span>
          </div>
        )}

        <span
          className={`absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border shadow-sm transition ${
            selected
              ? "border-green-600 bg-green-600 text-white"
              : "border-gray-200 bg-white text-transparent"
          }`}
        >
          <Check size={15} />
        </span>

        {primary && (
          <span className="absolute bottom-2 left-2 rounded-full bg-gray-900/80 px-2 py-1 text-[9px] font-bold text-white backdrop-blur">
            Current item
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col border-t border-gray-100 p-3">
        <h3 className="line-clamp-2 min-h-10 text-xs font-bold leading-5 text-gray-900 sm:min-h-12 sm:text-sm sm:leading-6">
          {product.name}
        </h3>

        <p className="mt-1 truncate text-[10px] text-gray-500 sm:text-xs">
          {product.unit}
        </p>

        <div className="mt-auto flex items-baseline gap-1.5 pt-2">
          <span className="text-sm font-extrabold text-green-700 sm:text-lg">
            ₹
            {Number(
              product.price
            ).toLocaleString(
              "en-IN"
            )}
          </span>

          {product.mrp >
            product.price && (
            <span className="text-[9px] text-gray-400 line-through sm:text-xs">
              ₹{product.mrp}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
