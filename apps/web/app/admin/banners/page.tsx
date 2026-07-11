"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, ImageIcon, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getAllProducts } from "@/services/productService";

import AdminLayout from "@/components/admin/AdminLayout";
import { uploadBannerImage } from "@/services/bannerStorageService";
import {
  Banner,
  BannerFormValues,
  createBanner,
  deleteBanner,
  getAdminBanners,
  updateBanner,
} from "@/services/bannerService";

const gradientOptions = [
  "from-green-500 via-emerald-500 to-lime-400",
  "from-blue-500 via-cyan-500 to-sky-400",
  "from-orange-500 via-red-500 to-pink-500",
  "from-violet-600 via-purple-600 to-fuchsia-500",
  "from-yellow-400 via-orange-500 to-red-500",
  "from-indigo-500 via-blue-500 to-cyan-400",
  "from-pink-500 via-rose-500 to-red-500",
];

const buttonColorOptions = [
  "bg-white text-black hover:bg-gray-100",
  "bg-green-700 text-white hover:bg-green-800",
  "bg-black text-white hover:bg-gray-900",
  "bg-yellow-300 text-black hover:bg-yellow-400",
  "bg-blue-600 text-white hover:bg-blue-700",
];

const emptyForm: BannerFormValues = {
  type: "designed",
  title: "",
  subtitle: "",
  background_class: gradientOptions[0]!,
  floating_icons: ["🛒", "🥦", "🍎", "🥛", "🍞"],
  main_icon: "🛒",
  image_url: "",
  mobile_image_url: "",
  button_text: "Shop Now",
  button_color_class: buttonColorOptions[0]!,
  category: "All",
  is_active: true,
  sort_order: 0,
  starts_at: "",
  ends_at: "",
};
export default function AdminBannersPage() {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState<BannerFormValues>(emptyForm);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: getAdminBanners,
  });
  const { data: products = [] } = useQuery({
  queryKey: ["banner-category-products"],
  queryFn: getAllProducts,
});

const categories = useMemo(
  () => ["All", ...Array.from(new Set(products.map((product) => product.category)))],
  [products]
);

  const previewIcons = useMemo(
    () => form.floating_icons.filter(Boolean).slice(0, 5),
    [form.floating_icons]
  );

  function openCreateDialog() {
    setEditingBanner(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(banner: Banner) {
    setEditingBanner(banner);
    setForm({
  type: banner.type,
  title: banner.title ?? "",
  subtitle: banner.subtitle ?? "",
  background_class: banner.background_class ?? gradientOptions[0]!,
  floating_icons: banner.floating_icons ?? [],
  main_icon: banner.main_icon ?? "🛒",
  image_url: banner.image_url ?? "",
  mobile_image_url: banner.mobile_image_url ?? "",
  button_text: banner.button_text,
  button_color_class: banner.button_color_class,
  category: banner.category,
  is_active: banner.is_active,
  sort_order: banner.sort_order,
  starts_at: banner.starts_at ? banner.starts_at.slice(0, 16) : "",
  ends_at: banner.ends_at ? banner.ends_at.slice(0, 16) : "",
});
    setDialogOpen(true);
  }

  async function handleBannerImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);

      const imageUrl = await uploadBannerImage(file);

      setForm((prev) => ({
        ...prev,
        image_url: imageUrl,
      }));

      toast.success("Banner image uploaded");
    } catch {
      toast.error("Banner image upload failed");
    } finally {
      setUploadingImage(false);
    }
  }
  async function handleMobileBannerImageUpload(
  e: React.ChangeEvent<HTMLInputElement>
) {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    setUploadingImage(true);

    const imageUrl = await uploadBannerImage(file);

    setForm((prev) => ({
      ...prev,
      mobile_image_url: imageUrl,
    }));

    toast.success("Mobile banner image uploaded");
  } catch {
    toast.error("Mobile banner image upload failed");
  } finally {
    setUploadingImage(false);
  }
}

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingBanner) {
        await updateBanner(editingBanner.id, form);
        toast.success("Banner updated");
      } else {
        await createBanner(form);
        toast.success("Banner created");
      }

      setDialogOpen(false);
      setEditingBanner(null);
      setForm(emptyForm);

      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["active-banners"] });
    } catch {
      toast.error("Failed to save banner");
    }
  }

  async function handleDelete(banner: Banner) {
    const confirmed = window.confirm(
      `Delete banner "${banner.title ?? banner.button_text}"?`
    );

    if (!confirmed) return;

    try {
      await deleteBanner(banner.id);
      toast.success("Banner deleted");

      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["active-banners"] });
    } catch {
      toast.error("Failed to delete banner");
    }
  }
  function handleAddEmoji() {
  setForm((prev) => ({
    ...prev,
    floating_icons: [...prev.floating_icons, "🛒"],
  }));
}

