"use client";

import Image from "next/image";
import {
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useQuery,
} from "@tanstack/react-query";
import {
  ArrowRight,
  Clock,
  Flame,
  Search,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "motion/react";

import {
  getAllProducts,
} from "@/services/productService";
import {
  useFilterStore,
} from "@/store/filterStore";

type Props = {
  variant?:
    | "default"
    | "floating";
};

const trendingSearches = [
  "Milk",
  "Bread",
  "Banana",
  "Cold Drink",
  "Tomato",
];

export default function SearchBar({
  variant = "default",
}: Props) {
  const router = useRouter();

  const boxRef =
    useRef<HTMLDivElement>(
      null
    );

  const inputRef =
    useRef<HTMLInputElement>(
      null
    );

  const [open, setOpen] =
    useState(false);

  /*
   * -1 means no product suggestion is
   * selected with the keyboard.
   *
   * Therefore, pressing Enter normally
   * applies the typed search instead of
   * unexpectedly opening the first item.
   */
  const [
    activeIndex,
    setActiveIndex,
  ] = useState(-1);

  /*
   * This local draft is the important fix.
   *
   * Typing updates this state only, so the
   * homepage does not filter and reflow after
   * every individual character.
   */
  const [
    draftSearch,
    setDraftSearch,
  ] = useState("");

  /*
   * `search` remains the applied homepage
   * filter. It changes only after submission.
   */
  const search =
    useFilterStore(
      (state) =>
        state.search
    );

  const setSearch =
    useFilterStore(
      (state) =>
        state.setSearch
    );

  const recentSearches =
    useFilterStore(
      (state) =>
        state.recentSearches
    );

  const addRecentSearch =
    useFilterStore(
      (state) =>
        state.addRecentSearch
    );

  const clearRecentSearches =
    useFilterStore(
      (state) =>
        state.clearRecentSearches
    );

  const floating =
    variant === "floating";

  const {
    data: products = [],
  } = useQuery({
    queryKey: ["products"],
    queryFn:
      getAllProducts,
  });

  /*
   * Suggestions use the local draft, not the
   * applied homepage filter.
   */
  const suggestions =
    useMemo(() => {
      const query =
        draftSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return [];
      }

      return products
        .filter(
          (product) =>
            product.name
              .toLowerCase()
              .includes(
                query
              ) ||
            product.category
              .toLowerCase()
              .includes(
                query
              ) ||
            product.unit
              .toLowerCase()
              .includes(
                query
              )
        )
        .slice(0, 7);
    }, [
      products,
      draftSearch,
    ]);

  /*
   * Keep both the navbar and floating search
   * synchronized whenever a search is applied
   * or reset elsewhere.
   */
  useEffect(() => {
    setDraftSearch(
      search
    );
  }, [search]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [draftSearch]);

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        boxRef.current &&
        !boxRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }

    window.addEventListener(
      "mousedown",
      handleClickOutside
    );

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
    addRecentSearch(
      productName
    );

    /*
     * Clear the applied filter before moving
     * to the product page so returning home
     * does not unexpectedly retain the query.
     */
    setSearch("");
    setDraftSearch("");
    setOpen(false);
    setActiveIndex(-1);

    inputRef.current?.blur();

    router.push(
      `/product/${productId}`
    );
  }

  function applySearch(
    rawValue: string
  ) {
    const value =
      rawValue.trim();

    if (!value) {
      return;
    }

    setDraftSearch(
      value
    );

    setSearch(value);
    addRecentSearch(value);

    setOpen(false);
    setActiveIndex(-1);

    /*
     * Search is now intentionally submitted,
     * so it is safe to close the mobile
     * keyboard before the result layout changes.
     */
    inputRef.current?.blur();

    window.requestAnimationFrame(
      () => {
        document
          .getElementById(
            "products-section"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }
    );
  }

  function clearSearch() {
    setDraftSearch("");
    setSearch("");

    setActiveIndex(-1);
    setOpen(true);

    window.requestAnimationFrame(
      () => {
        inputRef.current?.focus();
      }
    );
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (!open) {
      setOpen(true);
    }

    if (
      event.key === "Escape"
    ) {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (
      event.key ===
      "ArrowDown"
    ) {
      if (
        suggestions.length ===
        0
      ) {
        return;
      }

      event.preventDefault();

      setActiveIndex(
        (current) => {
          if (
            current >=
            suggestions.length -
              1
          ) {
            return 0;
          }

          return current + 1;
        }
      );

      return;
    }

    if (
      event.key ===
      "ArrowUp"
    ) {
      if (
        suggestions.length ===
        0
      ) {
        return;
      }

      event.preventDefault();

      setActiveIndex(
        (current) => {
          if (current <= 0) {
            return (
              suggestions.length -
              1
            );
          }

          return current - 1;
        }
      );

      return;
    }

    if (
      event.key === "Enter"
    ) {
      event.preventDefault();

      /*
       * A suggestion opens only when the user
       * intentionally selected it using the
       * arrow keys.
       */
      if (
        activeIndex >= 0
      ) {
        const selected =
          suggestions[
            activeIndex
          ];

        if (selected) {
          openProduct(
            selected.id,
            selected.name
          );

          return;
        }
      }

      applySearch(
        draftSearch
      );
    }
  }

  function highlight(
    text: string,
    query: string
  ) {
    const cleanQuery =
      query.trim();

    if (!cleanQuery) {
      return text;
    }

    const escapedQuery =
      cleanQuery.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    const parts =
      text.split(
        new RegExp(
          `(${escapedQuery})`,
          "gi"
        )
      );

    return (
      <>
        {parts.map(
          (
            part,
            index
          ) =>
            part.toLowerCase() ===
            cleanQuery.toLowerCase() ? (
              <mark
                key={`${part}-${index}`}
                className="rounded bg-yellow-200 px-0.5 text-inherit"
              >
                {part}
              </mark>
            ) : (
              <span
                key={`${part}-${index}`}
              >
                {part}
              </span>
            )
        )}
      </>
    );
  }

  const hasDraft =
    Boolean(
      draftSearch.trim()
    );

  return (
    <div
      ref={boxRef}
      className="relative w-full"
    >
      <Search
        size={19}
        className={`absolute top-1/2 z-10 -translate-y-1/2 ${
          floating
            ? "left-3 text-green-700 sm:left-3.5"
            : "left-3.5 text-gray-400 sm:left-4"
        }`}
      />

      <input
        ref={inputRef}
        value={draftSearch}
        onFocus={() =>
          setOpen(true)
        }
        onKeyDown={
          handleKeyDown
        }
        onChange={(
          event
        ) => {
          /*
           * Do not call the global setSearch
           * function here.
           */
          setDraftSearch(
            event.target.value
          );

          setOpen(true);
        }}
        placeholder="Search for milk, atta, fruits..."
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        className={`w-full outline-none transition ${
          floating
            ? "h-11 rounded-full border border-white/20 bg-white/15 py-2 pl-10 pr-9 text-xs text-gray-900 shadow-[0_8px_32px_rgba(31,38,135,0.18)] ring-1 ring-white/15 backdrop-blur-[28px] placeholder:text-gray-600 focus:border-white/30 focus:bg-white/20 sm:h-12 sm:pl-11 sm:text-sm"
            : "rounded-2xl border border-gray-300 bg-gray-50 py-3 pl-11 pr-10 text-sm focus:border-green-600 focus:bg-white sm:pl-12 sm:text-base"
        }`}
      />

      {hasDraft && (
        <button
          type="button"
          onClick={
            clearSearch
          }
          aria-label="Clear search"
          className={`absolute top-1/2 z-10 -translate-y-1/2 rounded-full p-1 transition ${
            floating
              ? "right-3 text-gray-500 hover:bg-white/50 hover:text-gray-800"
              : "right-3.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 sm:right-4"
          }`}
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
            transition={{
              duration: 0.16,
            }}
            className={`absolute left-0 right-0 top-[calc(100%+8px)] z-[90] max-h-[min(70vh,520px)] overflow-y-auto overscroll-contain border bg-white shadow-2xl ${
              floating
                ? "rounded-3xl border-white/60"
                : "rounded-2xl border-gray-200 sm:rounded-3xl"
            }`}
          >
            {hasDraft ? (
              suggestions.length >
              0 ? (
                <div className="py-2">
                  <div className="flex items-center justify-between gap-3 px-4 py-2 sm:px-5 sm:py-3">
                    <p className="min-w-0 truncate text-xs font-bold text-gray-500 sm:text-sm">
                      Suggestions for
                      “{draftSearch}”
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        applySearch(
                          draftSearch
                        )
                      }
                      className="inline-flex shrink-0 items-center gap-1 text-[11px] font-extrabold text-green-700 sm:text-xs"
                    >
                      View all
                      <ArrowRight
                        size={13}
                      />
                    </button>
                  </div>

                  {suggestions.map(
                    (
                      product,
                      index
                    ) => (
                      <button
                        key={
                          product.id
                        }
                        type="button"
                        onMouseEnter={() =>
                          setActiveIndex(
                            index
                          )
                        }
                        /*
                         * Prevent mousedown from blurring
                         * the input before click completes.
                         */
                        onMouseDown={(
                          event
                        ) =>
                          event.preventDefault()
                        }
                        onClick={() =>
                          openProduct(
                            product.id,
                            product.name
                          )
                        }
                        className={`flex w-full items-center gap-3 px-3 py-3 text-left transition sm:gap-4 sm:px-5 sm:py-4 ${
                          activeIndex ===
                          index
                            ? "bg-green-50"
                            : "hover:bg-green-50"
                        }`}
                      >
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-white sm:h-14 sm:w-14">
                          {product.image ? (
                            <Image
                              src={
                                product.image
                              }
                              alt={
                                product.name
                              }
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
                          <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 sm:text-base">
                            {highlight(
                              product.name,
                              draftSearch
                            )}
                          </h3>

                          <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-gray-500 sm:gap-2 sm:text-sm">
                            <span className="truncate">
                              {
                                product.category
                              }
                            </span>

                            <span className="shrink-0">
                              •
                            </span>

                            <span className="shrink-0">
                              {
                                product.unit
                              }
                            </span>

                            <span className="shrink-0">
                              •
                            </span>

                            <span className="shrink-0 font-semibold text-green-700">
                              ₹
                              {
                                product.price
                              }
                            </span>
                          </div>
                        </div>

                        <ChevronIcon />
                      </button>
                    )
                  )}

                  <div className="border-t border-gray-100 px-3 py-2 sm:px-5">
                    <button
                      type="button"
                      onMouseDown={(
                        event
                      ) =>
                        event.preventDefault()
                      }
                      onClick={() =>
                        applySearch(
                          draftSearch
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-50 px-4 py-2.5 text-xs font-extrabold text-green-700 transition hover:bg-green-100 sm:text-sm"
                    >
                      <Search
                        size={15}
                      />
                      Search for “
                      {draftSearch.trim()}
                      ”
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-7 text-center sm:p-8">
                  <div className="text-4xl">
                    🔍
                  </div>

                  <h3 className="mt-3 font-bold">
                    No direct suggestions
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Submit the search to
                    view matching products.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      applySearch(
                        draftSearch
                      )
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-xs font-extrabold text-white sm:text-sm"
                  >
                    <Search
                      size={15}
                    />
                    Search anyway
                  </button>
                </div>
              )
            ) : (
              <div className="p-4 sm:p-5">
                {recentSearches.length >
                  0 && (
                  <div className="mb-5 sm:mb-6">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold sm:text-base">
                        <Clock
                          size={17}
                        />
                        Recent Searches
                      </div>

                      <button
                        type="button"
                        onClick={
                          clearRecentSearches
                        }
                        className="text-xs font-semibold text-green-700 sm:text-sm"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map(
                        (item) => (
                          <button
                            key={
                              item
                            }
                            type="button"
                            onClick={() =>
                              applySearch(
                                item
                              )
                            }
                            className="rounded-full bg-gray-100 px-3 py-2 text-xs transition hover:bg-green-50 sm:px-4 sm:text-sm"
                          >
                            {item}
                          </button>
                        )
                      )}
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
                  {trendingSearches.map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          applySearch(
                            item
                          )
                        }
                        className="rounded-full bg-green-50 px-3 py-2 text-xs font-medium text-green-700 transition hover:bg-green-100 sm:px-4 sm:text-sm"
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChevronIcon() {
  return (
    <ArrowRight
      size={16}
      className="shrink-0 text-gray-300"
    />
  );
}