"use client";

import { MapPin } from "lucide-react";
import { useAddressStore } from "@/store/addressStore";

export default function LocationBar() {
  const selectedAddress = useAddressStore((state) => state.selectedAddress);

  return (
    <div className="hidden items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 md:flex">
      <MapPin size={18} className="text-green-600" />

      <div>
        <p className="text-xs text-gray-500">Deliver to</p>

        <p className="max-w-[160px] truncate font-semibold">
          {selectedAddress
            ? selectedAddress.label || selectedAddress.address_line
            : "Select address"}
        </p>
      </div>
    </div>
  );
}