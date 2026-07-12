"use client";



import Image from "next/image";

import { useEffect } from "react";

import {

  useQuery,

  useQueryClient,

} from "@tanstack/react-query";



import { supabase } from "@/lib/supabase";

import { getCategories } from "@/services/categoryService";

import { useFilterStore } from "@/store/filterStore";



export default function CategoryTabs() {

  const queryClient = useQueryClient();



  const activeCategory = useFilterStore(

    (state) => state.category

  );



  const setCategory = useFilterStore(

    (state) => state.setCategory

  );



  const { data: categories = [] } = useQuery({

    queryKey: ["admin-categories"],

    queryFn: getCategories,

    staleTime: 0,

    refetchOnMount: "always",

    refetchOnWindowFocus: true,

  });



  useEffect(() => {

    const channel = supabase

      .channel("homepage-categories-realtime")

      .on(

        "postgres_changes",

        {

          event: "*",

          schema: "public",

          table: "categories",

        },

        () => {

          queryClient.refetchQueries({

            queryKey: ["admin-categories"],

          });

        }

      )

      .subscribe();



    return () => {

      supabase.removeChannel(channel);

    };

  }, [queryClient]);



  const visibleCategories = [...categories]

    .filter((category) => category.is_active)

    .sort((a, b) => a.sort_order - b.sort_order);



  return (

    <section className="mx-auto mt-6 max-w-7xl sm:mt-10">

      <div className="hide-scrollbar flex gap-2.5 overflow-x-auto px-3 pb-2 sm:gap-4 sm:px-6">

        <button

          type="button"

          onClick={() => setCategory("All")}

          className={`min-w-[86px] shrink-0 rounded-2xl border px-2 py-3 transition sm:min-w-[120px] sm:p-4 ${

            activeCategory === "All"

              ? "border-green-600 bg-green-50 shadow-sm"

              : "border-gray-200 bg-white hover:border-green-500"

          }`}

        >

          <div className="text-2xl sm:text-3xl">

            🛒

          </div>



          <div className="mt-1.5 line-clamp-1 text-xs font-semibold sm:mt-2 sm:text-base">

            All

          </div>

        </button>



        {visibleCategories.map((category) => (

          <button

            key={category.id}

            type="button"

            onClick={() => setCategory(category.name)}

            className={`min-w-[86px] shrink-0 rounded-2xl border px-2 py-3 transition sm:min-w-[120px] sm:p-4 ${

              activeCategory === category.name

                ? "border-green-600 bg-green-50 shadow-sm"

                : "border-gray-200 bg-white hover:border-green-500"

            }`}

          >

            <div className="mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white text-2xl sm:h-12 sm:w-12 sm:text-3xl">

              {category.image ? (

                <Image

                  src={category.image}

                  alt={category.name}

                  width={48}

                  height={48}

                  className="h-full w-full object-contain p-0.5"

                />

              ) : (

                category.emoji || "🛍️"

              )}

            </div>



            <div className="mt-1.5 line-clamp-2 min-h-8 text-xs font-semibold leading-4 sm:mt-2 sm:min-h-0 sm:text-base">

              {category.name}

            </div>

          </button>

        ))}

      </div>

    </section>

  );

}