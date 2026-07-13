"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useQuery,
} from "@tanstack/react-query";
import {
  AnimatePresence,
  motion,
} from "motion/react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import {
  getActiveBanners,
  incrementBannerClicks,
  incrementBannerViews,
} from "@/services/bannerService";

type Props = {
  onBannerClick: (
    category: string
  ) => void;
};

export default function BannerCarousel({
  onBannerClick,
}: Props) {
  const [current, setCurrent] =
    useState(0);

  const viewedBannerIds =
    useRef<Set<number>>(
      new Set()
    );

  const {
    data: banners = [],
    isLoading,
  } = useQuery({
    queryKey: [
      "active-banners",
    ],
    queryFn:
      getActiveBanners,
  });

  const banner =
    banners[current];

  useEffect(() => {
    if (
      banners.length === 0
    ) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setCurrent(
          (previous) =>
            (previous + 1) %
            banners.length
        );
      }, 5000);

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [banners.length]);

  useEffect(() => {
    if (
      current >=
      banners.length
    ) {
      setCurrent(0);
    }
  }, [
    current,
    banners.length,
  ]);

  useEffect(() => {
    if (!banner?.id) {
      return;
    }

    if (
      viewedBannerIds.current.has(
        banner.id
      )
    ) {
      return;
    }

    viewedBannerIds.current.add(
      banner.id
    );

    incrementBannerViews(
      banner.id
    ).catch(() => {
      viewedBannerIds.current.delete(
        banner.id
      );
    });
  }, [banner?.id]);

  if (isLoading) {
    return (
      <section className="mx-auto mt-4 max-w-7xl px-3 sm:mt-7 sm:px-6">
        <div className="h-44 animate-pulse rounded-3xl bg-gray-200 sm:h-72" />
      </section>
    );
  }

  if (
    banners.length === 0 ||
    !banner
  ) {
    return null;
  }

  const icons =
    banner.floating_icons ??
    [];

  function next() {
    setCurrent(
      (previous) =>
        (previous + 1) %
        banners.length
    );
  }

  function previous() {
    setCurrent(
      (previousIndex) =>
        previousIndex === 0
          ? banners.length - 1
          : previousIndex - 1
    );
  }

  function handleClick() {
  if (!banner) {
    return;
  }

  incrementBannerClicks(
    banner.id
  ).catch(() => {
    // Analytics should never block navigation.
  });

  onBannerClick(
    banner.category
  );
}

  return (
    <section className="mx-auto mt-4 max-w-7xl px-3 sm:mt-7 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/50 shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={banner.id}
            initial={{
              opacity: 0,
              x: 48,
              scale: 0.99,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              x: -48,
              scale: 0.99,
            }}
            transition={{
              duration: 0.42,
              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
            }}
            className={`relative min-h-[180px] overflow-hidden sm:min-h-[260px] ${
              banner.type ===
              "designed"
                ? `bg-gradient-to-br ${banner.background_class}`
                : "bg-gray-100"
            }`}
          >
            {banner.type ===
              "image" &&
            banner.image_url ? (
              <>
                <picture>
                  {banner.mobile_image_url && (
                    <source
                      media="(max-width: 768px)"
                      srcSet={
                        banner.mobile_image_url
                      }
                    />
                  )}

                  <Image
                    src={
                      banner.image_url
                    }
                    alt={
                      banner.title ??
                      "Quickify banner"
                    }
                    fill
                    className="object-cover"
                    priority
                  />
                </picture>

                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />

                <div className="absolute inset-0 flex items-end p-4 sm:items-center sm:p-8 md:p-10">
                  <div className="max-w-xl text-white">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-xl">
                      <Sparkles size={13} />
                      Special offer
                    </div>

                    {banner.title && (
                      <h2 className="mt-3 max-w-lg text-2xl font-black leading-tight sm:text-4xl">
                        {banner.title}
                      </h2>
                    )}

                    {banner.subtitle && (
                      <p className="mt-2 line-clamp-2 max-w-md text-xs leading-5 text-white/90 sm:mt-3 sm:text-base sm:leading-7">
                        {banner.subtitle}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={
                        handleClick
                      }
                      className={`mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold shadow-lg transition hover:-translate-y-0.5 sm:mt-5 sm:px-6 sm:py-3 sm:text-sm ${banner.button_color_class}`}
                    >
                      {
                        banner.button_text
                      }
                      <ArrowRight
                        size={16}
                      />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/15 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-black/10 blur-3xl" />

                <div className="pointer-events-none absolute inset-0 opacity-15">
                  {icons
                    .slice(0, 5)
                    .map(
                      (
                        icon,
                        index
                      ) => (
                        <span
                          key={`${icon}-${index}`}
                          className="absolute text-4xl sm:text-6xl"
                          style={{
                            left: `${
                              8 +
                              index *
                                18
                            }%`,
                            top: `${
                              12 +
                              (index %
                                2) *
                                40
                            }%`,
                          }}
                        >
                          {icon}
                        </span>
                      )
                    )}
                </div>

                <div className="relative z-10 flex min-h-[180px] items-center justify-between gap-4 px-5 py-6 sm:min-h-[260px] sm:px-8 sm:py-10 md:px-12">
                  <div className="max-w-xl text-white">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-xl">
                      <Sparkles size={13} />
                      Quickify picks
                    </div>

                    <h2 className="mt-3 text-2xl font-black leading-tight sm:text-4xl md:text-5xl">
                      {
                        banner.title
                      }
                    </h2>

                    {banner.subtitle && (
                      <p className="mt-2 line-clamp-2 max-w-lg text-xs leading-5 text-white/90 sm:mt-4 sm:text-base sm:leading-7">
                        {
                          banner.subtitle
                        }
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={
                        handleClick
                      }
                      className={`mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold shadow-lg transition hover:-translate-y-0.5 sm:mt-6 sm:px-6 sm:py-3 sm:text-sm ${banner.button_color_class}`}
                    >
                      {
                        banner.button_text
                      }
                      <ArrowRight
                        size={16}
                      />
                    </button>
                  </div>

                  <motion.div
                    animate={{
                      y: [
                        0,
                        -7,
                        0,
                      ],
                    }}
                    transition={{
                      duration: 4,
                      repeat:
                        Infinity,
                      ease:
                        "easeInOut",
                    }}
                    className="hidden h-36 w-36 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/15 text-6xl shadow-2xl backdrop-blur-2xl sm:flex md:h-44 md:w-44 md:text-7xl"
                  >
                    {banner.main_icon ??
                      icons[0] ??
                      "🛒"}
                  </motion.div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={previous}
              className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/20 text-white shadow-lg backdrop-blur-xl transition hover:bg-white/30 sm:left-4 sm:h-11 sm:w-11"
              aria-label="Previous banner"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/20 text-white shadow-lg backdrop-blur-xl transition hover:bg-white/30 sm:right-4 sm:h-11 sm:w-11"
              aria-label="Next banner"
            >
              <ChevronRight size={20} />
            </button>

            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/20 bg-black/15 px-3 py-2 backdrop-blur-xl sm:bottom-5">
              {banners.map(
                (
                  item,
                  index
                ) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setCurrent(
                        index
                      )
                    }
                    className={`h-1.5 rounded-full transition-all ${
                      current ===
                      index
                        ? "w-6 bg-white"
                        : "w-1.5 bg-white/55"
                    }`}
                    aria-label={`Open banner ${
                      index + 1
                    }`}
                  />
                )
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}