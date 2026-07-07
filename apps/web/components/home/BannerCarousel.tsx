"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const banners = [
  {
    id: 1,
    title: "Fresh Fruits Festival 🍎",
    subtitle: "Up to 50% OFF on seasonal fruits",
    button: "Shop Fruits",
    bg: "from-green-500 via-emerald-500 to-lime-400",
    image: "🍉🍓🥭",
  },
  {
    id: 2,
    title: "Daily Essentials 🥛",
    subtitle: "Milk, Bread & Eggs delivered in minutes",
    button: "Explore",
    bg: "from-blue-500 via-cyan-500 to-sky-400",
    image: "🥛🍞🥚",
  },
  {
    id: 3,
    title: "Snacks & Beverages 🍕",
    subtitle: "Weekend cravings? We've got you covered.",
    button: "Order Now",
    bg: "from-orange-500 via-red-500 to-pink-500",
    image: "🍕🥤🍟",
  },
  {
    id: 4,
    title: "Household Savings 🧺",
    subtitle: "Cleaning & home essentials at amazing prices",
    button: "Shop Now",
    bg: "from-violet-600 via-purple-600 to-fuchsia-500",
    image: "🧴🧻🧼",
  },
];

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  function next() {
    setCurrent((prev) => (prev + 1) % banners.length);
  }

  function previous() {
    setCurrent((prev) =>
      prev === 0 ? banners.length - 1 : prev - 1
    );
  }

  // ✅ TypeScript-safe fallback
  const banner = banners[current] ?? banners[0]!;

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
            className={`bg-gradient-to-r ${banner.bg} p-10 md:p-14`}
          >
            <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
              <div className="max-w-xl text-white">
                <h2 className="text-4xl font-extrabold md:text-5xl">
                  {banner.title}
                </h2>

                <p className="mt-5 text-lg opacity-95">
                  {banner.subtitle}
                </p>

                <button className="mt-8 rounded-xl bg-white px-6 py-3 font-bold text-black transition hover:scale-105">
                  {banner.button}
                </button>
              </div>

              <div className="select-none text-7xl md:text-9xl">
                {banner.image}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={previous}
          className="absolute left-5 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg transition hover:scale-110"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={next}
          className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg transition hover:scale-110"
        >
          <ChevronRight size={24} />
        </button>

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-3 rounded-full transition-all ${
                current === index
                  ? "w-10 bg-white"
                  : "w-3 bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}