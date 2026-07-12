"use client";



import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import CategoryTabs from "@/components/home/CategoryTabs";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import RecentlyPurchased from "@/components/home/RecentlyPurchased";
import ProductFilters from "@/components/home/ProductFilters";
import ProductGrid from "@/components/product/ProductGrid";
import ProductQuickView from "@/components/product/ProductQuickView";
import CartDrawer from "@/components/cart/CartDrawer";
import StickyCartBar from "@/components/cart/StickyCartBar";
import Footer from "@/components/layout/Footer";
import BannerCarousel from "@/components/home/BannerCarousel";



import { getProducts } from "@/lib/products";

import { mapProduct } from "@/utils/mapProduct";

import { useFilterStore } from "@/store/filterStore";

import { useAuthStore } from "@/store/authStore";

import { Product } from "@/types/product";

import {

  getActiveHomepageSections,

  HomepageSection,

} from "@/services/homepageSectionService";



export default function Home() {

  const user = useAuthStore((state) => state.user);



  const { data: products = [], isLoading: loading } = useQuery({

    queryKey: ["products"],

    queryFn: async () => {

      const data = await getProducts();

      return data.map(mapProduct);

    },

  });



  const { data: homepageSections = [] } = useQuery({

    queryKey: ["active-homepage-sections"],

    queryFn: getActiveHomepageSections,

  });



  const search = useFilterStore((state) => state.search);

  const category = useFilterStore((state) => state.category);

  const sort = useFilterStore((state) => state.sort);

  const inStockOnly = useFilterStore((state) => state.inStockOnly);

  const discountedOnly = useFilterStore((state) => state.discountedOnly);

  const minRating = useFilterStore((state) => state.minRating);

  const setCategory = useFilterStore((state) => state.setCategory);



  function scrollToProducts() {

    document

      .getElementById("products-section")

      ?.scrollIntoView({

        behavior: "smooth",

        block: "start",

      });

  }



  function handleBannerClick(selectedCategory: string) {

    setCategory(selectedCategory);



    window.setTimeout(() => {

      scrollToProducts();

    }, 100);

  }



  const filteredProducts = useMemo(() => {

    let result = products.filter((product) => {

      const matchesSearch = product.name

        .toLowerCase()

        .includes(search.toLowerCase());



      const matchesCategory =

        category === "All" || product.category === category;



      const matchesStock = !inStockOnly || product.stock > 0;

      const matchesDiscount =

        !discountedOnly || product.discount > 0;

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



  const hasAdvancedFilters =

    Boolean(search) ||

    sort !== "default" ||

    inStockOnly ||

    discountedOnly ||

    minRating > 0;



  const userName =

    user?.user_metadata?.full_name?.trim().split(" ")[0] ||

    "there";



  const currentHour = new Date().getHours();



  const greeting =

    currentHour < 12

      ? "Good morning"

      : currentHour < 18

        ? "Good afternoon"

        : "Good evening";



  return (

    <main className="min-h-screen overflow-x-hidden bg-gray-50 pb-24 md:pb-0">

      <Navbar />



      {!hasAdvancedFilters && !isCategorySelected && (

        <section className="mx-auto max-w-7xl px-3 pt-4 sm:px-6 sm:pt-6">

          <div className="rounded-2xl bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">

            <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">

              {greeting}, {userName} 👋

            </h1>



            <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">

              Fresh groceries, quick delivery, and smart picks just for you.

            </p>

          </div>

        </section>

      )}



      {!hasAdvancedFilters && (

        <Hero onStartShopping={scrollToProducts} />

      )}



      {!hasAdvancedFilters && (

        <BannerCarousel onBannerClick={handleBannerClick} />

      )}



      <CategoryTabs />

      <ProductFilters />



      <div id="products-section" className="scroll-mt-32">

        {hasAdvancedFilters || isCategorySelected ? (

          <>

            <section className="mt-8 sm:mt-12">

              <SectionHeader

                title={

                  isCategorySelected

                    ? `${category} Products`

                    : "Search Results"

                }

                subtitle={`${filteredProducts.length} products found`}

              />



              <ProductGrid

                products={filteredProducts}

                isLoading={loading}

              />

            </section>



            {isCategorySelected && !hasAdvancedFilters && (

              <DynamicHomepageSections

                sections={homepageSections}

                products={products}

                loading={loading}

                excludeAllProducts

              />

            )}

          </>

        ) : (

          <DynamicHomepageSections

            sections={homepageSections}

            products={products}

            loading={loading}

          />

        )}

      </div>



      <ProductQuickView />

      <CartDrawer />

      <StickyCartBar />

      <Footer />

    </main>

  );

}



function DynamicHomepageSections({

  sections,

  products,

  loading,

  excludeAllProducts = false,

}: {

  sections: HomepageSection[];

  products: Product[];

  loading: boolean;

  excludeAllProducts?: boolean;

}) {

  return (

    <>

      {sections

        .filter((section) =>

          excludeAllProducts

            ? section.section_type !== "all"

            : true

        )

        .map((section) => {

          if (section.section_type === "recently_viewed") {

            return <RecentlyViewed key={section.id} />;

          }



          if (section.section_type === "recently_purchased") {

            return <RecentlyPurchased key={section.id} />;

          }



          const sectionProducts = getSectionProducts(

            section,

            products

          );



          return (

            <HomeProductSection

              key={section.id}

              title={section.title}

              subtitle={section.subtitle ?? ""}

              products={sectionProducts}

              loading={loading}

            />

          );

        })}

    </>

  );

}



function getSectionProducts(

  section: HomepageSection,

  products: Product[]

) {

  let result: Product[] = [];



  if (section.section_type === "all") {

    result = products;

  }



  if (section.section_type === "featured") {

    result = products.filter((product) => product.featured);

  }



  if (section.section_type === "bestseller") {

    result = products.filter((product) => product.bestseller);

  }



  if (section.section_type === "discounted") {

    result = products

      .filter((product) => product.discount > 0)

      .sort((a, b) => b.discount - a.discount);

  }



  if (section.section_type === "new") {

    result = [...products].sort((a, b) => b.id - a.id);

  }



  if (section.section_type === "top_rated") {

    result = [...products]

      .filter((product) => product.rating >= 4)

      .sort((a, b) => b.rating - a.rating);

  }



  if (

    section.section_type === "category" &&

    section.category

  ) {

    result = products.filter(

      (product) => product.category === section.category

    );

  }



  return result.slice(0, section.limit_count);

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

    <section className="mt-8 sm:mt-12">

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

    <div className="mx-auto mb-4 max-w-7xl px-3 sm:mb-6 sm:px-6">

      <h2 className="text-2xl font-bold leading-tight sm:text-3xl">

        {title}

      </h2>



      {subtitle && (

        <p className="mt-1 text-sm text-gray-500 sm:mt-2 sm:text-base">

          {subtitle}

        </p>

      )}

    </div>

  );

}