"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
} from "lucide-react";

import type { Product } from "@/types/product";

type Props = {
  product: Product;
  currentStock: number;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onShare: () => void;
};

const SWIPE_THRESHOLD = 45;

export default function ProductGallery({
  product,
  currentStock,
  isWishlisted,
  onToggleWishlist,
  onShare,
}: Props) {
  const gallery = useMemo<string[]>(() => {
    const extraImages =
      product.images
        ?.map(
          (image) =>
            image.image_url
        )
        .filter(
          (
            image
          ): image is string =>
            Boolean(image)
        ) ?? [];

    return Array.from(
      new Set(
        [
          product.image,
          ...extraImages,
        ].filter(
          (
            image
          ): image is string =>
            Boolean(image)
        )
      )
    );
  }, [
    product.image,
    product.images,
  ]);

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(0);

  const touchStartX =
    useRef<number | null>(
      null
    );

  const touchCurrentX =
    useRef<number | null>(
      null
    );

  const selectedImage =
    gallery[activeIndex] ??
    product.image;

  const inStock =
    currentStock > 0;

  useEffect(() => {
    setActiveIndex(0);
  }, [
    product.id,
    gallery.length,
  ]);

  function previousImage() {
    if (gallery.length <= 1) {
      return;
    }

    setActiveIndex(
      (current) =>
        current === 0
          ? gallery.length - 1
          : current - 1
    );
  }

  function nextImage() {
    if (gallery.length <= 1) {
      return;
    }

    setActiveIndex(
      (current) =>
        (current + 1) %
        gallery.length
    );
  }

  function handleTouchStart(
    event: React.TouchEvent<HTMLDivElement>
  ) {
    touchStartX.current =
      event.touches[0]
        ?.clientX ?? null;

    touchCurrentX.current =
      touchStartX.current;
  }

  function handleTouchMove(
    event: React.TouchEvent<HTMLDivElement>
  ) {
    touchCurrentX.current =
      event.touches[0]
        ?.clientX ?? null;
  }

  function handleTouchEnd() {
    const start =
      touchStartX.current;

    const end =
      touchCurrentX.current;

    touchStartX.current = null;
    touchCurrentX.current =
      null;

    if (
      start === null ||
      end === null
    ) {
      return;
    }

    const distance =
      start - end;

    if (
      Math.abs(distance) <
      SWIPE_THRESHOLD
    ) {
      return;
    }

    if (distance > 0) {
      nextImage();
    } else {
      previousImage();
    }
  }

  return (
    <div className="relative min-w-0 bg-white">
      <div
        onTouchStart={
          handleTouchStart
        }
        onTouchMove={
          handleTouchMove
        }
        onTouchEnd={
          handleTouchEnd
        }
        className="relative h-[500px] touch-pan-y overflow-hidden bg-gray-100 sm:h-[620px] lg:h-[700px]"
      >
        <Image
          key={selectedImage}
          src={selectedImage}
          alt={`${product.name} image ${
            activeIndex + 1
          }`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover"
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-black/35 via-black/10 to-transparent" />

        <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-3 pt-[max(12px,env(safe-area-inset-top))] sm:px-5 sm:pt-5">
          <Link
            href="/"
            aria-label="Back to home"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white shadow-lg backdrop-blur-xl transition hover:bg-white/30 active:scale-95"
          >
            <ArrowLeft
              size={21}
            />
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={
                onToggleWishlist
              }
              aria-label={
                isWishlisted
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
              className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/30 shadow-lg backdrop-blur-xl transition active:scale-95 ${
                isWishlisted
                  ? "bg-red-500/80 text-white"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <Heart
                size={20}
                className={
                  isWishlisted
                    ? "fill-white"
                    : ""
                }
              />
            </button>

            <button
              type="button"
              onClick={onShare}
              aria-label="Share product"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white shadow-lg backdrop-blur-xl transition hover:bg-white/30 active:scale-95"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {gallery.length > 1 && (
          <>
            <button
              type="button"
              onClick={
                previousImage
              }
              aria-label="Previous image"
              className="absolute left-4 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white shadow-lg backdrop-blur-xl transition hover:bg-black/30 sm:flex"
            >
              <ChevronLeft
                size={22}
              />
            </button>

            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-4 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white shadow-lg backdrop-blur-xl transition hover:bg-black/30 sm:flex"
            >
              <ChevronRight
                size={22}
              />
            </button>
          </>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-b from-transparent via-white/45 to-white" />

        <div className="absolute inset-x-0 bottom-12 z-30 flex flex-wrap items-center justify-center gap-1.5 px-3">
          {product.discount >
            0 && (
            <span className="rounded-full bg-red-500 px-3 py-1.5 text-[10px] font-extrabold text-white shadow-lg sm:text-xs">
              {
                product.discount
              }
              % OFF
            </span>
          )}

          {product.bestseller && (
            <span className="rounded-full bg-yellow-400 px-3 py-1.5 text-[10px] font-extrabold text-yellow-950 shadow-lg sm:text-xs">
              BESTSELLER
            </span>
          )}

          <span className="rounded-full bg-green-600 px-3 py-1.5 text-[10px] font-extrabold text-white shadow-lg sm:text-xs">
            {product.category}
          </span>

          <span
            className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold text-white shadow-lg sm:text-xs ${
              inStock
                ? "bg-gray-900"
                : "bg-red-600"
            }`}
          >
            {inStock
              ? `${currentStock} IN STOCK`
              : "OUT OF STOCK"}
          </span>
        </div>

        {gallery.length > 1 && (
          <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/25 px-3 py-2 backdrop-blur">
            {gallery.map(
              (
                image,
                index
              ) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() =>
                    setActiveIndex(
                      index
                    )
                  }
                  aria-label={`View image ${
                    index + 1
                  }`}
                  className={`h-1.5 rounded-full transition-all ${
                    activeIndex ===
                    index
                      ? "w-5 bg-white"
                      : "w-1.5 bg-white/60"
                  }`}
                />
              )
            )}
          </div>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="hide-scrollbar hidden gap-3 overflow-x-auto bg-white px-4 py-4 sm:flex">
          {gallery.map(
            (
              image,
              index
            ) => {
              const active =
                activeIndex ===
                index;

              return (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() =>
                    setActiveIndex(
                      index
                    )
                  }
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-white transition ${
                    active
                      ? "border-green-600 shadow-md"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                  aria-label={`View image ${
                    index + 1
                  } of ${
                    product.name
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} image ${
                      index + 1
                    }`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}
