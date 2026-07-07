"use client";

import { useEffect, useMemo, useState } from "react";
import ProductImage from "./ProductImage";
import { Product } from "@/types/product";

type Props = {
  product: Product;
};

export default function ProductGallery({ product }: Props) {
  const gallery = useMemo<string[]>(() => {
    const extraImages =
      product.images?.map((img) => img.image_url).filter(Boolean) ?? [];

    return [product.image, ...extraImages].filter(Boolean);
  }, [product]);

  const [selectedImage, setSelectedImage] = useState<string>(product.image);
  const [zooming, setZooming] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    setSelectedImage(gallery[0] ?? product.image);
  }, [gallery, product.image]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPosition({ x, y });
  }

  return (
    <div>
      <div
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={handleMouseMove}
        className="group relative h-[500px] cursor-zoom-in overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 to-emerald-100"
      >
        {product.discount > 0 && (
          <span className="absolute left-5 top-5 z-20 rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white">
            {product.discount}% OFF
          </span>
        )}

        <div
          key={selectedImage}
          className="h-full w-full animate-in fade-in duration-200 transition-transform"
          style={{
            transform: zooming ? "scale(1.85)" : "scale(1)",
            transformOrigin: `${position.x}% ${position.y}%`,
          }}
        >
          <ProductImage src={selectedImage} alt={product.name} priority />
        </div>

        <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-700 opacity-0 shadow transition group-hover:opacity-100">
          Hover to zoom
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-4">
        {gallery.map((image) => (
          <button
            key={image}
            type="button"
            onClick={() => setSelectedImage(image)}
            className={`relative h-24 w-24 overflow-hidden rounded-2xl border-2 bg-green-50 transition ${
              selectedImage === image
                ? "border-green-600 shadow-md"
                : "border-transparent hover:border-green-300"
            }`}
          >
            <ProductImage src={image} alt={product.name} />
          </button>
        ))}
      </div>
    </div>
  );
}