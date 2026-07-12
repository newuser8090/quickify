"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AnimatePresence,
  motion,
} from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
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
    queryKey: ["active-banners"],
    queryFn: getActiveBanners,
  });

  const banner = banners[current];

  useEffect(() => {
    if (banners.length === 0) {
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

    return () =>
      window.clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    if (current >= banners.length) {
      setCurrent(0);
    }
  }, [current, banners.length]);

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
      <section className="mx-auto mt-5 max-w-7xl px-3 sm:mt-8 sm:px-6">
        <div className="h-40 animate-pulse rounded-2xl bg-gray-200 sm:h-80 sm:rounded-3xl" />
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
    banner.floating_icons ?? [];

  function next() {
    setCurrent(
      (previous) =>
        (previous + 1) %
        banners.length
    );
  }

  function previous() {
    setCurrent((previousIndex) =>
      previousIndex === 0
        ? banners.length - 1
        : previousIndex - 1
    );
  }

  function handleClick() {
  if (!banner) return;

  const activeBanner = banner;

  incrementBannerClicks(
    activeBanner.id
  ).catch(() => {
    // Analytics should not block navigation.
  });

  onBannerClick(
    activeBanner.category
  );
}

  return (
    <section className="mx-auto mt-5 max-w-7xl px-3 sm:mt-8 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={banner.id}
            initial={{
              opacity: 0,
              x: 60,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: -60,
            }}
            transition={{
              duration: 0.4,
            }}
            className={`relative overflow-hidden ${
              banner.type ===
              "designed"
                ? `bg-gradient-to-r ${banner.background_class}`
                : "bg-gray-100"
            } p-3 sm:p-6 md:p-14`}
          >
            {banner.type ===
              "image" &&
            banner.image_url ? (
              <div className="relative min-h-[150px] overflow-hidden rounded-xl sm:min-h-[220px] sm:rounded-2xl md:min-h-[260px]">
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

                <div className="absolute inset-0 bg-black/20" />

                <div className="absolute bottom-3 left-3 z-10 sm:bottom-5 sm:left-5 md:bottom-6 md:left-6">
                  <button
                    type="button"
                    onClick={
                      handleClick
                    }
                    className={`rounded-lg px-3 py-2 text-xs font-bold shadow-sm transition hover:scale-105 sm:rounded-xl sm:px-5 sm:py-3 sm:text-sm md:px-6 md:text-base ${banner.button_color_class}`}
                  >
                    {
                      banner.button_text
                    }
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="pointer-events-none absolute inset-0 opacity-20">
                  {icons
                    .slice(0, 5)
                    .map(
                      (
                        icon,
                        index
                      ) => (
                        <span
                          key={`${icon}-${index}`}
                          className="absolute text-3xl sm:text-4xl md:text-6xl"
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
                                42
                            }%`,
                          }}
                        >
                          {icon}
                        </span>
                      )
                    )}
                </div>

                <div className="relative z-10 flex min-h-[150px] items-center justify-between gap-4 px-2 py-3 sm:min-h-0 sm:flex-col sm:items-start sm:gap-10 sm:px-0 sm:py-0 md:flex-row md:items-center">
                  <div className="max-w-xl text-white">
                    <h2 className="text-xl font-extrabold leading-tight sm:text-3xl md:text-5xl">
                      {
                        banner.title
                      }
                    </h2>

                    {banner.subtitle && (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 opacity-95 sm:mt-4 sm:text-base md:mt-5 md:text-lg">
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
                      className={`mt-4 rounded-lg px-3 py-2 text-xs font-bold shadow-sm transition hover:scale-105 sm:mt-7 sm:rounded-xl sm:px-6 sm:py-3 sm:text-base ${banner.button_color_class}`}
                    >
                      {
                        banner.button_text
                      }
                    </button>
                  </div>

                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur sm:hidden md:flex md:h-44 md:w-44">
                    <span className="text-4xl md:text-7xl">
                      {banner.main_icon ??
                        icons[0] ??
                        "🛒"}
                    </span>
                  </div>
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
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-lg transition hover:scale-110 sm:left-4 sm:p-3"
              aria-label="Previous banner"
            >
              <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
            </button>

            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-lg transition hover:scale-110 sm:right-4 sm:p-3"
              aria-label="Next banner"
            >
              <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
            </button>

            <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 sm:bottom-5 sm:gap-2">
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
                    className={`h-1.5 rounded-full transition-all sm:h-3 ${
                      current ===
                      index
                        ? "w-6 bg-white sm:w-10"
                        : "w-1.5 bg-white/60 sm:w-3"
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
