"use client";

import { useEffect, useState } from "react";

import { Address } from "@/services/addressService";

type Props = {
  initialData?: Address | null;
  onSubmit: (
    values: Omit<Address, "id" | "user_id">
  ) => void;
  onCancel: () => void;
};

const emptyForm = {
  label: "",
  full_name: "",
  phone: "",
  address_line: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
  is_default: false,
};

export default function AddressForm({
  initialData,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initialData) {
      setForm({
        label: initialData.label,
        full_name: initialData.full_name,
        phone: initialData.phone,
        address_line: initialData.address_line,
        city: initialData.city,
        state: initialData.state,
        pincode: initialData.pincode,
        landmark: initialData.landmark ?? "",
        is_default: initialData.is_default,
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialData]);

  function updateField(
    field: keyof typeof form,
    value: string | boolean
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <input
        className="w-full rounded-xl border p-3"
        placeholder="Label (Home, Office...)"
        value={form.label}
        onChange={(e) =>
          updateField("label", e.target.value)
        }
        required
      />

      <input
        className="w-full rounded-xl border p-3"
        placeholder="Full Name"
        value={form.full_name}
        onChange={(e) =>
          updateField("full_name", e.target.value)
        }
        required
      />

      <input
        className="w-full rounded-xl border p-3"
        placeholder="Phone Number"
        value={form.phone}
        onChange={(e) =>
          updateField("phone", e.target.value)
        }
        required
      />

      <textarea
        className="w-full rounded-xl border p-3"
        placeholder="Address"
        rows={3}
        value={form.address_line}
        onChange={(e) =>
          updateField("address_line", e.target.value)
        }
        required
      />

      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="rounded-xl border p-3"
          placeholder="City"
          value={form.city}
          onChange={(e) =>
            updateField("city", e.target.value)
          }
          required
        />

        <input
          className="rounded-xl border p-3"
          placeholder="State"
          value={form.state}
          onChange={(e) =>
            updateField("state", e.target.value)
          }
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="rounded-xl border p-3"
          placeholder="Pincode"
          value={form.pincode}
          onChange={(e) =>
            updateField("pincode", e.target.value)
          }
          required
        />

        <input
          className="rounded-xl border p-3"
          placeholder="Landmark (Optional)"
          value={form.landmark}
          onChange={(e) =>
            updateField("landmark", e.target.value)
          }
        />
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={form.is_default}
          onChange={(e) =>
            updateField("is_default", e.target.checked)
          }
        />

        <span>Set as default address</span>
      </label>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border px-5 py-3"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
        >
          Save Address
        </button>
      </div>
    </form>
  );
}