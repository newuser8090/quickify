"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Edit,
  FolderTree,
  GripVertical,
  Package,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import AdminLayout from "@/components/admin/AdminLayout";
import { getAllProducts } from "@/services/productService";
import {
  Category,
  CategoryFormValues,
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  updateCategoryOrder,
} from "@/services/categoryService";
import { uploadCategoryIcon } from "@/services/categoryStorageService";

const emptyForm: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  image: "",
  emoji: "",
  is_active: true,
  sort_order: 0,
};

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormValues>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [localCategories, setLocalCategories] = useState<Category[]>([]);

  const sensors = useSensors(useSensor(PointerSensor));

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getCategories,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["category-products-list"],
    queryFn: getAllProducts,
  });

  useEffect(() => {
  const nextCategories = [...categories].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  setLocalCategories((currentCategories) => {
    const currentOrder = currentCategories
      .map((category) => `${category.id}:${category.sort_order}`)
      .join("|");

    const nextOrder = nextCategories
      .map((category) => `${category.id}:${category.sort_order}`)
      .join("|");

    return currentOrder === nextOrder
      ? currentCategories
      : nextCategories;
  });
}, [categories]);


  async function refreshCategories() {
    await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    await queryClient.invalidateQueries({ queryKey: ["homepage-categories"] });
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    await queryClient.invalidateQueries({ queryKey: ["category-products-list"] });
  }

  async function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;

  if (!over || active.id === over.id) return;

  const oldIndex = localCategories.findIndex(
    (category) => category.id === active.id
  );

  const newIndex = localCategories.findIndex(
    (category) => category.id === over.id
  );

  if (oldIndex === -1 || newIndex === -1) return;

  const reordered = arrayMove(localCategories, oldIndex, newIndex);
  setLocalCategories(reordered);

  try {
    await Promise.all(
      reordered.map((category, index) =>
        updateCategoryOrder(category.id, index + 1)
      )
    );

    toast.success("Category order updated");
    await refreshCategories();
  } catch (error) {
    console.error(error);
    toast.error("Failed to update category order");
  }
}

  function openCreateDialog() {
  setEditingCategory(null);
  setForm({
    ...emptyForm,
    sort_order: localCategories.length + 1,
  });
  setDialogOpen(true);
}

  function openEditDialog(category: Category) {
    setEditingCategory(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      image: category.image ?? "",
      emoji: category.emoji ?? "",
      is_active: category.is_active,
      sort_order: category.sort_order,
    });
    setDialogOpen(true);
  }

  async function handleIconUpload(file: File) {
    try {
      setUploading(true);
      const url = await uploadCategoryIcon(file);
      setForm((prev) => ({ ...prev, image: url }));
      toast.success("Category icon uploaded");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload category icon");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, form);
        toast.success("Category updated");
      } else {
        await createCategory(form);
        toast.success("Category created");
      }

      setDialogOpen(false);
      setEditingCategory(null);
      setForm(emptyForm);
      await refreshCategories();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save category");
    }
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(`Delete "${category.name}"?`);
    if (!confirmed) return;

    try {
      await deleteCategory(category.id);
      toast.success("Category deleted");
      await refreshCategories();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete category");
    }
  }

  function getCategoryProducts(category: Category) {
    return products.filter((product) => product.category === category.name);
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="mt-2 text-gray-500">
            Drag categories to control their order on the homepage.
          </p>
        </div>

        <button
          onClick={openCreateDialog}
          className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
          Loading categories...
        </div>
      ) : localCategories.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
          <FolderTree className="mx-auto text-gray-400" size={44} />
          <h2 className="mt-4 text-2xl font-bold">No categories yet</h2>
          <p className="mt-2 text-gray-500">
            Create your first product category.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
  items={localCategories.map((category) => category.id)}
  strategy={rectSortingStrategy}
