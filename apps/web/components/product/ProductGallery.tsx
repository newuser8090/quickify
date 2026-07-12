"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import ProductImage from "./ProductImage";
import { Product } from "@/types/product";

type Props = {
  product: Product;
};

export default function ProductGallery({
  product,
}: Props) {
  const gallery = useMemo<string[]>(() => {
    const extraImages =
      product.images
        ?.map(
          (image) =>
            image.image_url
        )
        .filter(Boolean) ?? [];

    return [
      product.image,
      ...extraImages,
    ].filter(Boolean);
  }, [
    product.image,
    product.images,
  ]);

  const [
    selectedImage,
    setSelectedImage,
  ] = useState(
    gallery[0] ?? product.image
  );

  const [zooming, setZooming] =
    useState(false);

  const [position, setPosition] =
    useState({
      x: 50,
      y: 50,
    });

  useEffect(() => {
    setSelectedImage(
      gallery[0] ??
        product.image
    );
  }, [
    gallery,
    product.image,
  ]);

  function handleMouseMove(
    event: React.MouseEvent<HTMLDivElement>
  ) {
    if (
      window.matchMedia(
        "(pointer: coarse)"
      ).matches
    ) {
      return;
    }

    const rectangle =
      event.currentTarget.getBoundingClientRect();

    setPosition({
      x:
        ((event.clientX -
          rectangle.left) /
          rectangle.width) *
        100,
      y:
        ((event.clientY -
          rectangle.top) /
          rectangle.height) *
        100,
    });
  }

  return (
    <div className="min-w-0">
      <div
        onMouseEnter={() => {
          if (
            window.matchMedia(
              "(pointer: fine)"
            ).matches
          ) {
            setZooming(true);
          }
        }}
        onMouseLeave={() => {
          setZooming(false);

          setPosition({
            x: 50,
            y: 50,
          });
        }}
        onMouseMove={
          handleMouseMove
        }
        className="group relative flex h-[340px] items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 sm:h-[600px] sm:cursor-zoom-in sm:rounded-3xl sm:p-4 lg:h-[680px]"
      >
        {product.discount > 0 && (
          <span className="absolute left-3 top-3 z-20 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm sm:left-5 sm:top-5 sm:px-4 sm:py-2 sm:text-sm">
            {product.discount}% OFF
          </span>
        )}

        <div
          key={selectedImage}
          className="relative h-full w-full animate-in fade-in duration-200"
          style={{
            transform: zooming
              ? "scale(1.65)"
              : "scale(1)",
            transformOrigin: `${position.x}% ${position.y}%`,
            transition:
              "transform 180ms ease-out",
          }}
        >
          <ProductImage
            src={selectedImage}
            alt={product.name}
            priority
          />
        </div>

        <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 rounded-full border border-gray-100 bg-white/95 px-4 py-2 text-sm font-semibold text-gray-700 opacity-0 shadow-md transition group-hover:opacity-100 sm:block">
          Hover to zoom
        </div>
      </div>

      {gallery.length > 1 && (
        <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1 sm:mt-5 sm:gap-3 sm:pb-2">
          {gallery.map(
            (image, index) => {
              const active =
                selectedImage === image;

              return (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() =>
                    setSelectedImage(
                      image
                    )
                  }
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white p-0.5 transition sm:h-28 sm:w-28 sm:rounded-2xl sm:p-1 ${
                    active
                      ? "border-green-600 shadow-md"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                  aria-label={`View image ${
                    index + 1
                  } of ${product.name}`}
                >
                  <ProductImage
                    src={image}
                    alt={`${product.name} image ${
                      index + 1
                    }`}
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

