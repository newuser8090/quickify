"use client";
import SectionCountdown from "@/components/home/SectionCountdown";
import {
  useMemo,
} from "react";
import {
  useQuery,
} from "@tanstack/react-query";
import {
  Clock3,
  MapPin,
  Sparkles,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import FloatingSearchHeader from "@/components/layout/FloatingSearchHeader";
import Hero from "@/components/home/Hero";
import CategoryTabs from "@/components/home/CategoryTabs";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import RecentlyPurchased from "@/components/home/RecentlyPurchased";
import ProductFilters from "@/components/home/ProductFilters";
import ProductGrid from "@/components/product/ProductGrid";
import ProductQuickView from "@/components/product/ProductQuickView";
import Footer from "@/components/layout/Footer";
import BannerCarousel from "@/components/home/BannerCarousel";

import {
  getProducts,
} from "@/lib/products";
import {
  mapProduct,
} from "@/utils/mapProduct";
import {
  useFilterStore,
} from "@/store/filterStore";
import {
  useAuthStore,
} from "@/store/authStore";
import type {
  Product,
} from "@/types/product";
import {
  getActiveHomepageSections,
  type HomepageSection,
} from "@/services/homepageSectionService";

export default function Home() {
  const user =
    useAuthStore(
      (state) =>
        state.user
    );

  const {
    data: products = [],
    isLoading: loading,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const data =
        await getProducts();

      return data.map(
        mapProduct
      );
    },
  });

  const {
    data: homepageSections = [],
  } = useQuery({
    queryKey: [
      "active-homepage-sections",
    ],
    queryFn:
      getActiveHomepageSections,
  });

  const search =
    useFilterStore(
      (state) =>
        state.search
    );

  const category =
    useFilterStore(
      (state) =>
        state.category
    );

  const sort =
    useFilterStore(
      (state) =>
        state.sort
    );

  const inStockOnly =
    useFilterStore(
      (state) =>
        state.inStockOnly
    );

  const discountedOnly =
    useFilterStore(
      (state) =>
        state.discountedOnly
    );

  const minRating =
    useFilterStore(
      (state) =>
        state.minRating
    );

  const setCategory =
    useFilterStore(
      (state) =>
        state.setCategory
    );

  function scrollToProducts() {
    document
      .getElementById(
        "products-section"
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleBannerClick(
    selectedCategory: string
  ) {
    setCategory(
      selectedCategory
    );

    window.setTimeout(() => {
      scrollToProducts();
    }, 100);
  }

  const filteredProducts =
    useMemo(() => {
      let result =
        products.filter(
          (product) => {
            const matchesSearch =
              product.name
                .toLowerCase()
                .includes(
                  search.toLowerCase()
                );

            const matchesCategory =
              category ===
                "All" ||
              product.category ===
                category;

            const matchesStock =
              !inStockOnly ||
              product.stock > 0;

            const matchesDiscount =
              !discountedOnly ||
              product.discount > 0;

            const matchesRating =
              product.rating >=
              minRating;

            return (
              matchesSearch &&
              matchesCategory &&
              matchesStock &&
              matchesDiscount &&
              matchesRating
            );
          }
        );

      if (
        sort === "price-low"
      ) {
        result = [
          ...result,
        ].sort(
          (a, b) =>
            a.price -
            b.price
        );
      }

      if (
        sort === "price-high"
      ) {
        result = [
          ...result,
        ].sort(
          (a, b) =>
            b.price -
            a.price
        );
      }

      if (
        sort === "rating"
      ) {
        result = [
          ...result,
        ].sort(
          (a, b) =>
            b.rating -
            a.rating
        );
      }

      if (
        sort === "discount"
      ) {
        result = [
          ...result,
        ].sort(
          (a, b) =>
            b.discount -
            a.discount
        );
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

  const isCategorySelected =
    category !== "All";

  const hasAdvancedFilters =
    Boolean(search) ||
    sort !== "default" ||
    inStockOnly ||
    discountedOnly ||
    minRating > 0;

  const userName =
    user?.user_metadata
      ?.full_name
      ?.trim()
      .split(" ")[0] ||
    "there";

  const currentHour =
    new Date().getHours();

  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
        ? "Good afternoon"
        : "Good evening";

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-50 pb-24 md:pb-0">
      <Navbar sticky={false} />

      <div
        id="home-navbar-end"
        aria-hidden="true"
        className="h-px w-full"
      />

      <FloatingSearchHeader
        sentinelId="home-navbar-end"
      />

      {!hasAdvancedFilters &&
        !isCategorySelected && (
          <section className="mx-auto max-w-7xl px-3 pt-4 sm:px-6 sm:pt-6">
            <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-white via-green-50/70 to-emerald-50 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-6">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-green-200/30 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-white/70 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-green-700 backdrop-blur sm:text-xs">
                    <Sparkles size={13} />
                    Welcome back
                  </div>

                  <h1 className="mt-3 text-2xl font-black leading-tight text-gray-950 sm:text-3xl">
                    {greeting},{" "}
                    {userName} 👋
                  </h1>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                    Fresh groceries, fast delivery and smart picks curated for
                    you.
                  </p>
                </div>

                <div className="hidden shrink-0 items-center gap-2 rounded-2xl border border-green-100 bg-white/75 px-4 py-3 shadow-sm backdrop-blur md:flex">
                  <Clock3
                    size={18}
                    className="text-green-600"
                  />

                  <div>
                    <p className="text-[10px] font-semibold text-gray-400">
                      Average delivery
                    </p>

                    <p className="text-sm font-extrabold text-gray-900">
                      10–20 minutes
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative mt-4 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-2 text-[10px] font-bold text-gray-600 shadow-sm sm:text-xs">
                  <MapPin
                    size={13}
                    className="text-green-600"
                  />
                  Delivered to your location
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-2 text-[10px] font-bold text-gray-600 shadow-sm sm:text-xs">
                  <Sparkles
                    size={13}
                    className="text-green-600"
                  />
                  Fresh picks updated daily
                </div>
              </div>
            </div>
          </section>
        )}

      {!hasAdvancedFilters && (
        <Hero
          onStartShopping={
            scrollToProducts
          }
        />
      )}

      {!hasAdvancedFilters && (
        <BannerCarousel
          onBannerClick={
            handleBannerClick
          }
        />
      )}

      <CategoryTabs />
      <ProductFilters />

      <div
        id="products-section"
        className="scroll-mt-32"
      >
        {hasAdvancedFilters ||
        isCategorySelected ? (
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
                products={
                  filteredProducts
                }
                isLoading={
                  loading
                }
              />
            </section>

            {isCategorySelected &&
              !hasAdvancedFilters && (
                <DynamicHomepageSections
                  sections={
                    homepageSections
                  }
                  products={
                    products
                  }
                  loading={
                    loading
                  }
                  excludeAllProducts
                />
              )}
          </>
        ) : (
          <DynamicHomepageSections
            sections={
              homepageSections
            }
            products={
              products
            }
            loading={
              loading
            }
          />
        )}
      </div>

      <ProductQuickView />
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
  sections:
    HomepageSection[];
  products: Product[];
  loading: boolean;
  excludeAllProducts?: boolean;
}) {
  return (
    <>
      {sections
        .filter((section) =>
          excludeAllProducts
            ? section.section_type !==
              "all"
            : true
        )
        .map((section) => {
          if (
  section.section_type ===
  "recently_viewed"
) {
  return (
    <div key={section.id}>
      {section.show_countdown && (
        <SectionTimerHeader
          section={section}
        />
      )}

      <RecentlyViewed />
    </div>
  );
}

          if (
  section.section_type ===
  "recently_purchased"
) {
  return (
    <div key={section.id}>
      {section.show_countdown && (
        <SectionTimerHeader
          section={section}
        />
      )}

      <RecentlyPurchased />
    </div>
  );
}

          const sectionProducts =
            getSectionProducts(
              section,
              products
            );

          return (
            <HomeProductSection
  key={section.id}
  section={section}
  products={
    sectionProducts
  }
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

  if (
    section.section_type ===
    "all"
  ) {
    result = products;
  }

  if (
    section.section_type ===
    "featured"
  ) {
    result =
      products.filter(
        (product) =>
          product.featured
      );
  }

  if (
    section.section_type ===
    "bestseller"
  ) {
    result =
      products.filter(
        (product) =>
          product.bestseller
      );
  }

  if (
    section.section_type ===
    "discounted"
  ) {
    result = products
      .filter(
        (product) =>
          product.discount > 0
      )
      .sort(
        (a, b) =>
          b.discount -
          a.discount
      );
  }

  if (
    section.section_type ===
    "new"
  ) {
    result = [
      ...products,
    ].sort(
      (a, b) =>
        b.id - a.id
    );
  }

  if (
    section.section_type ===
    "top_rated"
  ) {
    result = [
      ...products,
    ]
      .filter(
        (product) =>
          product.rating >= 4
      )
      .sort(
        (a, b) =>
          b.rating -
          a.rating
      );
  }

  if (
    section.section_type ===
      "category" &&
    section.category
  ) {
    result =
      products.filter(
        (product) =>
          product.category ===
          section.category
      );
  }

  return result.slice(
    0,
    section.limit_count
  );
}

function HomeProductSection({
  section,
  products,
  loading,
}: {
  section:
    HomepageSection;
  products: Product[];
  loading: boolean;
}) {
  if (
    !loading &&
    products.length === 0
  ) {
    return null;
  }

  return (
    <section className="mt-8 sm:mt-12">
      <SectionHeader
        title={
          section.title
        }
        subtitle={
          section.subtitle ??
          ""
        }
        countdown={
          section.show_countdown
            ? {
                startAt:
                  section.countdown_start,
                endAt:
                  section.countdown_end,
              }
            : undefined
        }
      />

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
  countdown,
}: {
  title: string;
  subtitle: string;
  countdown?: {
    startAt:
      string | null;
    endAt:
      string | null;
  };
}) {
  return (
    <div className="mx-auto mb-4 max-w-7xl px-3 sm:mb-6 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 sm:mt-2 sm:text-base">
              {subtitle}
            </p>
          )}
        </div>

        {countdown && (
          <SectionCountdown
            startAt={
              countdown.startAt
            }
            endAt={
              countdown.endAt
            }
          />
        )}
      </div>
    </div>
  );
}

function SectionTimerHeader({
  section,
}: {
  section:
    HomepageSection;
}) {
  return (
    <div className="mx-auto mt-8 flex max-w-7xl justify-end px-3 sm:mt-12 sm:px-6">
      <SectionCountdown
        startAt={
          section.countdown_start
        }
        endAt={
          section.countdown_end
        }
      />
    </div>
  );
}