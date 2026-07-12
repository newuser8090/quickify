"use client";

import {
  CheckCircle2,
  Home,
  MapPin,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";

import type { Address } from "@/services/addressService";

type Props = {
  address: Address;
  checkoutMode?: boolean;
  deleting?: boolean;
  onEdit: (
    address: Address
  ) => void;
  onDelete: (
    id: number
  ) => void;
  onSetDefault: (
    address: Address
  ) => void;
  onDeliverHere?: (
    address: Address
  ) => void;
};

export default function AddressCard({
  address,
  checkoutMode = false,
  deleting = false,
  onEdit,
  onDelete,
  onSetDefault,
  onDeliverHere,
}: Props) {
  const fullAddress = [
    address.address_line,
    address.landmark,
    address.city,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article
      className={`group flex h-full flex-col rounded-3xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:p-5 ${
        address.is_default
          ? "border-green-300 ring-1 ring-green-100"
          : "border-gray-100"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600">
          <Home size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-extrabold text-gray-900">
              {address.label}
            </h2>

            {address.is_default && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold text-green-700">
                <CheckCircle2
                  size={12}
                />
                Default
              </span>
            )}
          </div>

          <p className="mt-2 text-sm font-bold text-gray-800">
            {address.full_name}
          </p>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
            <Phone size={13} />
            {address.phone}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-2xl bg-gray-50 p-3">
        <MapPin
          size={17}
          className="mt-0.5 shrink-0 text-green-600"
        />

        <p className="break-words text-sm leading-6 text-gray-600">
          {fullAddress}
        </p>
      </div>

      <div className="mt-auto pt-4">
        {!address.is_default && (
          <button
            type="button"
            onClick={() =>
              onSetDefault(
                address
              )
            }
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-xs font-bold text-green-700 transition hover:bg-green-100 sm:text-sm"
          >
            <CheckCircle2 size={16} />
            Set as Default
          </button>
        )}

        {checkoutMode &&
          onDeliverHere && (
            <button
              type="button"
              onClick={() =>
                onDeliverHere(
                  address
                )
              }
              className="mb-3 w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700"
            >
              Deliver Here
            </button>
          )}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              onEdit(address)
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-bold text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 sm:text-sm"
          >
            <Pencil size={15} />
            Edit
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={() =>
              onDelete(
                address.id
              )
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-red-100 px-3 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            <Trash2 size={15} />

            {deleting
              ? "Deleting..."
              : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}