"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Clock3,
  Edit,
  Eye,
  EyeOff,
  LayoutTemplate,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import AdminLayout from "@/components/admin/AdminLayout";
import {
  getAllProducts,
} from "@/services/productService";
import {
  createHomepageSection,
  deleteHomepageSection,
  getAdminHomepageSections,
  updateHomepageSection,
  updateHomepageSectionOrder,
  type HomepageSection,
  type HomepageSectionFormValues,
  type HomepageSectionType,
} from "@/services/homepageSectionService";

const sectionTypes: {
  label: string;
  value: HomepageSectionType;
}[] = [
  {
    label: "All Products",
    value: "all",
  },
  {
    label: "Featured Products",
    value: "featured",
  },
  {
    label: "Best Sellers",
    value: "bestseller",
  },
  {
    label: "Discounted Products",
    value: "discounted",
  },
  {
    label: "New Arrivals",
    value: "new",
  },
  {
    label: "Top Rated",
    value: "top_rated",
  },
  {
    label: "Category Products",
    value: "category",
  },
  {
    label: "Recently Viewed",
    value: "recently_viewed",
  },
  {
    label:
      "Recently Purchased (Buy Again)",
    value:
      "recently_purchased",
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
  show_countdown: false,
  countdown_start: "",
  countdown_end: "",
};

function generateSectionKey(
  title: string
) {
  return title
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9\s-]/g,
      ""
    )
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_");
}

function toDateTimeLocalValue(
  value?: string | null
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const offset =
    date.getTimezoneOffset();

  const localDate =
    new Date(
      date.getTime() -
        offset * 60_000
    );

  return localDate
    .toISOString()
    .slice(0, 16);
}

