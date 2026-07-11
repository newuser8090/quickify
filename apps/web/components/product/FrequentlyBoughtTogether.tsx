"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ImageOff, ShoppingCart, X } from "lucide-react";
import { toast } from "sonner";

import { Product } from "@/types/product";
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

  const { data: categoryProducts = [] } =
    useQuery({
      queryKey: [
        "frequently-bought-together",
        product.category,
      ],
      queryFn: () =>
        getProductsByCategory(
          product.category
        ),
    });

  const suggestions = useMemo(() => {
    return categoryProducts
      .filter(
        (suggestedProduct) =>
          suggestedProduct.id !== product.id
      )
      .slice(0, 3);
  }, [categoryProducts, product.id]);

  const bundleProducts = useMemo(() => {
    return [product, ...suggestions];
  }, [product, suggestions]);

  const bundleProductIdsKey = useMemo(() => {
    return bundleProducts
      .map((bundleProduct) => bundleProduct.id)
      .join("-");
  }, [bundleProducts]);

  useEffect(() => {
    const nextIds = new Set(
      bundleProducts.map(
        (bundleProduct) => bundleProduct.id
      )
    );

    setSelectedIds((currentIds) => {
      const currentKey = Array.from(currentIds)
        .sort((firstId, secondId) => firstId - secondId)
        .join("-");

      const nextKey = Array.from(nextIds)
        .sort((firstId, secondId) => firstId - secondId)
        .join("-");

      return currentKey === nextKey
        ? currentIds
        : nextIds;
    });
  }, [bundleProductIdsKey, bundleProducts]);

  if (suggestions.length === 0) {
    return null;
  }

  const selectedProducts =
    bundleProducts.filter((bundleProduct) =>
      selectedIds.has(bundleProduct.id)
    );

  const total = selectedProducts.reduce(
    (sum, selectedProduct) =>
      sum +
      Number(selectedProduct.price ?? 0),
    0
  );

  function toggleProduct(id: number) {
    setSelectedIds((currentIds) => {
      const updatedIds = new Set(currentIds);

      if (updatedIds.has(id)) {
        updatedIds.delete(id);
      } else {
        updatedIds.add(id);
      }

      return updatedIds;
    });
  }

  function handleAddSelected() {
    if (selectedProducts.length === 0) {
      toast.error(
        "Please select at least one product"
      );
      return;
    }

    selectedProducts.forEach(
      (selectedProduct) => {
        addItem(selectedProduct, null);
      }
    );

    toast.success(
      `${selectedProducts.length} products added to cart`
    );
  }

  return (
    <section className="mt-12 rounded-3xl bg-white p-8 shadow">
      <h2 className="text-3xl font-bold">
        Frequently Bought Together
      </h2>

      <p className="mt-2 text-gray-500">
        Select the products you want and add
        them together.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-6">
        {bundleProducts.map(
          (bundleProduct, index) => {
            const selected =
              selectedIds.has(
                bundleProduct.id
              );

            return (
              <div
                key={bundleProduct.id}
                className="flex items-center gap-6"
              >
                <div
                  className={`relative flex h-64 w-40 flex-col rounded-2xl border bg-green-50 p-4 text-center transition ${
                    selected
                      ? "opacity-100"
                      : "opacity-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleProduct(
                        bundleProduct.id
                      )
                    }
                    className={`absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border bg-white shadow-sm transition ${
                      selected
                        ? "text-gray-500 hover:bg-red-50 hover:text-red-500"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                    title={
                      selected
                        ? "Remove from bundle"
                        : "Add back to bundle"
                    }
                    aria-label={
                      selected
                        ? `Remove ${bundleProduct.name} from bundle`
                        : `Add ${bundleProduct.name} to bundle`
                    }
                  >
                    <X size={15} />
                  </button>

                  <div className="flex h-28 items-center justify-center overflow-hidden rounded-xl bg-white p-2">
                    {bundleProduct.image ? (
                      <Image
                        src={
                          bundleProduct.image
                        }
                        alt={
                          bundleProduct.name
                        }
                        width={112}
                        height={112}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400">
                        <ImageOff size={30} />

                        <span className="text-xs">
                          No image
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="mt-3 line-clamp-2 min-h-12 font-bold">
                    {bundleProduct.name}
                  </h3>

                  {bundleProduct.unit && (
                    <p className="mt-1 text-xs text-gray-500">
                      {bundleProduct.unit}
                    </p>
                  )}

                  <p className="mt-1 font-semibold text-green-700">
                    ₹
                    {Number(
                      bundleProduct.price ?? 0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>

                  {!selected && (
                    <p className="mt-2 text-xs font-semibold text-red-500">
                      Removed
                    </p>
                  )}
                </div>

                {index <
                  bundleProducts.length - 1 && (
                  <span className="text-3xl font-bold text-gray-400">
                    +
                  </span>
                )}
              </div>
            );
          }
        )}
      </div>

      <div className="mt-8 flex flex-col justify-between gap-4 rounded-2xl bg-green-50 p-6 md:flex-row md:items-center">
        <div>
          <p className="text-gray-500">
            Selected Total
          </p>

          <h3 className="text-3xl font-bold">
            ₹{total.toLocaleString("en-IN")}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {selectedProducts.length} of{" "}
            {bundleProducts.length} products
            selected
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddSelected}
          disabled={
            selectedProducts.length === 0
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-8 py-4 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <ShoppingCart size={20} />
          Add Selected to Cart
        </button>
      </div>
    </section>
  );
}
