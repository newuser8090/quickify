"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import AddressCard from "./AddressCard";
import AddressDialog from "./AddressDialog";

import {
  Address,
  addAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "@/services/addressService";
import { useAddressStore } from "@/store/addressStore";
import { useAuthStore } from "@/store/authStore";

export default function AddressList() {
  const searchParams = useSearchParams();
  const isCheckoutMode = searchParams.get("mode") === "checkout";

  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const addresses = useAddressStore((state) => state.addresses);
  const setAddresses = useAddressStore((state) => state.setAddresses);
  const setSelectedAddress = useAddressStore(
    (state) => state.setSelectedAddress
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const refreshAddresses = useCallback(async () => {
    if (!user) return;

    const data = await getAddresses(user.id);
    setAddresses(data);

    const defaultAddress = data.find((address) => address.is_default) ?? null;

    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
    }
  }, [user, setAddresses, setSelectedAddress]);

  useEffect(() => {
    refreshAddresses();
  }, [refreshAddresses]);

  async function handleAdd(values: Omit<Address, "id" | "user_id">) {
    if (!user) return;

    await addAddress({
      ...values,
      user_id: user.id,
    });

    setDialogOpen(false);
    await refreshAddresses();
  }

  async function handleEdit(values: Omit<Address, "id" | "user_id">) {
    if (!editingAddress) return;

    await updateAddress(editingAddress.id, values);

    setEditingAddress(null);
    setDialogOpen(false);

    await refreshAddresses();
  }

  async function handleDelete(id: number) {
    await deleteAddress(id);
    await refreshAddresses();
  }

  async function handleSetDefault(address: Address) {
    if (!user) return;

    await Promise.all(
      addresses.map((item) =>
        updateAddress(item.id, {
          is_default: item.id === address.id,
        })
      )
    );

    await refreshAddresses();
  }

  function handleDeliverHere(address: Address) {
    setSelectedAddress(address);
    router.push("/checkout");
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Saved Addresses</h1>

          <p className="mt-2 text-gray-500">
            Manage your delivery locations.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingAddress(null);
            setDialogOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
        >
          <Plus size={18} />
          Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-3xl border border-dashed p-12 text-center">
          <h3 className="text-2xl font-bold">No saved addresses</h3>

          <p className="mt-2 text-gray-500">
            Add your first delivery address.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {addresses.map((address) => (
            <div key={address.id} className="space-y-3">
              <AddressCard
                address={address}
                onEdit={(address) => {
                  setEditingAddress(address);
                  setDialogOpen(true);
                }}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
              />

              {isCheckoutMode && (
                <button
                  onClick={() => handleDeliverHere(address)}
                  className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
                >
                  Deliver Here
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <AddressDialog
        open={dialogOpen}
        title={editingAddress ? "Edit Address" : "Add Address"}
        initialData={editingAddress}
        onClose={() => {
          setEditingAddress(null);
          setDialogOpen(false);
        }}
        onSubmit={editingAddress ? handleEdit : handleAdd}
      />
    </>
  );
}