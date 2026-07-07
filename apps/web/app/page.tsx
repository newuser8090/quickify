"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import CategoryTabs from "@/components/home/CategoryTabs";
import FlashSale from "@/components/home/FlashSale";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BestSellerProducts from "@/components/home/BestSellerProducts";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import ProductFilters from "@/components/home/ProductFilters";
import ProductGrid from "@/components/product/ProductGrid";
import ProductQuickView from "@/components/product/ProductQuickView";
import CartDrawer from "@/components/cart/CartDrawer";
import Footer from "@/components/layout/Footer";
import BannerCarousel from "@/components/home/BannerCarousel";

import { getProducts } from "@/lib/products";
import { mapProduct } from "@/utils/mapProduct";
import { useFilterStore } from "@/store/filterStore";
import { Product } from "@/types/product";

export default function Home() {
  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const data = await getProducts();
      return data.map(mapProduct);
    },
  });

  const search = useFilterStore((state) => state.search);
  const category = useFilterStore((state) => state.category);
  const sort = useFilterStore((state) => state.sort);
  const inStockOnly = useFilterStore((state) => state.inStockOnly);
  const discountedOnly = useFilterStore((state) => state.discountedOnly);
  const minRating = useFilterStore((state) => state.minRating);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || product.category === category;

      const matchesStock = !inStockOnly || product.stock > 0;
      const matchesDiscount = !discountedOnly || product.discount > 0;
      const matchesRating = product.rating >= minRating;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStock &&
        matchesDiscount &&
        matchesRating
      );
    });

    if (sort === "price-low") {
      result = [...result].sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    if (sort === "rating") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    if (sort === "discount") {
      result = [...result].sort((a, b) => b.discount - a.discount);
    }

    return result;
  }, [
    products,
    search,
    category,
    sort,
    inStockOnly,
    discountedOnly,
    minRating,
  ]);

  const isCategorySelected = category !== "All";

  const hasActiveFilters =
    search ||
    isCategorySelected ||
    sort !== "default" ||
    inStockOnly ||
    discountedOnly ||
    minRating > 0;

  const newArrivals = useMemo(() => {
    return [...products].sort((a, b) => b.id - a.id).slice(0, 8);
  }, [products]);

  const topRated = useMemo(() => {
    return [...products]
      .filter((product) => product.rating >= 4)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
  }, [products]);

  const biggestDiscounts = useMemo(() => {
    return [...products]
      .filter((product) => product.discount > 0)
      .sort((a, b) => b.discount - a.discount)
      .slice(0, 8);
  }, [products]);

  const normalProducts = products.filter(
    (product) => !product.featured && !product.bestseller
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {!hasActiveFilters && <Hero />}
      {!hasActiveFilters && <BannerCarousel />}

      <CategoryTabs />
      <ProductFilters />

      {hasActiveFilters ? (
        <section className="mt-12">
          <SectionHeader
            title={isCategorySelected ? `${category} Products` : "Search Results"}
            subtitle={`${filteredProducts.length} products found`}
          />

          <ProductGrid products={filteredProducts} isLoading={loading} />
        </section>
      ) : (
        <>
          <FlashSale />

          <FeaturedProducts />

          <BestSellerProducts />

          <HomeProductSection
            title="🆕 New Arrivals"
            subtitle="Freshly added products in Quickify."
            products={newArrivals}
            loading={loading}
          />

          <HomeProductSection
            title="⭐ Top Rated"
            subtitle="Products customers love the most."
            products={topRated}
            loading={loading}
          />

          <HomeProductSection
            title="💸 Biggest Discounts"
            subtitle="Best deals and highest savings today."
            products={biggestDiscounts}
            loading={loading}
          />

          <RecentlyViewed />

          <section className="mt-12">
            <SectionHeader
              title="All Products"
              subtitle="Browse all available products."
            />

            <ProductGrid products={normalProducts} isLoading={loading} />
          </section>
        </>
      )}

      <ProductQuickView />
      <CartDrawer />
      <Footer />
    </main>
  );
}

function HomeProductSection({
  title,
  subtitle,
  products,
  loading,
}: {
  title: string;
  subtitle: string;
  products: Product[];
  loading: boolean;
}) {
  if (!loading && products.length === 0) return null;

  return (
    <section className="mt-12">
      <SectionHeader title={title} subtitle={subtitle} />

      <ProductGrid
        products={products}
        isLoading={loading}
        showEmptyState={false}
      />
    </section>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto mb-6 max-w-7xl px-6">
      <h2 className="text-3xl font-bold">{title}</h2>
      <p className="mt-2 text-gray-500">{subtitle}</p>
    </div>
  );
}