import ProductCard from "@/components/product/ProductCard";
import ProductGridSkeleton from "@/components/skeleton/ProductGridSkeleton";

import { Product } from "@/types/product";

type Props = {
  products: Product[];
  isLoading?: boolean;
  showEmptyState?: boolean;
};

export default function ProductGrid({
  products,
  isLoading = false,
  showEmptyState = true,
}: Props) {
  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  if (!showEmptyState && products.length === 0) {
    return null;
  }

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 pb-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <h3 className="text-2xl font-bold text-gray-800">
            No products found
          </h3>

          <p className="mt-2 text-gray-500">
            Try another search or choose a different category.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-12">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}