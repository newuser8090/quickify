import { create } from "zustand";
import { Address } from "@/services/addressService";

type AddressStore = {
  addresses: Address[];
  selectedAddress: Address | null;

  setAddresses: (addresses: Address[]) => void;
  setSelectedAddress: (address: Address | null) => void;
  clearAddresses: () => void;
};

export const useAddressStore = create<AddressStore>((set) => ({
  addresses: [],
  selectedAddress: null,

  setAddresses: (addresses) =>
    set({
      addresses,
    }),

  setSelectedAddress: (address) =>
    set({
      selectedAddress: address,
    }),

  clearAddresses: () =>
    set({
      addresses: [],
      selectedAddress: null,
    }),
}));