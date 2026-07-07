"use client";

import { CheckCircle2, Edit, Home, Trash2 } from "lucide-react";

import { Address } from "@/services/addressService";

type Props = {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: number) => void;
  onSetDefault: (address: Address) => void;
};

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: Props) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-green-50 p-3 text-green-600">
            <Home size={22} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">{address.label}</h3>

              {address.is_default && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  Default
                </span>
              )}
            </div>

            <p className="mt-2 font-semibold">{address.full_name}</p>
            <p className="mt-1 text-gray-600">{address.phone}</p>

            <p className="mt-3 leading-7 text-gray-600">
              {address.address_line}
              {address.landmark ? `, ${address.landmark}` : ""}
              <br />
              {address.city}, {address.state} - {address.pincode}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {!address.is_default && (
          <button
            onClick={() => onSetDefault(address)}
            className="flex items-center gap-2 rounded-xl border border-green-600 px-4 py-2 font-semibold text-green-700 hover:bg-green-50"
          >
            <CheckCircle2 size={17} />
            Set Default
          </button>
        )}

        <button
          onClick={() => onEdit(address)}
          className="flex items-center gap-2 rounded-xl border px-4 py-2 font-semibold hover:bg-gray-50"
        >
          <Edit size={17} />
          Edit
        </button>

        <button
          onClick={() => onDelete(address.id)}
          className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 font-semibold text-red-600 hover:bg-red-50"
        >
          <Trash2 size={17} />
          Delete
        </button>
      </div>
    </div>
  );
}