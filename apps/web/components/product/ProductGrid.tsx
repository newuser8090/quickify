import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/types/product";

type Props = {
  products: Product[];
};

export default function ProductGrid({ products }: Props) {
  return (
    <section
      id="products"
      className="mx-auto mt-10 max-w-7xl px-6 pb-12"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold">Products</h2>

        <span className="text-gray-500">{products.length} Products</span>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border bg-white p-12 text-center">
          <h3 className="text-2xl font-bold">No products found</h3>
          <p className="mt-2 text-gray-500">Try another search or category.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}