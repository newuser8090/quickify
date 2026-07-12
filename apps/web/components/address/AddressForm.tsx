"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  Building2,
  LocateFixed,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { toast } from "sonner";

import type { Address } from "@/services/addressService";

type AddressFormValues = Omit<
  Address,
  "id" | "user_id"
>;

type Props = {
  initialData?: Address | null;
  saving?: boolean;
  onSubmit: (
    values: AddressFormValues
  ) => void;
  onCancel: () => void;
};

const emptyForm: AddressFormValues = {
  label: "",
  full_name: "",
  phone: "",
  address_line: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
  is_default: false,
  latitude: null,
  longitude: null,
};

export default function AddressForm({
  initialData,
  saving = false,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] =
    useState<AddressFormValues>(
      emptyForm
    );

  const [
    gettingLocation,
    setGettingLocation,
  ] = useState(false);

  useEffect(() => {
    if (!initialData) {
      setForm(emptyForm);
      return;
    }

    setForm({
      label:
        initialData.label,
      full_name:
        initialData.full_name,
      phone:
        initialData.phone,
      address_line:
        initialData.address_line,
      city:
        initialData.city,
      state:
        initialData.state,
      pincode:
        initialData.pincode,
      landmark:
        initialData.landmark ??
        "",
      is_default:
        initialData.is_default,
      latitude:
        initialData.latitude ??
        null,
      longitude:
        initialData.longitude ??
        null,
    });
  }, [initialData]);

  function updateField<
    K extends keyof AddressFormValues,
  >(
    field: K,
    value: AddressFormValues[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error(
        "Location is not supported on this device"
      );
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateField(
          "latitude",
          position.coords.latitude
        );

        updateField(
          "longitude",
          position.coords.longitude
        );

        toast.success(
          "Current location added"
        );

        setGettingLocation(false);
      },
      () => {
        toast.error(
          "Location permission denied"
        );

        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    onSubmit({
      ...form,
      label:
        form.label.trim(),
      full_name:
        form.full_name.trim(),
      phone:
        form.phone.trim(),
      address_line:
        form.address_line.trim(),
      city:
        form.city.trim(),
      state:
        form.state.trim(),
      pincode:
        String(
          form.pincode
        ).trim(),
      landmark:
        form.landmark?.trim() ??
        "",
    });
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 sm:text-base";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <FormField
        label="Address Label"
        icon={
          <Building2 size={17} />
        }
      >
        <input
          className={
            inputClass
          }
          placeholder="Home, Office, Hostel..."
          value={form.label}
          onChange={(event) =>
            updateField(
              "label",
              event.target.value
            )
          }
          required
        />
      </FormField>

      <FormField
        label="Full Name"
        icon={<User size={17} />}
      >
        <input
          className={
            inputClass
          }
          placeholder="Receiver's full name"
          value={
            form.full_name
          }
          onChange={(event) =>
            updateField(
              "full_name",
              event.target.value
            )
          }
          required
        />
      </FormField>

      <FormField
        label="Phone Number"
        icon={<Phone size={17} />}
      >
        <input
          type="tel"
          inputMode="numeric"
          className={
            inputClass
          }
          placeholder="10-digit phone number"
          value={form.phone}
          onChange={(event) =>
            updateField(
              "phone",
              event.target.value
            )
          }
          required
        />
      </FormField>

      <FormField
        label="Complete Address"
        icon={<MapPin size={17} />}
      >
        <textarea
          className={`${inputClass} resize-none`}
          placeholder="House number, street, area..."
          rows={3}
          value={
            form.address_line
          }
          onChange={(event) =>
            updateField(
              "address_line",
              event.target.value
            )
          }
          required
        />
      </FormField>

      <button
        type="button"
        onClick={
          handleUseCurrentLocation
        }
        disabled={
          gettingLocation ||
          saving
        }
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
      >
        <LocateFixed
          size={18}
        />

        {gettingLocation
          ? "Getting Location..."
          : "Use Current Location"}
      </button>

      {form.latitude !== null &&
        form.longitude !== null && (
          <div className="rounded-xl bg-green-50 px-4 py-3 text-xs font-medium text-green-700">
            Location saved:{" "}
            {form.latitude.toFixed(
              5
            )}
            ,{" "}
            {form.longitude.toFixed(
              5
            )}
          </div>
        )}

      <div className="grid grid-cols-2 gap-3">
        <FormField label="City">
          <input
            className={
              inputClass
            }
            placeholder="City"
            value={form.city}
            onChange={(event) =>
              updateField(
                "city",
                event.target.value
              )
            }
            required
          />
        </FormField>

        <FormField label="State">
          <input
            className={
              inputClass
            }
            placeholder="State"
            value={form.state}
            onChange={(event) =>
              updateField(
                "state",
                event.target.value
              )
            }
            required
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Pincode">
          <input
            inputMode="numeric"
            className={
              inputClass
            }
            placeholder="Pincode"
            value={
              form.pincode
            }
            onChange={(event) =>
              updateField(
                "pincode",
                event.target.value
              )
            }
            required
          />
        </FormField>

        <FormField label="Landmark">
          <input
            className={
              inputClass
            }
            placeholder="Optional"
            value={
              form.landmark ??
              ""
            }
            onChange={(event) =>
              updateField(
                "landmark",
                event.target.value
              )
            }
          />
        </FormField>
      </div>

      <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div>
          <p className="text-sm font-bold text-gray-900">
            Default address
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Automatically select this address during checkout.
          </p>
        </div>

        <input
          type="checkbox"
          checked={
            form.is_default
          }
          onChange={(event) =>
            updateField(
              "is_default",
              event.target.checked
            )
          }
          className="h-5 w-5 shrink-0 accent-green-600"
        />
      </label>

      <div
        className="grid grid-cols-2 gap-3 pt-2"
        style={{
          paddingBottom:
            "max(4px, env(safe-area-inset-bottom))",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            saving ||
            gettingLocation
          }
          className="rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {saving
            ? "Saving..."
            : initialData
              ? "Save Changes"
              : "Save Address"}
        </button>
      </div>
    </form>
  );
}

function FormField({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-700 sm:text-sm">
        {icon && (
          <span className="text-green-600">
            {icon}
          </span>
        )}

        {label}
      </span>

      {children}
    </label>
  );
}