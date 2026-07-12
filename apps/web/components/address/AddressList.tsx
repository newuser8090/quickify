"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Home,
  MapPin,
  Plus,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { toast } from "sonner";

import AddressCard from "./AddressCard";
import AddressDialog from "./AddressDialog";

import {
  type Address,
  addAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "@/services/addressService";
import { useAddressStore } from "@/store/addressStore";
import { useAuthStore } from "@/store/authStore";

type AddressFormValues = Omit<
  Address,
  "id" | "user_id"
>;

export default function AddressList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isCheckoutMode =
    searchParams.get("mode") === "checkout";

  const user = useAuthStore(
    (state) => state.user
  );

  const addresses = useAddressStore(
    (state) => state.addresses
  );

  const setAddresses = useAddressStore(
    (state) => state.setAddresses
  );

  const setSelectedAddress =
    useAddressStore(
      (state) =>
        state.setSelectedAddress
    );

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [
    editingAddress,
    setEditingAddress,
  ] = useState<Address | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const defaultAddress = useMemo(
    () =>
      addresses.find(
        (address) =>
          address.is_default
      ) ?? null,
    [addresses]
  );

  const refreshAddresses =
    useCallback(async () => {
      if (!user) {
        setAddresses([]);
        setLoading(false);
        return;
      }

      try {
        const data =
          await getAddresses(
            user.id
          );

        setAddresses(data);

        const selectedDefault =
          data.find(
            (address) =>
              address.is_default
          ) ?? null;

        if (selectedDefault) {
          setSelectedAddress(
            selectedDefault
          );
        }
      } catch (error) {
        console.error(
          "Failed to load addresses:",
          error
        );

        toast.error(
          "Addresses could not be loaded"
        );
      } finally {
        setLoading(false);
      }
    }, [
      user,
      setAddresses,
      setSelectedAddress,
    ]);

  useEffect(() => {
    void refreshAddresses();
  }, [refreshAddresses]);

  function openAddDialog() {
    setEditingAddress(null);
    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving) return;

    setEditingAddress(null);
    setDialogOpen(false);
  }

  async function handleAdd(
    values: AddressFormValues
  ) {
    if (!user) {
      toast.error(
        "Please login first"
      );
      return;
    }

    try {
      setSaving(true);

      await addAddress({
        ...values,
        user_id: user.id,
      });

      await refreshAddresses();

      setDialogOpen(false);

      toast.success(
        "Address saved successfully"
      );
    } catch (error) {
      console.error(
        "Failed to add address:",
        error
      );

      toast.error(
        "Address could not be saved"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(
    values: AddressFormValues
  ) {
    if (!editingAddress) return;

    try {
      setSaving(true);

      await updateAddress(
        editingAddress.id,
        values
      );

      await refreshAddresses();

      setEditingAddress(null);
      setDialogOpen(false);

      toast.success(
        "Address updated successfully"
      );
    } catch (error) {
      console.error(
        "Failed to update address:",
        error
      );

      toast.error(
        "Address could not be updated"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    id: number
  ) {
    const confirmed =
      window.confirm(
        "Delete this saved address?"
      );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await deleteAddress(id);
      await refreshAddresses();

      toast.success(
        "Address deleted"
      );
    } catch (error) {
      console.error(
        "Failed to delete address:",
        error
      );

      toast.error(
        "Address could not be deleted"
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSetDefault(
    selectedAddress: Address
  ) {
    try {
      await Promise.all(
        addresses.map(
          (address) =>
            updateAddress(
              address.id,
              {
                is_default:
                  address.id ===
                  selectedAddress.id,
              }
            )
        )
      );

      await refreshAddresses();

      toast.success(
        "Default address updated"
      );
    } catch (error) {
      console.error(
        "Failed to set default address:",
        error
      );

      toast.error(
        "Default address could not be updated"
      );
    }
  }

  function handleDeliverHere(
    address: Address
  ) {
    setSelectedAddress(address);
    router.push("/checkout");
  }

  return (
    <section className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-10">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 p-5 text-white shadow-[0_20px_60px_rgba(22,163,74,0.28)] sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/15 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl" />

        <Link
          href={
            isCheckoutMode
              ? "/checkout"
              : "/"
          }
          aria-label={
            isCheckoutMode
              ? "Back to checkout"
              : "Back to home"
          }
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30 active:scale-95 sm:right-6 sm:top-6"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="relative z-[1] pr-14 sm:pr-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur">
            <MapPin size={14} />
            Delivery locations
          </div>

          <h1 className="mt-4 text-2xl font-extrabold sm:text-4xl">
            Saved Addresses
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-green-50 sm:text-base">
            Manage your delivery locations and choose where your next order should arrive.
          </p>
        </div>

        <div className="relative z-[1] mt-5 grid grid-cols-2 gap-2 sm:mt-7 sm:max-w-md sm:gap-4">
          <AddressStat
            label="Saved"
            value={addresses.length}
          />

          <AddressStat
            label="Default Set"
            value={
              defaultAddress ? 1 : 0
            }
          />
        </div>

        <button
          type="button"
          onClick={openAddDialog}
          className="relative z-[1] mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-green-700 shadow-sm transition hover:bg-green-50 active:scale-[0.98] sm:mt-5 sm:w-auto sm:px-6"
        >
          <Plus size={18} />
          Add New Address
        </button>
      </div>

      {loading ? (
        <div className="mt-5 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-5">
          {Array.from({
            length: 2,
          }).map((_, index) => (
            <div
              key={index}
              className="h-52 animate-pulse rounded-3xl bg-white shadow-sm"
            />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-dashed border-green-200 bg-white p-8 text-center shadow-sm sm:mt-8 sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
            <Home size={26} />
          </div>

          <h2 className="mt-4 text-xl font-extrabold">
            No saved addresses
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
            Add your first delivery address to make checkout quicker.
          </p>

          <button
            type="button"
            onClick={openAddDialog}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
          >
            <Plus size={17} />
            Add Address
          </button>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-5">
          {addresses.map(
            (address) => (
              <AddressCard
                key={address.id}
                address={address}
                checkoutMode={
                  isCheckoutMode
                }
                deleting={
                  deletingId ===
                  address.id
                }
                onEdit={(
                  selectedAddress
                ) => {
                  setEditingAddress(
                    selectedAddress
                  );

                  setDialogOpen(true);
                }}
                onDelete={
                  handleDelete
                }
                onSetDefault={
                  handleSetDefault
                }
                onDeliverHere={
                  handleDeliverHere
                }
              />
            )
          )}
        </div>
      )}

      <AddressDialog
        open={dialogOpen}
        title={
          editingAddress
            ? "Edit Address"
            : "Add Address"
        }
        initialData={
          editingAddress
        }
        saving={saving}
        onClose={closeDialog}
        onSubmit={
          editingAddress
            ? handleEdit
            : handleAdd
        }
      />
    </section>
  );
}

function AddressStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/15 px-3 py-3 text-center backdrop-blur sm:px-5 sm:py-4">
      <p className="text-xl font-extrabold sm:text-3xl">
        {value}
      </p>

      <p className="mt-0.5 text-[10px] font-semibold text-green-50 sm:text-xs">
        {label}
      </p>
    </div>
  );
}