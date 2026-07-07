"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export default function ProductImage({
  src,
  alt,
  className,
  priority = false,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-green-50 text-7xl">
        📦
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className="absolute inset-0 animate-pulse rounded-2xl bg-green-100" />
      )}

      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width:768px) 100vw,
               (max-width:1200px) 50vw,
               25vw"
        className={`object-contain p-5 transition duration-300 group-hover:scale-105 ${
          loading ? "opacity-0" : "opacity-100"
        } ${className ?? ""}`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </>
  );
}