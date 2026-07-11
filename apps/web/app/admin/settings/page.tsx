"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Clock3,
  IndianRupee,
  Mail,
  Phone,
  Save,
  Settings,
  ShieldAlert,
  Store,
} from "lucide-react";
import { toast } from "sonner";

import AdminLayout from "@/components/admin/AdminLayout";
import {
  getStoreSettings,
  StoreSettingsFormValues,
  updateStoreSettings,
} from "@/services/storeSettingsService";

const defaultForm: StoreSettingsFormValues = {
  store_name: "Quickify",
  support_email: "",
  support_phone: "",
  delivery_fee: 25,
  free_delivery_threshold: 199,
  platform_fee: 5,
  default_delivery_time: "10–15 minutes",
  currency: "INR",
  tax_percentage: 0,
  opening_time: "08:00",
  closing_time: "23:00",
  maintenance_mode: false,
  order_notifications: true,
  payment_notifications: true,
};

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();

  const [form, setForm] =
    useState<StoreSettingsFormValues>(defaultForm);
  const [saving, setSaving] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["store-settings"],
    queryFn: getStoreSettings,
  });

  useEffect(() => {
    if (!settings) return;

    setForm({
      store_name: settings.store_name,
      support_email: settings.support_email ?? "",
      support_phone: settings.support_phone ?? "",
      delivery_fee: Number(settings.delivery_fee),
      free_delivery_threshold: Number(settings.free_delivery_threshold),
      platform_fee: Number(settings.platform_fee),
      default_delivery_time: settings.default_delivery_time,
      currency: settings.currency,
      tax_percentage: Number(settings.tax_percentage),
      opening_time: normalizeTime(settings.opening_time, "08:00"),
      closing_time: normalizeTime(settings.closing_time, "23:00"),
      maintenance_mode: settings.maintenance_mode,
      order_notifications: settings.order_notifications,
      payment_notifications: settings.payment_notifications,
    });
  }, [settings]);

  function updateField<K extends keyof StoreSettingsFormValues>(
    field: K,
    value: StoreSettingsFormValues[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.store_name.trim()) {
      toast.error("Store name is required");
      return;
    }

    if (form.delivery_fee < 0 || form.platform_fee < 0) {
      toast.error("Fees cannot be negative");
      return;
    }

    if (form.free_delivery_threshold < 0) {
      toast.error("Free-delivery threshold cannot be negative");
      return;
    }

    if (form.tax_percentage < 0 || form.tax_percentage > 100) {
      toast.error("Tax percentage must be between 0 and 100");
      return;
    }

    try {
      setSaving(true);

      await updateStoreSettings(form);

      await queryClient.invalidateQueries({
        queryKey: ["store-settings"],
      });

      toast.success("Store settings updated");
    } catch (error) {
      console.error("Update store settings error:", error);
      toast.error("Failed to update store settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-gray-500">
          Manage store information, charges, business hours, and operational
          preferences.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-3xl bg-white p-10 text-center text-gray-500 shadow-sm">
          Loading store settings...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <SettingsSection
            icon={<Store size={22} />}
            title="Store Information"
            description="Basic information used across Quickify."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <TextInput
                label="Store Name"
                value={form.store_name}
                onChange={(value) => updateField("store_name", value)}
                placeholder="Quickify"
              />

              <SelectInput
                label="Currency"
                value={form.currency}
                onChange={(value) => updateField("currency", value)}
                options={[
                  { label: "Indian Rupee (INR)", value: "INR" },
                  { label: "US Dollar (USD)", value: "USD" },
                  { label: "Euro (EUR)", value: "EUR" },
                ]}
              />

              <TextInput
                label="Support Email"
                value={form.support_email}
                onChange={(value) => updateField("support_email", value)}
                placeholder="support@quickify.com"
                icon={<Mail size={18} />}
                type="email"
              />

              <TextInput
                label="Support Phone"
                value={form.support_phone}
                onChange={(value) => updateField("support_phone", value)}
                placeholder="+91 98765 43210"
                icon={<Phone size={18} />}
                type="tel"
              />
            </div>
          </SettingsSection>

          <SettingsSection
            icon={<IndianRupee size={22} />}
            title="Pricing & Charges"
            description="Control checkout fees and delivery conditions."
          >
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <NumberInput
                label="Delivery Fee"
                value={form.delivery_fee}
                onChange={(value) => updateField("delivery_fee", value)}
              />

              <NumberInput
                label="Free Delivery Above"
                value={form.free_delivery_threshold}
                onChange={(value) =>
                  updateField("free_delivery_threshold", value)
                }
              />

              <NumberInput
                label="Platform Fee"
                value={form.platform_fee}
                onChange={(value) => updateField("platform_fee", value)}
              />

              <NumberInput
                label="Tax Percentage"
                value={form.tax_percentage}
                onChange={(value) => updateField("tax_percentage", value)}
                step={0.1}
                suffix="%"
              />
            </div>
          </SettingsSection>

          <SettingsSection
            icon={<Clock3 size={22} />}
            title="Delivery & Business Hours"
            description="Configure default delivery information and operating hours."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <TextInput
                label="Default Delivery Time"
                value={form.default_delivery_time}
                onChange={(value) =>
                  updateField("default_delivery_time", value)
                }
                placeholder="10–15 minutes"
              />

              <TextInput
                label="Opening Time"
                value={form.opening_time}
                onChange={(value) => updateField("opening_time", value)}
                type="time"
              />

              <TextInput
                label="Closing Time"
                value={form.closing_time}
                onChange={(value) => updateField("closing_time", value)}
                type="time"
              />
            </div>
          </SettingsSection>

          <SettingsSection
            icon={<Bell size={22} />}
            title="Notifications"
            description="Choose which operational notifications should be generated."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ToggleCard
                title="Order Notifications"
                description="Receive admin notifications when new orders are placed or updated."
                checked={form.order_notifications}
                onChange={(checked) =>
                  updateField("order_notifications", checked)
                }
              />

              <ToggleCard
                title="Payment Notifications"
                description="Receive admin notifications for successful or failed payments."
                checked={form.payment_notifications}
                onChange={(checked) =>
                  updateField("payment_notifications", checked)
                }
              />
            </div>
          </SettingsSection>

          <SettingsSection
            icon={<ShieldAlert size={22} />}
            title="Store Availability"
            description="Maintenance mode can temporarily block the customer storefront."
          >
            <ToggleCard
              title="Maintenance Mode"
              description="When enabled, customers should see a maintenance message instead of the storefront."
              checked={form.maintenance_mode}
              onChange={(checked) =>
                updateField("maintenance_mode", checked)
              }
              warning
            />
          </SettingsSection>

          <div className="sticky bottom-4 z-20 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-green-600 px-7 py-4 font-bold text-white shadow-lg transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <Save size={19} />
              {saving ? "Saving Settings..." : "Save Settings"}
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}

function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4 border-b pb-5">
        <div className="rounded-2xl bg-green-100 p-3 text-green-700">
          {icon}
        </div>

        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-semibold">{label}</span>

      <div className="flex items-center gap-3 rounded-xl border px-4 focus-within:border-green-600">
        {icon && <span className="text-gray-400">{icon}</span>}

        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full py-3 outline-none"
        />
      </div>
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-semibold">{label}</span>

      <div className="flex items-center rounded-xl border px-4 focus-within:border-green-600">
        <input
          type="number"
          min={0}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full py-3 outline-none"
        />

        {suffix && <span className="text-gray-400">{suffix}</span>}
      </div>
    </label>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    label: string;
    value: string;
  }>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-semibold">{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-green-600"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleCard({
  title,
  description,
  checked,
  onChange,
  warning = false,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  warning?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start justify-between gap-5 rounded-2xl border p-5 transition ${
        checked
          ? warning
            ? "border-orange-300 bg-orange-50"
            : "border-green-300 bg-green-50"
          : "bg-white hover:bg-gray-50"
      }`}
    >
      <div>
        <p className="font-bold">{title}</p>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 accent-green-600"
      />
    </label>
  );
}

function normalizeTime(value: string | null, fallback: string) {
  if (!value) return fallback;

  return value.slice(0, 5);
}