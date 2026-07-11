import { supabase } from "@/lib/supabase";

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  emoji: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string | null;
};

export type CategoryFormValues = {
  name: string;
  slug: string;
  description: string;
  image: string;
  emoji: string;
  is_active: boolean;
  sort_order: number;
};

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw error;

  return (data ?? []) as Category[];
}

export async function createCategory(values: CategoryFormValues) {
  const { error } = await supabase.from("categories").insert({
    name: values.name,
    slug: values.slug,
    description: values.description || null,
    image: values.image || null,
    emoji: values.emoji || null,
    is_active: values.is_active,
    sort_order: values.sort_order,
  });

  if (error) throw error;
}

export async function updateCategory(id: number, values: CategoryFormValues) {
  const { error } = await supabase
    .from("categories")
    .update({
      name: values.name,
      slug: values.slug,
      description: values.description || null,
      image: values.image || null,
      emoji: values.emoji || null,
      is_active: values.is_active,
      sort_order: values.sort_order,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function updateCategoryOrder(id: number, sortOrder: number) {
  const { error } = await supabase
    .from("categories")
    .update({ sort_order: sortOrder })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteCategory(id: number) {
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) throw error;
}