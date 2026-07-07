"use client";

import { X } from "lucide-react";

import { Address } from "@/services/addressService";
import AddressForm from "./AddressForm";

type Props = {
  open: boolean;
  title: string;
  initialData?: Address | null;
  onClose: () => void;
  onSubmit: (
    values: Omit<Address, "id" | "user_id">
  ) => void;
};

export default function AddressDialog({
  open,
  title,
  initialData,
  onClose,
  onSubmit,
}: Props) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      <div className="fixed left-1/2 top-1/2 z-50 w-[95%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-2xl font-bold">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-6">
          <AddressForm
            initialData={initialData}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </>
  );
}