import { create } from "zustand";
import { Address } from "@/services/addressService";

type AddressStore = {
  addresses: Address[];

  setAddresses: (addresses: Address[]) => void;

  selectedAddress: Address | null;

  setSelectedAddress: (address: Address) => void;
};

export const useAddressStore =
  create<AddressStore>((set) => ({
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
  }));