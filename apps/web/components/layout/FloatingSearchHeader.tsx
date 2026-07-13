"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import SearchBar from "./SearchBar";
import UserButton from "./UserButton";

type Props = {
  sentinelId: string;
};

export default function FloatingSearchHeader({
  sentinelId,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById(sentinelId);

    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }

        const passedNavbar =
          !entry.isIntersecting && entry.boundingClientRect.top < 0;

        setVisible(passedNavbar);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [sentinelId]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="floating-search-header"
          initial={{ y: -72, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -56, opacity: 0, scale: 0.96 }}
          transition={{
            type: "spring",
            stiffness: 360,
            damping: 31,
            mass: 0.85,
          }}
          className="pointer-events-none fixed inset-x-0 top-0 z-[85] px-3 pt-[max(10px,env(safe-area-inset-top))] sm:px-6"
        >
          <div className="pointer-events-auto mx-auto flex w-full max-w-3xl items-center gap-2">
            <motion.div
              layout
              className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur-[30px] shadow-[0_16px_40px_rgba(15,23,42,0.18)] ring-1 ring-white/10"
            >
              <SearchBar variant="floating" />
            </motion.div>

            <motion.div
              layout
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-[30px] shadow-[0_16px_40px_rgba(15,23,42,0.18)] ring-1 ring-white/10 sm:h-14 sm:w-14"
            >
              <UserButton compact />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}