>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {localCategories.map((category) => (
                <SortableCategoryCard
                  key={category.id}
                  category={category}
                  productCount={getCategoryProducts(category).length}
                  onOpen={() => setSelectedCategory(category)}
                  onEdit={() => openEditDialog(category)}
                  onDelete={() => handleDelete(category)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedCategory.name} Products
                </h2>
                <p className="mt-1 text-gray-500">
                  Products currently linked to this category.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {getCategoryProducts(selectedCategory).length === 0 ? (
                <div className="rounded-2xl bg-gray-50 p-8 text-center text-gray-500">
                  No products in this category.
                </div>
              ) : (
                getCategoryProducts(selectedCategory).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                        <Package size={20} className="text-green-600" />
                      </div>

                      <div>
                        <p className="font-bold">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          {product.unit} • ₹{product.price}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        product.stock > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.stock > 0 ? `${product.stock} left` : "Out"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-bold">
              {editingCategory ? "Edit Category" : "Add Category"}
            </h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <Input
                label="Category Name"
                value={form.name}
                onChange={(value) =>
                  setForm({
                    ...form,
                    name: value,
                    slug: editingCategory ? form.slug : generateSlug(value),
                  })
                }
              />

              <Input
                label="Slug"
                value={form.slug}
                onChange={(value) =>
                  setForm({
                    ...form,
                    slug: generateSlug(value),
                  })
                }
              />

              <Input
                label="Description"
                value={form.description}
                onChange={(value) => setForm({ ...form, description: value })}
              />

              <Input
                label="Emoji"
                value={form.emoji}
                onChange={(value) => setForm({ ...form, emoji: value })}
              />

              <Input
                label="Image URL"
                value={form.image}
                onChange={(value) => setForm({ ...form, image: value })}
              />

              <label className="block">
                <span className="mb-2 block font-semibold">
                  Upload Category Icon
                </span>

                <div className="flex items-center gap-3 rounded-xl border bg-gray-50 p-3">
                  <Upload size={18} className="text-green-600" />

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleIconUpload(file);
                    }}
                    className="w-full text-sm"
                  />
                </div>

                {uploading && (
                  <p className="mt-2 text-sm text-gray-500">Uploading...</p>
                )}
              </label>

              <div className="rounded-2xl border bg-gray-50 p-6">
                <p className="mb-3 font-semibold">Homepage Preview</p>

                <div className="flex w-28 flex-col items-center rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-green-50 text-4xl">
                    {form.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.image}
                        alt="preview"
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      form.emoji || "🛒"
                    )}
                  </div>

                  <p className="mt-3 text-center font-semibold">
                    {form.name || "Category"}
                  </p>
                </div>
              </div>

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
                Category visible
              </label>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setDialogOpen(false);
                    setEditingCategory(null);
                    setForm(emptyForm);
                  }}
                  className="rounded-xl border px-5 py-3"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
                >
                  {editingCategory ? "Save Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function SortableCategoryCard({
  category,
  productCount,
  onOpen,
  onEdit,
  onDelete,
}: {
  category: Category;
  productCount: number;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex min-h-[280px] flex-col rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        isDragging ? "z-50 opacity-70 ring-2 ring-green-500" : ""
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab rounded-xl border p-2 text-gray-400 hover:bg-gray-50 active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical size={18} />
        </button>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            category.is_active
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {category.is_active ? "Active" : "Hidden"}
        </span>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="flex flex-1 flex-col text-left"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-green-50 text-3xl">
            {category.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-contain p-2"
              />
            ) : (
              category.emoji || "🛒"
            )}
          </div>

          <div>
            <h2 className="line-clamp-1 text-xl font-bold">{category.name}</h2>
            <p className="mt-1 text-sm text-gray-500">/{category.slug}</p>
          </div>
        </div>

        <p className="mt-4 line-clamp-2 text-sm text-gray-500">
          {category.description || "No description added."}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Products</p>
            <p className="mt-1 text-2xl font-bold text-green-700">
              {productCount}
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Sort Order</p>
            <p className="mt-1 text-2xl font-bold">{category.sort_order}</p>
          </div>
        </div>
      </button>

      <div className="mt-5 flex items-center justify-end gap-2 border-t pt-4">
        <button
          onClick={onEdit}
          className="rounded-xl border p-2 hover:bg-gray-50"
          title="Edit category"
        >
          <Edit size={17} />
        </button>

        <button
          onClick={onDelete}
          className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50"
          title="Delete category"
        >
          <Trash2 size={17} />
        </button>
      </div>
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