"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Edit,
  Eye,
  EyeOff,
  LayoutTemplate,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import AdminLayout from "@/components/admin/AdminLayout";
import { getAllProducts } from "@/services/productService";
import {
  createHomepageSection,
  deleteHomepageSection,
  getAdminHomepageSections,
  HomepageSection,
  HomepageSectionFormValues,
  HomepageSectionType,
  updateHomepageSection,
  updateHomepageSectionOrder,
} from "@/services/homepageSectionService";

const sectionTypes: { label: string; value: HomepageSectionType }[] = [
  { label: "All Products", value: "all" },
  { label: "Featured Products", value: "featured" },
  { label: "Best Sellers", value: "bestseller" },
  { label: "Discounted Products", value: "discounted" },
  { label: "New Arrivals", value: "new" },
  { label: "Top Rated", value: "top_rated" },
  { label: "Category Products", value: "category" },
  { label: "Recently Viewed", value: "recently_viewed" },
  {
  label: "Recently Purchased (Buy Again)",
  value: "recently_purchased",
},
];

const emptyForm: HomepageSectionFormValues = {
  section_key: "",
  title: "",
  subtitle: "",
  section_type: "all",
  category: "All",
  limit_count: 8,
  is_active: true,
  sort_order: 0,
};

function generateSectionKey(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_");
}

