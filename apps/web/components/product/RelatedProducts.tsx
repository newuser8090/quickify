"use client";

import { useQuery } from "@tanstack/react-query";

import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/types/product";
import { getProductsByCategory } from "@/services/productService";

type Props = {
  product: Product;
};

export default function RelatedProducts({ product }: Props) {
  const { data: relatedProducts = [], isLoading } = useQuery({
    queryKey: ["related-products", product.category],
    queryFn: () => getProductsByCategory(product.category),
  });

  if (isLoading) return null;

  const filteredProducts = relatedProducts
    .filter((item) => item.id !== product.id)
    .slice(0, 4);

  if (filteredProducts.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">You May Also Like</h2>

        <p className="mt-2 text-gray-500">
          More products from {product.category}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filteredProducts.map((item) => (
          <ProductCard
            key={item.id}
            product={item}
          />
        ))}
      </div>
    </section>
  );
}