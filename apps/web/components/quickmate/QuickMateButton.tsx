"use client";

import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
} from "motion/react";
import {
  Sparkles,
  X,
} from "lucide-react";

import { useQuickMateStore } from "@/store/quickMateStore";

const hiddenRoutes = [
  "/checkout",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/admin",
];

export default function QuickMateButton() {
  const pathname =
    usePathname();

  const open =
    useQuickMateStore(
      (state) =>
        state.open
    );

  const toggleQuickMate =
    useQuickMateStore(
      (state) =>
        state.toggleQuickMate
    );

  const shouldHide =
    hiddenRoutes.some(
      (route) =>
        pathname === route ||
        pathname.startsWith(
          `${route}/`
        )
    ) ||
    pathname.startsWith(
      "/order-success"
    );

  if (shouldHide) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.button
        key="quickmate-floating-button"
        type="button"
        onClick={
          toggleQuickMate
        }
        aria-label={
          open
            ? "Close QuickMate"
            : "Open QuickMate"
        }
        aria-expanded={open}
        initial={{
          opacity: 0,
          scale: 0.8,
          y: 18,
        }}
        animate={{
          opacity: 1,
          scale: open
            ? 1
            : [1, 1.06, 1],
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.8,
          y: 18,
        }}
        transition={
          open
            ? {
                duration: 0.2,
              }
            : {
                opacity: {
                  duration: 0.25,
                },
                y: {
                  duration: 0.25,
                },
                scale: {
                  duration: 2.5,
                  repeat:
                    Infinity,
                  ease:
                    "easeInOut",
                },
              }
        }
        whileTap={{
          scale: 0.92,
        }}
        className="fixed bottom-[112px] right-4 z-[58] flex h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-[0_12px_32px_rgba(22,163,74,0.4)] md:bottom-7 md:right-7"
        style={{
          marginBottom:
            "env(safe-area-inset-bottom)",
        }}
      >
        <motion.span
          animate={{
            rotate: open
              ? 90
              : [
                  0,
                  -8,
                  8,
                  0,
                ],
          }}
          transition={{
            duration: open
              ? 0.2
              : 1.8,
            repeat: open
              ? 0
              : Infinity,
            repeatDelay:
              open
                ? 0
                : 1.6,
          }}
          className="flex h-full w-full items-center justify-center"
        >
          {open ? (
            <X size={22} />
          ) : (
            <Sparkles
              size={23}
            />
          )}
        </motion.span>

        {!open && (
          <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-yellow-400 shadow-sm" />
        )}
      </motion.button>
    </AnimatePresence>
  );
}