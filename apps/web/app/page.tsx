"use client";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import CategoryTabs from "@/components/home/CategoryTabs";
import ProductGrid from "@/components/product/ProductGrid";
import CartDrawer from "@/components/cart/CartDrawer";
import Footer from "@/components/layout/Footer";

import { products } from "@/constants/products";
import { useFilterStore } from "@/store/filterStore";

export default function Home() {
  const search = useFilterStore((state) => state.search);
  const category = useFilterStore((state) => state.category);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
      <CategoryTabs />
      <ProductGrid products={filteredProducts} />
      <CartDrawer />
      <Footer />
    </main>
  );
}