export default function AdminHomepagePage() {
  const queryClient =
    useQueryClient();

  const [
    dialogOpen,
    setDialogOpen,
  ] = useState(false);

  const [
    editingSection,
    setEditingSection,
  ] =
    useState<HomepageSection | null>(
      null
    );

  const [form, setForm] =
    useState<HomepageSectionFormValues>(
      emptyForm
    );

  const [
    movingId,
    setMovingId,
  ] = useState<number | null>(
    null
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const {
    data: sections = [],
    isLoading,
  } = useQuery({
    queryKey: [
      "admin-homepage-sections",
    ],
    queryFn:
      getAdminHomepageSections,
  });

  const {
    data: products = [],
  } = useQuery({
    queryKey: [
      "homepage-builder-products",
    ],
    queryFn: getAllProducts,
  });

  const categories =
    useMemo(
      () => [
        "All",
        ...Array.from(
          new Set(
            products.map(
              (product) =>
                product.category
            )
          )
        ),
      ],
      [products]
    );

  function refreshSections() {
    queryClient.invalidateQueries({
      queryKey: [
        "admin-homepage-sections",
      ],
    });

    queryClient.invalidateQueries({
      queryKey: [
        "active-homepage-sections",
      ],
    });
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingSection(null);
    setForm(emptyForm);
  }

  function openCreateDialog() {
    setEditingSection(null);

    setForm({
      ...emptyForm,
      sort_order:
        sections.length + 1,
    });

    setDialogOpen(true);
  }

  function openEditDialog(
    section: HomepageSection
  ) {
    setEditingSection(
      section
    );

    setForm({
      section_key:
        section.section_key,
      title:
        section.title,
      subtitle:
        section.subtitle ?? "",
      section_type:
        section.section_type,
      category:
        section.category ?? "All",
      limit_count:
        section.limit_count,
      is_active:
        section.is_active,
      sort_order:
        section.sort_order,
      show_countdown:
        section.show_countdown ??
        false,
      countdown_start:
        toDateTimeLocalValue(
          section.countdown_start
        ),
      countdown_end:
        toDateTimeLocalValue(
          section.countdown_end
        ),
    });

    setDialogOpen(true);
  }

  async function handleMoveSection(
    index: number,
    direction:
      | "up"
      | "down"
  ) {
    const targetIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    const currentSection =
      sections[index];

    const targetSection =
      sections[targetIndex];

    if (
      !currentSection ||
      !targetSection
    ) {
      return;
    }

    try {
      setMovingId(
        currentSection.id
      );

      await Promise.all([
        updateHomepageSectionOrder(
          currentSection.id,
          targetSection.sort_order
        ),
        updateHomepageSectionOrder(
          targetSection.id,
          currentSection.sort_order
        ),
      ]);

      toast.success(
        "Section order updated"
      );

      refreshSections();
    } catch {
      toast.error(
        "Failed to reorder section"
      );
    } finally {
      setMovingId(null);
    }
  }

  function validateForm() {
    if (!form.title.trim()) {
      toast.error(
        "Please enter a section title"
      );

      return false;
    }

    if (
      !form.section_key.trim()
    ) {
      toast.error(
        "Please enter a section key"
      );

      return false;
    }

    if (
      form.limit_count < 1
    ) {
      toast.error(
        "Product limit must be at least 1"
      );

      return false;
    }

    if (
      !form.show_countdown
    ) {
      return true;
    }

    if (
      !form.countdown_start ||
      !form.countdown_end
    ) {
      toast.error(
        "Please select countdown start and end time"
      );

      return false;
    }

    const start =
      new Date(
        form.countdown_start
      ).getTime();

    const end =
      new Date(
        form.countdown_end
      ).getTime();

    if (
      Number.isNaN(start) ||
      Number.isNaN(end)
    ) {
      toast.error(
        "Please enter valid countdown dates"
      );

      return false;
    }

    if (end <= start) {
      toast.error(
        "Countdown end time must be after the start time"
      );

      return false;
    }

    return true;
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      if (editingSection) {
        await updateHomepageSection(
          editingSection.id,
          form
        );

        toast.success(
          "Homepage section updated"
        );
      } else {
        await createHomepageSection(
          form
        );

        toast.success(
          "Homepage section created"
        );
      }

      closeDialog();
      refreshSections();
    } catch {
      toast.error(
        "Failed to save homepage section"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    section: HomepageSection
  ) {
    const confirmed =
      window.confirm(
        `Delete "${section.title}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteHomepageSection(
        section.id
      );

      toast.success(
        "Homepage section deleted"
      );

      refreshSections();
    } catch {
      toast.error(
        "Failed to delete homepage section"
      );
    }
  }

  async function handleToggleActive(
    section: HomepageSection
  ) {
    try {
      await updateHomepageSection(
        section.id,
        {
          section_key:
            section.section_key,
          title:
            section.title,
          subtitle:
            section.subtitle ?? "",
          section_type:
            section.section_type,
          category:
            section.category ?? "All",
          limit_count:
            section.limit_count,
          is_active:
            !section.is_active,
          sort_order:
            section.sort_order,
          show_countdown:
            section.show_countdown ??
            false,
          countdown_start:
            toDateTimeLocalValue(
              section.countdown_start
            ),
          countdown_end:
            toDateTimeLocalValue(
              section.countdown_end
            ),
        }
      );

      toast.success(
        section.is_active
          ? "Section hidden"
          : "Section shown"
      );

      refreshSections();
    } catch {
      toast.error(
        "Failed to update section"
      );
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Homepage Builder
            </h1>

            <p className="mt-2 text-gray-500">
              Control homepage
              sections, titles,
              order, visibility,
              countdowns and
              product collections.
            </p>
          </div>

          <button
            type="button"
            onClick={
              openCreateDialog
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            <Plus size={18} />
            Add Section
          </button>
        </div>

        {isLoading ? (
          <div className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
            Loading homepage
            sections...
          </div>
        ) : sections.length ===
          0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <LayoutTemplate
              className="mx-auto text-gray-400"
              size={44}
            />

            <h2 className="mt-4 text-2xl font-bold">
              No sections yet
            </h2>

            <p className="mt-2 text-gray-500">
              Create your first
              homepage section.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map(
              (
                section,
                index
              ) => (
                <SectionCard
                  key={
                    section.id
                  }
                  section={
                    section
                  }
                  index={index}
                  total={
                    sections.length
                  }
                  moving={
                    movingId ===
                    section.id
                  }
                  onMove={
                    handleMoveSection
                  }
                  onToggle={
                    handleToggleActive
                  }
                  onEdit={
                    openEditDialog
                  }
                  onDelete={
                    handleDelete
                  }
                />
              )
            )}
          </div>
        )}

        {dialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
              <h2 className="text-2xl font-bold">
                {editingSection
                  ? "Edit Section"
                  : "Add Section"}
              </h2>

              <form
                onSubmit={
                  handleSubmit
                }
                className="mt-6 space-y-5"
              >
                <Input
                  label="Section Title"
                  value={form.title}
                  onChange={(
                    value
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        title:
                          value,
                        section_key:
                          editingSection
                            ? current.section_key
                            : generateSectionKey(
                                value
                              ),
                      })
                    )
                  }
                  required
                />

                <Input
                  label="Section Key"
                  value={
                    form.section_key
                  }
                  onChange={(
                    value
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        section_key:
                          generateSectionKey(
                            value
                          ),
                      })
                    )
                  }
                  required
                />

                <Input
                  label="Subtitle"
                  value={
                    form.subtitle
                  }
                  onChange={(
                    value
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        subtitle:
                          value,
                      })
                    )
                  }
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block font-semibold">
                      Section Type
                    </span>

                    <select
                      value={
                        form.section_type
                      }
                      onChange={(
                        event
                      ) =>
                        setForm(
                          (
                            current
                          ) => ({
                            ...current,
                            section_type:
                              event
                                .target
                                .value as HomepageSectionType,
                          })
                        )
                      }
                      className="w-full rounded-xl border p-3 outline-none transition focus:border-green-600"
                    >
                      {sectionTypes.map(
                        (
                          type
                        ) => (
                          <option
                            key={
                              type.value
                            }
                            value={
                              type.value
                            }
                          >
                            {
                              type.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <Input
                    label="Product Limit"
                    value={String(
                      form.limit_count
                    )}
                    type="number"
                    min="1"
                    onChange={(
                      value
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          limit_count:
                            Number(
                              value
                            ),
                        })
                      )
                    }
                    required
                  />
                </div>

                {form.section_type ===
                  "category" && (
                  <label className="block">
                    <span className="mb-2 block font-semibold">
                      Category
                    </span>

                    <select
                      value={
                        form.category
                      }
                      onChange={(
                        event
                      ) =>
                        setForm(
                          (
                            current
                          ) => ({
                            ...current,
                            category:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className="w-full rounded-xl border p-3 outline-none transition focus:border-green-600"
                    >
                      {categories.map(
                        (
                          category
                        ) => (
                          <option
                            key={
                              category
                            }
                            value={
                              category
                            }
                          >
                            {
                              category
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>
                )}

                <Input
                  label="Sort Order"
                  value={String(
                    form.sort_order
                  )}
                  type="number"
                  min="0"
                  onChange={(
                    value
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        sort_order:
                          Number(
                            value
                          ),
                      })
                    )
                  }
                  required
                />

                <CountdownSettings
                  form={form}
                  setForm={setForm}
                />

                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 p-4 font-semibold">
                  <input
                    type="checkbox"
                    checked={
                      form.is_active
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          is_active:
                            event
                              .target
                              .checked,
                        })
                      )
                    }
                    className="h-5 w-5 accent-green-600"
                  />

                  Section visible
                  on homepage
                </label>

                <SectionPreview
                  form={form}
                />

                <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={
                      closeDialog
                    }
                    disabled={
                      saving
                    }
                    className="rounded-xl border px-5 py-3 font-semibold transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving
                    }
                    className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {saving
                      ? "Saving..."
                      : editingSection
                        ? "Save Section"
                        : "Create Section"}
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

function SectionCard({
  section,
  index,
  total,
  moving,
  onMove,
  onToggle,
  onEdit,
  onDelete,
}: {
  section: HomepageSection;
  index: number;
  total: number;
  moving: boolean;
  onMove: (
    index: number,
    direction:
      | "up"
      | "down"
  ) => void;
  onToggle: (
    section: HomepageSection
  ) => void;
  onEdit: (
    section: HomepageSection
  ) => void;
  onDelete: (
    section: HomepageSection
  ) => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 font-bold text-green-700">
          {index + 1}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="break-words text-xl font-bold">
              {section.title}
            </h2>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                section.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {section.is_active
                ? "Visible"
                : "Hidden"}
            </span>
          </div>

          <p className="mt-1 break-words text-sm text-gray-500">
            {section.subtitle ||
              "No subtitle"}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
              Type:{" "}
              {
                section.section_type
              }
            </span>

            {section.category && (
              <span className="rounded-full bg-purple-50 px-3 py-1 text-purple-700">
                Category:{" "}
                {
                  section.category
                }
              </span>
            )}

            <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-700">
              Limit:{" "}
              {
                section.limit_count
              }
            </span>

            {section.show_countdown &&
              section.countdown_end && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-red-700">
                  <Clock3
                    size={12}
                  />
                  Timer enabled
                </span>
              )}

            <span className="max-w-full break-all rounded-full bg-gray-100 px-3 py-1 text-gray-600">
              Key:{" "}
              {
                section.section_key
              }
            </span>
          </div>

          {section.show_countdown &&
            section.countdown_end && (
              <p className="mt-3 text-xs font-medium text-red-600">
                Ends:{" "}
                {new Date(
                  section.countdown_end
                ).toLocaleString()}
              </p>
            )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <ActionButton
          title="Move up"
          disabled={
            index === 0 ||
            moving
          }
          onClick={() =>
            onMove(
              index,
              "up"
            )
          }
        >
          <ArrowUp size={17} />
        </ActionButton>

        <ActionButton
          title="Move down"
          disabled={
            index ===
              total - 1 ||
            moving
          }
          onClick={() =>
            onMove(
              index,
              "down"
            )
          }
        >
          <ArrowDown
            size={17}
          />
        </ActionButton>

        <ActionButton
          title={
            section.is_active
              ? "Hide section"
              : "Show section"
          }
          onClick={() =>
            onToggle(
              section
            )
          }
        >
          {section.is_active ? (
            <EyeOff
              size={17}
            />
          ) : (
            <Eye size={17} />
          )}
        </ActionButton>

        <ActionButton
          title="Edit section"
          onClick={() =>
            onEdit(
              section
            )
          }
        >
          <Edit size={17} />
        </ActionButton>

        <button
          type="button"
          onClick={() =>
            onDelete(
              section
            )
          }
          className="rounded-xl border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
          title="Delete section"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );
}

function CountdownSettings({
  form,
  setForm,
}: {
  form:
    HomepageSectionFormValues;
  setForm:
    React.Dispatch<
      React.SetStateAction<HomepageSectionFormValues>
    >;
}) {
  return (
    <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-orange-50 p-5">
      <label className="flex cursor-pointer items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock3
              size={18}
              className="text-red-500"
            />

            <span className="font-bold text-gray-900">
              Section
              countdown
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Display a live
            timer beside this
            homepage section.
          </p>
        </div>

        <input
          type="checkbox"
          checked={
            form.show_countdown
          }
          onChange={(
            event
          ) =>
            setForm(
              (
                current
              ) => ({
                ...current,
                show_countdown:
                  event.target
                    .checked,
                countdown_start:
                  event.target
                    .checked
                    ? current.countdown_start
                    : "",
                countdown_end:
                  event.target
                    .checked
                    ? current.countdown_end
                    : "",
              })
            )
          }
          className="h-5 w-5 shrink-0 accent-red-500"
        />
      </label>

      {form.show_countdown && (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Input
            label="Countdown Start"
            type="datetime-local"
            value={
              form.countdown_start
            }
            onChange={(
              value
            ) =>
              setForm(
                (
                  current
                ) => ({
                  ...current,
                  countdown_start:
                    value,
                })
              )
            }
            required
          />

          <Input
            label="Countdown End"
            type="datetime-local"
            value={
              form.countdown_end
            }
            min={
              form.countdown_start ||
              undefined
            }
            onChange={(
              value
            ) =>
              setForm(
                (
                  current
                ) => ({
                  ...current,
                  countdown_end:
                    value,
                })
              )
            }
            required
          />
        </div>
      )}
    </div>
  );
}

function SectionPreview({
  form,
}: {
  form:
    HomepageSectionFormValues;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-5">
      <p className="text-sm font-bold text-gray-500">
        Preview
      </p>

      <h3 className="mt-3 text-2xl font-bold">
        {form.title ||
          "Section title"}
      </h3>

      <p className="mt-1 text-gray-500">
        {form.subtitle ||
          "Section subtitle"}
      </p>

      <p className="mt-4 text-sm font-semibold text-green-700">
        {
          form.section_type
        }{" "}
        •{" "}
        {
          form.limit_count
        }{" "}
        products
      </p>

      {form.show_countdown && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-100 px-3 py-2 text-sm font-bold text-red-700">
          <Clock3 size={16} />

          {form.countdown_end
            ? `Countdown ends ${new Date(
                form.countdown_end
              ).toLocaleString()}`
            : "Select countdown time"}
        </div>
      )}
    </div>
  );
}

function ActionButton({
  title,
  disabled = false,
  onClick,
  children,
}: {
  title: string;
  disabled?: boolean;
  onClick: () => void;
  children:
    React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl border p-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      title={title}
    >
      {children}
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  min,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  type?: string;
  min?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-semibold">
        {label}
      </span>

      <input
        type={type}
        value={value}
        min={min}
        required={required}
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border p-3 outline-none transition focus:border-green-600"
      />
    </label>
  );
}