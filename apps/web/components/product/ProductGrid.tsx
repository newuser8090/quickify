import { Search } from "lucide-react";



import ProductCard from "@/components/product/ProductCard";

import ProductGridSkeleton from "@/components/skeleton/ProductGridSkeleton";

import EmptyState from "@/components/ui/EmptyState";



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

      <div className="mx-auto max-w-7xl px-3 pb-12 sm:px-6">

        <EmptyState

          icon={<Search size={44} />}

          title="No products found"

          description="Try another search, adjust filters, or choose a different category."

          actionLabel="Explore Products"

          actionHref="/"

        />

      </div>

    );

  }



  return (

    <div className="mx-auto max-w-7xl px-3 pb-10 sm:px-6 sm:pb-12">

      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">

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