function handleUpdateEmoji(index: number, value: string) {
  setForm((prev) => ({
    ...prev,
    floating_icons: prev.floating_icons.map((icon, itemIndex) =>
      itemIndex === index ? value : icon
    ),
  }));
}

function handleRemoveEmoji(index: number) {
  setForm((prev) => ({
    ...prev,
    floating_icons: prev.floating_icons.filter((_, itemIndex) => itemIndex !== index),
  }));
}

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Banner Management</h1>
            <p className="mt-2 text-gray-500">
              Create, edit, reorder, activate, and customize homepage banners.
            </p>
          </div>

          <button
            onClick={openCreateDialog}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
          >
            <Plus size={18} />
            Add Banner
          </button>
        </div>

        {isLoading ? (
          <div className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
            Loading banners...
          </div>
        ) : banners.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <ImageIcon className="mx-auto text-gray-400" size={44} />
            <h2 className="mt-4 text-2xl font-bold">No banners yet</h2>
            <p className="mt-2 text-gray-500">
              Add your first homepage banner.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="rounded-3xl bg-white p-5 shadow-sm"
              >
                <BannerPreview banner={banner} />

                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold">
                      {banner.title ?? "Image Banner"}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Type: {banner.type} • Category: {banner.category}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Sort: {banner.sort_order} •{" "}
                      {banner.is_active ? "Active" : "Inactive"}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
  Views: {banner.views ?? 0} • Clicks: {banner.clicks ?? 0} • CTR:{" "}
  {banner.views
    ? `${(((banner.clicks ?? 0) / banner.views) * 100).toFixed(2)}%`
    : "0%"}
</p>

<p className="mt-1 text-sm text-gray-500">
  Schedule: {banner.starts_at ? new Date(banner.starts_at).toLocaleString() : "Anytime"} →{" "}
  {banner.ends_at ? new Date(banner.ends_at).toLocaleString() : "No end"}
</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditDialog(banner)}
                      className="rounded-xl border p-2 hover:bg-gray-50"
                    >
                      <Edit size={17} />
                    </button>

                    <button
                      onClick={() => handleDelete(banner)}
                      className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {dialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
              <h2 className="text-2xl font-bold">
                {editingBanner ? "Edit Banner" : "Add Banner"}
              </h2>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block font-semibold">
                      Banner Type
                    </span>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          type: e.target.value as BannerFormValues["type"],
                        })
                      }
                      className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                    >
                      <option value="designed">Designed Banner</option>
                      <option value="image">Image Banner</option>
                    </select>
                  </label>

                  <Input
                    label="Sort Order"
                    value={String(form.sort_order)}
                    type="number"
                    onChange={(value) =>
                      setForm({ ...form, sort_order: Number(value) })
                    }
                  />
                </div>

                {form.type === "designed" ? (
                  <>
                    <Input
                      label="Main Heading"
                      value={form.title}
                      onChange={(value) => setForm({ ...form, title: value })}
                    />

                    <Input
                      label="Subtitle"
                      value={form.subtitle}
                      onChange={(value) =>
                        setForm({ ...form, subtitle: value })
                      }
                    />

                    <label>
                      <span className="mb-2 block font-semibold">
                        Background Gradient
                      </span>
                      <div>
  <span className="mb-2 block font-semibold">Background Gradient</span>

  <div className="grid gap-3 md:grid-cols-3">
    {gradientOptions.map((gradient) => (
      <button
        key={gradient}
        type="button"
        onClick={() => setForm({ ...form, background_class: gradient })}
        className={`h-16 rounded-2xl bg-gradient-to-r ${gradient} ${
          form.background_class === gradient
            ? "ring-4 ring-green-600"
            : "ring-1 ring-gray-200"
        }`}
      />
    ))}
  </div>
</div>
                    </label>

                    <div>
  <span className="mb-2 block font-semibold">Floating Emojis</span>

  <div className="flex flex-wrap gap-3">
    {form.floating_icons.map((icon, index) => (
      <div
        key={index}
        className="flex items-center gap-2 rounded-xl border bg-gray-50 px-3 py-2"
      >
        <input
          value={icon}
          onChange={(e) => handleUpdateEmoji(index, e.target.value)}
          className="w-12 bg-transparent text-center text-2xl outline-none"
        />

        <button
          type="button"
          onClick={() => handleRemoveEmoji(index)}
          className="text-sm font-bold text-red-500"
        >
          ✕
        </button>
      </div>
    ))}

    <button
      type="button"
      onClick={handleAddEmoji}
      className="rounded-xl border border-dashed px-4 py-2 font-semibold text-green-700 hover:bg-green-50"
    >
      + Add Emoji
    </button>
  </div>
</div>

                    <Input
                      label="Main Big Emoji"
                      value={form.main_icon}
                      onChange={(value) =>
                        setForm({ ...form, main_icon: value })
                      }
                    />
                  </>
                ) : (
                  <div className="space-y-4">
  <Input
    label="Desktop Banner Image URL"
    value={form.image_url}
    onChange={(value) => setForm({ ...form, image_url: value })}
  />

  <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed px-4 py-4 font-semibold text-green-700 hover:bg-green-50">
    {uploadingImage ? "Uploading..." : "Upload Desktop Banner Image"}

    <input
      type="file"
      accept="image/*"
      onChange={handleBannerImageUpload}
      disabled={uploadingImage}
      className="hidden"
    />
  </label>

  <Input
    label="Mobile Banner Image URL"
    value={form.mobile_image_url}
    onChange={(value) => setForm({ ...form, mobile_image_url: value })}
  />

  <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed px-4 py-4 font-semibold text-green-700 hover:bg-green-50">
    {uploadingImage ? "Uploading..." : "Upload Mobile Banner Image"}

    <input
      type="file"
      accept="image/*"
      onChange={handleMobileBannerImageUpload}
      disabled={uploadingImage}
      className="hidden"
    />
  </label>
</div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Button Text"
                    value={form.button_text}
                    onChange={(value) =>
                      setForm({ ...form, button_text: value })
                    }
                  />

                  <label>
                    {/* <span className="mb-2 block font-semibold">
                      Button Color
                    </span> */}
                    <div>
  <span className="mb-2 block font-semibold">Button Color</span>

  <div className="grid gap-3 md:grid-cols-2">
    {buttonColorOptions.map((color) => (
      <button
        key={color}
        type="button"
        onClick={() => setForm({ ...form, button_color_class: color })}
        className={`rounded-xl px-4 py-3 font-bold ${color} ${
          form.button_color_class === color
            ? "ring-4 ring-green-600"
            : "ring-1 ring-gray-200"
        }`}
      >
        Button Preview
      </button>
    ))}
  </div>
</div>
                  </label>
                </div>

                <label>
  <span className="mb-2 block font-semibold">Category To Open</span>

  <select
    value={form.category}
    onChange={(e) => setForm({ ...form, category: e.target.value })}
    className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
  >
    {categories.map((category) => (
      <option key={category} value={category}>
        {category}
      </option>
    ))}
  </select>
  <div className="grid gap-4 md:grid-cols-2">
  <Input
    label="Starts At"
    type="datetime-local"
    value={form.starts_at}
    onChange={(value) => setForm({ ...form, starts_at: value })}
  />

  <Input
    label="Ends At"
    type="datetime-local"
    value={form.ends_at}
    onChange={(value) => setForm({ ...form, ends_at: value })}
  />
</div>
</label>

                <label className="flex items-center gap-3 font-semibold">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({ ...form, is_active: e.target.checked })
                    }
                  />
                  Banner active
                </label>

                <FormPreview form={form} previewIcons={previewIcons} />

                <div className="flex justify-end gap-3 border-t pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setDialogOpen(false);
                      setEditingBanner(null);
                    }}
                    className="rounded-xl border px-5 py-3"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
                  >
                    {editingBanner ? "Save Banner" : "Create Banner"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function BannerPreview({ banner }: { banner: Banner }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${
        banner.type === "designed"
          ? `bg-gradient-to-r ${banner.background_class}`
          : "bg-gray-100"
      } p-6`}
    >
      {banner.type === "image" && banner.image_url ? (
        <Image
          src={banner.image_url}
          alt={banner.title ?? "Banner"}
          width={800}
          height={240}
          className="h-48 w-full rounded-xl object-cover"
        />
      ) : (
        <>
          <div className="pointer-events-none absolute inset-0 opacity-25">
            {(banner.floating_icons ?? []).slice(0, 5).map((icon, index) => (
              <span
                key={`${icon}-${index}`}
                className="absolute text-4xl"
                style={{
                  left: `${10 + index * 18}%`,
                  top: `${15 + (index % 2) * 45}%`,
                }}
              >
                {icon}
              </span>
            ))}
          </div>

          <div className="relative z-10 flex items-center justify-between gap-6 text-white">
            <div>
              <h2 className="text-2xl font-bold">{banner.title}</h2>
              <p className="mt-2 text-sm opacity-90">{banner.subtitle}</p>
              <button
                type="button"
                className={`mt-5 rounded-xl px-5 py-2 text-sm font-bold ${banner.button_color_class}`}
              >
                {banner.button_text}
              </button>
            </div>

            <div className="text-6xl">{banner.main_icon}</div>
          </div>
        </>
      )}
    </div>
  );
}

function FormPreview({
  form,
  previewIcons,
}: {
  form: BannerFormValues;
  previewIcons: string[];
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${
        form.type === "designed"
          ? `bg-gradient-to-r ${form.background_class}`
          : "bg-gray-100"
      } p-6`}
    >
      {form.type === "image" && form.image_url ? (
        <Image
          src={form.image_url}
          alt="Preview"
          width={800}
          height={260}
          className="h-52 w-full rounded-xl object-cover"
        />
      ) : (
        <>
          <div className="pointer-events-none absolute inset-0 opacity-25">
            {previewIcons.map((icon, index) => (
              <span
                key={`${icon}-${index}`}
                className="absolute text-4xl"
                style={{
                  left: `${10 + index * 18}%`,
                  top: `${15 + (index % 2) * 45}%`,
                }}
              >
                {icon}
              </span>
            ))}
          </div>

          <div className="relative z-10 flex items-center justify-between gap-6 text-white">
            <div>
              <h2 className="text-3xl font-bold">
                {form.title || "Banner Title"}
              </h2>
              <p className="mt-2 opacity-90">
                {form.subtitle || "Banner subtitle"}
              </p>
              <button
                type="button"
                className={`mt-5 rounded-xl px-5 py-2 font-bold ${form.button_color_class}`}
              >
                {form.button_text}
              </button>
            </div>

            <div className="text-7xl">{form.main_icon}</div>
          </div>
        </>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-semibold">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
      />
    </label>
  );
}