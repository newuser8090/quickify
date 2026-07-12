"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "motion/react";

import type { Address } from "@/services/addressService";
import AddressForm from "./AddressForm";

type AddressFormValues = Omit<
  Address,
  "id" | "user_id"
>;

type Props = {
  open: boolean;
  title: string;
  initialData?: Address | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (
    values: AddressFormValues
  ) => void;
};

export default function AddressDialog({
  open,
  title,
  initialData,
  saving = false,
  onClose,
  onSubmit,
}: Props) {
  useEffect(() => {
    if (!open) return;

    const scrollY =
      window.scrollY;

    const previousPosition =
      document.body.style.position;

    const previousTop =
      document.body.style.top;

    const previousWidth =
      document.body.style.width;

    document.body.style.position =
      "fixed";

    document.body.style.top =
      `-${scrollY}px`;

    document.body.style.width =
      "100%";

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape" &&
        !saving
      ) {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.position =
        previousPosition;

      document.body.style.top =
        previousTop;

      document.body.style.width =
        previousWidth;

      window.scrollTo({
        top: scrollY,
        behavior: "instant",
      });

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open, onClose, saving]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close address form"
            onClick={() => {
              if (!saving) {
                onClose();
              }
            }}
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[100] cursor-default bg-black/45 backdrop-blur-sm"
          />

          <motion.div
            initial={{
              y: "100%",
            }}
            animate={{
              y: 0,
            }}
            exit={{
              y: "100%",
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 32,
            }}
            className="fixed inset-x-0 bottom-0 z-[110] max-h-[92dvh] overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[94%] sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
          >
            <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-gray-200 sm:hidden" />

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6 sm:py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                  Delivery location
                </p>

                <h2 className="mt-1 text-xl font-extrabold sm:text-2xl">
                  {title}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close address form"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[calc(92dvh-92px)] overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
              <AddressForm
                initialData={
                  initialData
                }
                saving={saving}
                onSubmit={
                  onSubmit
                }
                onCancel={
                  onClose
                }
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}