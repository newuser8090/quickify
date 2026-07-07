"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/store/authStore";
import { useAddressStore } from "@/store/addressStore";
import { getAddresses } from "@/services/addressService";

export default function AddressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);

  const setAddresses = useAddressStore(
    (s) => s.setAddresses
  );

  const setSelectedAddress =
    useAddressStore(
      (s) => s.setSelectedAddress
    );

  useEffect(() => {
    async function load() {
      if (!user) {
        setAddresses([]);
        return;
      }

      const addresses = await getAddresses(user.id);

      setAddresses(addresses);

      const defaultAddress =
        addresses.find((a) => a.is_default);

      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    }

    load();
  }, [user, setAddresses, setSelectedAddress]);

  return <>{children}</>;
}