"use client";



import {

  useEffect,

  useMemo,

  useRef,

  useState,

} from "react";

import { useRouter } from "next/navigation";

import {

  Clock,

  Flame,

  Search,

  X,

} from "lucide-react";

import { useQuery } from "@tanstack/react-query";

import Image from "next/image";

import {

  AnimatePresence,

  motion,

} from "motion/react";



import { getAllProducts } from "@/services/productService";

import { useFilterStore } from "@/store/filterStore";



const trendingSearches = [

  "Milk",

  "Bread",

  "Banana",

  "Cold Drink",

  "Tomato",

];



export default function SearchBar() {

  const router = useRouter();

  const boxRef = useRef<HTMLDivElement>(null);



  const [open, setOpen] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);



  const search = useFilterStore((state) => state.search);

  const setSearch = useFilterStore((state) => state.setSearch);

  const recentSearches = useFilterStore(

    (state) => state.recentSearches

  );

  const addRecentSearch = useFilterStore(

    (state) => state.addRecentSearch

  );

  const clearRecentSearches = useFilterStore(

    (state) => state.clearRecentSearches

  );



  const { data: products = [] } = useQuery({

    queryKey: ["products"],

    queryFn: getAllProducts,

  });



  const suggestions = useMemo(() => {

    const query = search.trim().toLowerCase();



    if (!query) return [];



    return products

      .filter(

        (product) =>

          product.name.toLowerCase().includes(query) ||

          product.category.toLowerCase().includes(query) ||

          product.unit.toLowerCase().includes(query)

      )

      .slice(0, 7);

  }, [products, search]);



  useEffect(() => {

    setActiveIndex(0);

  }, [search]);



  useEffect(() => {

    function handleClickOutside(event: MouseEvent) {

      if (

        boxRef.current &&

        !boxRef.current.contains(event.target as Node)

      ) {

        setOpen(false);

      }

    }



    window.addEventListener("mousedown", handleClickOutside);



    return () => {

      window.removeEventListener(

        "mousedown",

        handleClickOutside

      );

    };

  }, []);



  function openProduct(

    productId: number,

    productName: string

  ) {

    addRecentSearch(productName);

    setSearch("");

    setOpen(false);

    router.push(`/product/${productId}`);

  }



  function applySearch(value: string) {

    setSearch(value);

    addRecentSearch(value);

    setOpen(false);

  }



  function clearSearch() {

    setSearch("");

    setOpen(true);

  }



  function handleKeyDown(

    event: React.KeyboardEvent<HTMLInputElement>

  ) {

    if (!open) setOpen(true);



    if (event.key === "Escape") {

      setOpen(false);

      return;

    }



    if (!search.trim() || suggestions.length === 0) {

      if (event.key === "Enter" && search.trim()) {

        event.preventDefault();

        applySearch(search.trim());

      }



      return;

    }



    if (event.key === "ArrowDown") {

      event.preventDefault();



      setActiveIndex((current) =>

        current >= suggestions.length - 1 ? 0 : current + 1

      );

    }



    if (event.key === "ArrowUp") {

      event.preventDefault();



      setActiveIndex((current) =>

        current <= 0 ? suggestions.length - 1 : current - 1

      );

    }



    if (event.key === "Enter") {

      event.preventDefault();



      const selected = suggestions[activeIndex];



      if (selected) {

        openProduct(selected.id, selected.name);

      } else {

        applySearch(search.trim());

      }

    }

  }



  function highlight(text: string, query: string) {

    const cleanQuery = query.trim();



    if (!cleanQuery) return text;



    const escapedQuery = cleanQuery.replace(

      /[.*+?^${}()|[\]\\]/g,

      "\\$&"

    );



    const parts = text.split(

      new RegExp(`(${escapedQuery})`, "gi")

    );



    return (

      <>

        {parts.map((part, index) =>

          part.toLowerCase() === cleanQuery.toLowerCase() ? (

            <mark

              key={`${part}-${index}`}

              className="rounded bg-yellow-200 px-1"

            >

              {part}

            </mark>

          ) : (

            <span key={`${part}-${index}`}>{part}</span>

          )

        )}

      </>

    );

  }



  return (

    <div ref={boxRef} className="relative w-full">

      <Search

        size={19}

        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 sm:left-4 sm:size-5"

      />



      <input

        value={search}

        onFocus={() => setOpen(true)}

        onKeyDown={handleKeyDown}

        onChange={(event) => {

          setSearch(event.target.value);

          setOpen(true);

        }}

        placeholder="Search for milk, atta, fruits..."

        className="w-full rounded-2xl border border-gray-300 bg-gray-50 py-3 pl-11 pr-10 text-sm outline-none transition focus:border-green-600 focus:bg-white sm:pl-12 sm:text-base"

      />



      {search && (

        <button

          type="button"

          onClick={clearSearch}

          className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 sm:right-4"

          aria-label="Clear search"

        >

          <X size={18} />

        </button>

      )}



      <AnimatePresence>

        {open && (

          <motion.div

            initial={{

              opacity: 0,

              y: -8,

              scale: 0.99,

            }}

            animate={{

              opacity: 1,

              y: 0,

              scale: 1,

            }}

            exit={{

              opacity: 0,

              y: -8,

              scale: 0.99,

            }}

            transition={{ duration: 0.16 }}

            className="absolute left-0 right-0 top-[calc(100%+8px)] z-[70] max-h-[70vh] overflow-y-auto rounded-2xl border bg-white shadow-2xl sm:rounded-3xl"

          >

            {search.trim() ? (

              suggestions.length > 0 ? (

                <div className="py-2">

                  <div className="px-4 py-2 text-xs font-bold text-gray-500 sm:px-5 sm:py-3 sm:text-sm">

                    Products matching “{search}”

                  </div>



                  {suggestions.map((product, index) => (

                    <button

                      key={product.id}

                      type="button"

                      onMouseEnter={() => setActiveIndex(index)}

                      onClick={() =>

                        openProduct(product.id, product.name)

                      }

                      className={`flex w-full items-center gap-3 px-3 py-3 text-left transition sm:gap-4 sm:px-5 sm:py-4 ${

                        activeIndex === index

                          ? "bg-green-50"

                          : "hover:bg-green-50"

                      }`}

                    >

                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border bg-white sm:h-14 sm:w-14">

                        {product.image ? (

                          <Image

                            src={product.image}

                            alt={product.name}

                            fill

                            sizes="56px"

                            className="object-contain p-1"

                          />

                        ) : (

                          <div className="flex h-full w-full items-center justify-center text-xl">

                            📦

                          </div>

                        )}

                      </div>



                      <div className="min-w-0 flex-1">

                        <h3 className="line-clamp-1 text-sm font-semibold sm:text-base">

                          {highlight(product.name, search)}

                        </h3>



                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-500 sm:gap-2 sm:text-sm">

                          <span className="line-clamp-1">

                            {product.category}

                          </span>



                          <span>•</span>

                          <span>{product.unit}</span>

                          <span>•</span>



                          <span className="font-semibold text-green-700">

                            ₹{product.price}

                          </span>

                        </div>

                      </div>

                    </button>

                  ))}

                </div>

              ) : (

                <div className="p-7 text-center sm:p-8">

                  <div className="text-4xl sm:text-5xl">

                    🔍

                  </div>



                  <h3 className="mt-3 font-bold">

                    No products found

                  </h3>



                  <p className="mt-1 text-sm text-gray-500">

                    Try another keyword.

                  </p>

                </div>

              )

            ) : (

              <div className="p-4 sm:p-5">

                {recentSearches.length > 0 && (

                  <div className="mb-5 sm:mb-6">

                    <div className="mb-3 flex items-center justify-between">

                      <div className="flex items-center gap-2 text-sm font-bold sm:text-base">

                        <Clock size={17} />

                        Recent Searches

                      </div>



                      <button

                        type="button"

                        onClick={clearRecentSearches}

                        className="text-sm font-semibold text-green-700"

                      >

                        Clear

                      </button>

                    </div>



                    <div className="flex flex-wrap gap-2">

                      {recentSearches.map((item) => (

                        <button

                          key={item}

                          type="button"

                          onClick={() => applySearch(item)}

                          className="rounded-full bg-gray-100 px-3 py-2 text-xs transition hover:bg-green-50 sm:px-4 sm:text-sm"

                        >

                          {item}

                        </button>

                      ))}

                    </div>

                  </div>

                )}



                <div className="mb-3 flex items-center gap-2 text-sm font-bold sm:text-base">

                  <Flame

                    size={17}

                    className="text-orange-500"

                  />

                  Trending Searches

                </div>



                <div className="flex flex-wrap gap-2">

                  {trendingSearches.map((item) => (

                    <button

                      key={item}

                      type="button"

                      onClick={() => applySearch(item)}

                      className="rounded-full bg-green-50 px-3 py-2 text-xs font-medium text-green-700 transition hover:bg-green-100 sm:px-4 sm:text-sm"

                    >

                      {item}

                    </button>

                  ))}

                </div>

              </div>

            )}

          </motion.div>

        )}

      </AnimatePresence>

    </div>

  );

}