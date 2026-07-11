"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  getActiveBanners,
  incrementBannerClicks,
  incrementBannerViews,
} from "@/services/bannerService";

type Props = {
  onBannerClick: (category: string) => void;
};

export default function BannerCarousel({ onBannerClick }: Props) {
  const [current, setCurrent] = useState(0);
  const viewedBannerIds = useRef<Set<number>>(new Set());

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["active-banners"],
    queryFn: getActiveBanners,
  });

  const banner = banners[current];

  useEffect(() => {
    if (banners.length === 0) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    if (current >= banners.length) {
      setCurrent(0);
    }
  }, [current, banners.length]);

  useEffect(() => {
    if (!banner?.id) return;
    if (viewedBannerIds.current.has(banner.id)) return;

    viewedBannerIds.current.add(banner.id);

    incrementBannerViews(banner.id).catch(() => {
      viewedBannerIds.current.delete(banner.id);
    });
  }, [banner?.id]);

  if (isLoading) {
    return (
      <section className="mx-auto mt-8 max-w-7xl px-6">
        <div className="h-80 animate-pulse rounded-3xl bg-gray-200" />
      </section>
    );
  }

  if (banners.length === 0 || !banner) return null;

  const icons = banner.floating_icons ?? [];

  function next() {
    setCurrent((prev) => (prev + 1) % banners.length);
  }

  function previous() {
    setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  }

  function handleClick() {
    if (!banner) return;

    incrementBannerClicks(banner.id).catch(() => {
      // Analytics should not block navigation
    });

    onBannerClick(banner.category);
  }

  return (
    <section className="mx-auto mt-8 max-w-7xl px-6">
      <div className="relative overflow-hidden rounded-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.45 }}
            className={`relative overflow-hidden ${
              banner.type === "designed"
                ? `bg-gradient-to-r ${banner.background_class}`
                : "bg-gray-100"
            } p-6 md:p-14`}
          >
            {banner.type === "image" && banner.image_url ? (
              <div className="relative min-h-[220px] overflow-hidden rounded-2xl md:min-h-[260px]">
                <picture>
                  {banner.mobile_image_url && (
                    <source
                      media="(max-width: 768px)"
                      srcSet={banner.mobile_image_url}
                    />
                  )}

                  <Image
                    src={banner.image_url}
                    alt={banner.title ?? "Quickify banner"}
                    fill
                    className="object-cover"
                    priority
                  />
                </picture>

                <div className="absolute inset-0 bg-black/20" />

                <div className="absolute bottom-5 left-5 z-10 md:bottom-6 md:left-6">
                  <button
                    onClick={handleClick}
                    className={`rounded-xl px-5 py-3 text-sm font-bold transition hover:scale-105 md:px-6 md:text-base ${banner.button_color_class}`}
                  >
                    {banner.button_text}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="pointer-events-none absolute inset-0 opacity-25">
                  {icons.slice(0, 5).map((icon, index) => (
                    <span
                      key={`${icon}-${index}`}
                      className="absolute text-4xl md:text-6xl"
                      style={{
                        left: `${8 + index * 18}%`,
                        top: `${12 + (index % 2) * 42}%`,
                      }}
                    >
                      {icon}
                    </span>
                  ))}
                </div>

                <div className="relative z-10 flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
                  <div className="max-w-xl text-white">
                    <h2 className="text-3xl font-extrabold md:text-5xl">
                      {banner.title}
                    </h2>

                    <p className="mt-4 text-base opacity-95 md:mt-5 md:text-lg">
                      {banner.subtitle}
                    </p>

                    <button
                      onClick={handleClick}
                      className={`mt-7 rounded-xl px-6 py-3 font-bold transition hover:scale-105 ${banner.button_color_class}`}
                    >
                      {banner.button_text}
                    </button>
                  </div>

                  <div className="relative hidden h-44 w-44 shrink-0 rounded-full bg-white/20 backdrop-blur md:flex md:items-center md:justify-center">
                    <span className="text-7xl">
                      {banner.main_icon ?? icons[0] ?? "🛒"}
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
              onClick={previous}
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg transition hover:scale-110"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={next}
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg transition hover:scale-110"
            >
              <ChevronRight size={24} />
            </button>

            <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {banners.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setCurrent(index)}
                  className={`h-3 rounded-full transition-all ${
                    current === index ? "w-10 bg-white" : "w-3 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}