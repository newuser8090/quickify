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
  type PanInfo,
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

const AUTO_PLAY_INTERVAL = 5000;
const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 500;

const slideVariants = {
  enter: (
    direction: number
  ) => ({
    x:
      direction > 0
        ? 100
        : -100,
    opacity: 0,
  }),

  center: {
    x: 0,
    opacity: 1,
  },

  exit: (
    direction: number
  ) => ({
    x:
      direction > 0
        ? -100
        : 100,
    opacity: 0,
  }),
};

export default function BannerCarousel({
  onBannerClick,
}: Props) {
  const [current, setCurrent] =
    useState(0);

  const [direction, setDirection] =
    useState(1);

  const [dragging, setDragging] =
    useState(false);

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
      banners.length <= 1
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          goNext();
        },
        AUTO_PLAY_INTERVAL
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    banners.length,
    current,
  ]);

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

  function goNext() {
    if (
      banners.length <= 1
    ) {
      return;
    }

    setDirection(1);

    setCurrent(
      (previousIndex) =>
        (previousIndex + 1) %
        banners.length
    );
  }

  function goPrevious() {
    if (
      banners.length <= 1
    ) {
      return;
    }

    setDirection(-1);

    setCurrent(
      (previousIndex) =>
        previousIndex === 0
          ? banners.length - 1
          : previousIndex - 1
    );
  }

  function goToBanner(
    index: number
  ) {
    if (
      index === current
    ) {
      return;
    }

    setDirection(
      index > current
        ? 1
        : -1
    );

    setCurrent(index);
  }

  function handleBannerClick() {
    if (
      dragging ||
      !banner
    ) {
      return;
    }

    incrementBannerClicks(
      banner.id
    ).catch(() => {
      // Analytics must not block navigation.
    });

    onBannerClick(
      banner.category
    );
  }

  function handleDragEnd(
    _event:
      | MouseEvent
      | TouchEvent
      | PointerEvent,
    info: PanInfo
  ) {
    const swipedLeft =
      info.offset.x <=
        -SWIPE_DISTANCE ||
      info.velocity.x <=
        -SWIPE_VELOCITY;

    const swipedRight =
      info.offset.x >=
        SWIPE_DISTANCE ||
      info.velocity.x >=
        SWIPE_VELOCITY;

    if (swipedLeft) {
      goNext();
    } else if (
      swipedRight
    ) {
      goPrevious();
    }

    window.setTimeout(
      () => {
        setDragging(false);
      },
      80
    );
  }

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
    banner.floating_icons ??
    [];

  return (
    <section className="mx-auto mt-5 max-w-7xl px-3 sm:mt-8 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
        <AnimatePresence
          initial={false}
          custom={direction}
          mode="popLayout"
        >
          <motion.div
            key={banner.id}
            custom={direction}
            variants={
              slideVariants
            }
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: {
                type: "spring",
                stiffness: 300,
                damping: 30,
              },
              opacity: {
                duration: 0.22,
              },
            }}
            drag={
              banners.length > 1
                ? "x"
                : false
            }
            dragConstraints={{
              left: 0,
              right: 0,
            }}
            dragElastic={0.16}
            onDragStart={() => {
              setDragging(true);
            }}
            onDragEnd={
              handleDragEnd
            }
            className={`relative touch-pan-y overflow-hidden ${
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
                    priority
                    draggable={
                      false
                    }
                    className="pointer-events-none select-none object-cover"
                  />
                </picture>

                <div className="pointer-events-none absolute inset-0 bg-black/20" />

                <div className="absolute bottom-3 left-3 z-10 sm:bottom-5 sm:left-5 md:bottom-6 md:left-6">
                  <button
                    type="button"
                    onClick={
                      handleBannerClick
                    }
                    onPointerDown={(
                      event
                    ) => {
                      event.stopPropagation();
                    }}
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
                        handleBannerClick
                      }
                      onPointerDown={(
                        event
                      ) => {
                        event.stopPropagation();
                      }}
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

        {banners.length >
          1 && (
          <>
            <button
              type="button"
              onClick={
                goPrevious
              }
              className="absolute left-2 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/85 p-1.5 text-gray-900 shadow-lg backdrop-blur-xl transition hover:scale-110 hover:bg-white active:scale-95 sm:left-4 sm:p-3"
              aria-label="Previous banner"
            >
              <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
            </button>

            <button
              type="button"
              onClick={
                goNext
              }
              className="absolute right-2 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/85 p-1.5 text-gray-900 shadow-lg backdrop-blur-xl transition hover:scale-110 hover:bg-white active:scale-95 sm:right-4 sm:p-3"
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
                    key={
                      item.id
                    }
                    type="button"
                    onClick={() =>
                      goToBanner(
                        index
                      )
                    }
                    className={`h-1.5 rounded-full transition-all sm:h-3 ${
                      current ===
                      index
                        ? "w-6 bg-white sm:w-10"
                        : "w-1.5 bg-white/60 hover:bg-white/80 sm:w-3"
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

      {banners.length >
        1 && (
        <p className="mt-2 text-center text-[9px] font-medium text-gray-400 sm:hidden">
          Swipe left or right to explore offers
        </p>
      )}
    </section>
  );
}