export default function AdminHomepagePage() {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSection, setEditingSection] =
    useState<HomepageSection | null>(null);
  const [form, setForm] = useState<HomepageSectionFormValues>(emptyForm);
  const [movingId, setMovingId] = useState<number | null>(null);

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["admin-homepage-sections"],
    queryFn: getAdminHomepageSections,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["homepage-builder-products"],
    queryFn: getAllProducts,
  });

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((item) => item.category)))],
    [products]
  );

  function refreshSections() {
    queryClient.invalidateQueries({ queryKey: ["admin-homepage-sections"] });
    queryClient.invalidateQueries({ queryKey: ["active-homepage-sections"] });
  }

  async function handleMoveSection(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const currentSection = sections[index];
    const targetSection = sections[targetIndex];

    if (!currentSection || !targetSection) return;

    try {
      setMovingId(currentSection.id);

      await Promise.all([
        updateHomepageSectionOrder(currentSection.id, targetSection.sort_order),
        updateHomepageSectionOrder(targetSection.id, currentSection.sort_order),
      ]);

      toast.success("Section order updated");
      refreshSections();
    } catch {
      toast.error("Failed to reorder section");
    } finally {
      setMovingId(null);
    }
  }

  function openCreateDialog() {
    setEditingSection(null);
    setForm({
      ...emptyForm,
      sort_order: sections.length + 1,
    });
    setDialogOpen(true);
  }

  function openEditDialog(section: HomepageSection) {
    setEditingSection(section);
    setForm({
      section_key: section.section_key,
      title: section.title,
      subtitle: section.subtitle ?? "",
      section_type: section.section_type,
      category: section.category ?? "All",
      limit_count: section.limit_count,
      is_active: section.is_active,
      sort_order: section.sort_order,
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingSection) {
        await updateHomepageSection(editingSection.id, form);
        toast.success("Homepage section updated");
      } else {
        await createHomepageSection(form);
        toast.success("Homepage section created");
      }

      setDialogOpen(false);
      setEditingSection(null);
      setForm(emptyForm);
      refreshSections();
    } catch {
      toast.error("Failed to save homepage section");
    }
  }

  async function handleDelete(section: HomepageSection) {
    const confirmed = window.confirm(`Delete "${section.title}"?`);
    if (!confirmed) return;

    try {
      await deleteHomepageSection(section.id);
      toast.success("Homepage section deleted");
      refreshSections();
    } catch {
      toast.error("Failed to delete homepage section");
    }
  }

  async function handleToggleActive(section: HomepageSection) {
    try {
      await updateHomepageSection(section.id, {
        section_key: section.section_key,
        title: section.title,
        subtitle: section.subtitle ?? "",
        section_type: section.section_type,
        category: section.category ?? "All",
        limit_count: section.limit_count,
        is_active: !section.is_active,
        sort_order: section.sort_order,
      });

      toast.success(section.is_active ? "Section hidden" : "Section shown");
      refreshSections();
    } catch {
      toast.error("Failed to update section");
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Homepage Builder</h1>
            <p className="mt-2 text-gray-500">
              Control homepage sections, titles, order, visibility, and product
              collections.
            </p>
          </div>

          <button
            onClick={openCreateDialog}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
          >
            <Plus size={18} />
            Add Section
          </button>
        </div>

        {isLoading ? (
          <div className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
            Loading homepage sections...
          </div>
        ) : sections.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <LayoutTemplate className="mx-auto text-gray-400" size={44} />
            <h2 className="mt-4 text-2xl font-bold">No sections yet</h2>
            <p className="mt-2 text-gray-500">
              Create your first homepage section.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 font-bold text-green-700">
                    {index + 1}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold">{section.title}</h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          section.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {section.is_active ? "Visible" : "Hidden"}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      {section.subtitle || "No subtitle"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                        Type: {section.section_type}
                      </span>

                      {section.category && (
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-purple-700">
                          Category: {section.category}
                        </span>
                      )}

                      <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-700">
                        Limit: {section.limit_count}
                      </span>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">
                        Key: {section.section_key}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleMoveSection(index, "up")}
                    disabled={index === 0 || movingId === section.id}
                    className="rounded-xl border p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Move up"
                  >
                    <ArrowUp size={17} />
                  </button>

                  <button
                    onClick={() => handleMoveSection(index, "down")}
                    disabled={index === sections.length - 1 || movingId === section.id}
                    className="rounded-xl border p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Move down"
                  >
                    <ArrowDown size={17} />
                  </button>

                  <button
                    onClick={() => handleToggleActive(section)}
                    className="rounded-xl border p-2 hover:bg-gray-50"
                    title={section.is_active ? "Hide section" : "Show section"}
                  >
                    {section.is_active ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>

                  <button
                    onClick={() => openEditDialog(section)}
                    className="rounded-xl border p-2 hover:bg-gray-50"
                  >
                    <Edit size={17} />
                  </button>

                  <button
                    onClick={() => handleDelete(section)}
                    className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {dialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
              <h2 className="text-2xl font-bold">
                {editingSection ? "Edit Section" : "Add Section"}
              </h2>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <Input
                  label="Section Title"
                  value={form.title}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      title: value,
                      section_key: editingSection
                        ? form.section_key
                        : generateSectionKey(value),
                    })
                  }
                />

                <Input
                  label="Section Key"
                  value={form.section_key}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      section_key: generateSectionKey(value),
                    })
                  }
                />

                <Input
                  label="Subtitle"
                  value={form.subtitle}
                  onChange={(value) => setForm({ ...form, subtitle: value })}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block font-semibold">
                      Section Type
                    </span>

                    <select
                      value={form.section_type}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          section_type: e.target.value as HomepageSectionType,
                        })
                      }
                      className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                    >
                      {sectionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <Input
                    label="Product Limit"
                    value={String(form.limit_count)}
                    type="number"
                    onChange={(value) =>
                      setForm({ ...form, limit_count: Number(value) })
                    }
                  />
                </div>

                {form.section_type === "category" && (
                  <label>
                    <span className="mb-2 block font-semibold">Category</span>

                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <Input
                  label="Sort Order"
                  value={String(form.sort_order)}
                  type="number"
                  onChange={(value) =>
                    setForm({ ...form, sort_order: Number(value) })
                  }
                />

                <label className="flex items-center gap-3 font-semibold">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({ ...form, is_active: e.target.checked })
                    }
                  />
                  Section visible on homepage
                </label>

                <div className="rounded-2xl bg-gray-50 p-5">
                  <p className="text-sm font-bold text-gray-500">Preview</p>
                  <h3 className="mt-3 text-2xl font-bold">
                    {form.title || "Section title"}
                  </h3>
                  <p className="mt-1 text-gray-500">
                    {form.subtitle || "Section subtitle"}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-green-700">
                    {form.section_type} • {form.limit_count} products
                  </p>
                </div>

                <div className="flex justify-end gap-3 border-t pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setDialogOpen(false);
                      setEditingSection(null);
                    }}
                    className="rounded-xl border px-5 py-3"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
                  >
                    {editingSection ? "Save Section" : "Create Section"}
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