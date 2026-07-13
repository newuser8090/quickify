import { supabase } from "@/lib/supabase";

export type HomepageSectionType =
  | "all"
  | "featured"
  | "bestseller"
  | "discounted"
  | "new"
  | "top_rated"
  | "category"
  | "recently_viewed"
  | "recently_purchased";

export type HomepageSection = {
  id: number;
  section_key: string;
  title: string;
  subtitle: string | null;
  section_type: HomepageSectionType;
  category: string | null;
  limit_count: number;
  is_active: boolean;
  sort_order: number;
  show_countdown: boolean;
  countdown_start: string | null;
  countdown_end: string | null;
  created_at: string | null;
};

export type HomepageSectionFormValues = {
  section_key: string;
  title: string;
  subtitle: string;
  section_type: HomepageSectionType;
  category: string;
  limit_count: number;
  is_active: boolean;
  sort_order: number;
  show_countdown: boolean;
  countdown_start: string;
  countdown_end: string;
};

function normalizeCountdownDate(
  value: string
) {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}

function createSectionPayload(
  values: HomepageSectionFormValues
) {
  return {
    section_key: values.section_key,
    title: values.title,
    subtitle:
      values.subtitle || null,
    section_type:
      values.section_type,
    category:
      values.section_type ===
      "category"
        ? values.category
        : null,
    limit_count:
      values.limit_count,
    is_active:
      values.is_active,
    sort_order:
      values.sort_order,
    show_countdown:
      values.show_countdown,
    countdown_start:
      values.show_countdown
        ? normalizeCountdownDate(
            values.countdown_start
          )
        : null,
    countdown_end:
      values.show_countdown
        ? normalizeCountdownDate(
            values.countdown_end
          )
        : null,
  };
}

export async function getActiveHomepageSections() {
  const { data, error } =
    await supabase
      .from(
        "homepage_sections"
      )
      .select("*")
      .eq(
        "is_active",
        true
      )
      .order(
        "sort_order",
        {
          ascending: true,
        }
      );

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ) as HomepageSection[];
}

export async function getAdminHomepageSections() {
  const { data, error } =
    await supabase
      .from(
        "homepage_sections"
      )
      .select("*")
      .order(
        "sort_order",
        {
          ascending: true,
        }
      );

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ) as HomepageSection[];
}

export async function createHomepageSection(
  values: HomepageSectionFormValues
) {
  const { error } =
    await supabase
      .from(
        "homepage_sections"
      )
      .insert(
        createSectionPayload(
          values
        )
      );

  if (error) {
    throw error;
  }
}

export async function updateHomepageSection(
  id: number,
  values: HomepageSectionFormValues
) {
  const { error } =
    await supabase
      .from(
        "homepage_sections"
      )
      .update(
        createSectionPayload(
          values
        )
      )
      .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteHomepageSection(
  id: number
) {
  const { error } =
    await supabase
      .from(
        "homepage_sections"
      )
      .delete()
      .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function updateHomepageSectionOrder(
  id: number,
  sortOrder: number
) {
  const { error } =
    await supabase
      .from(
        "homepage_sections"
      )
      .update({
        sort_order:
          sortOrder,
      })
      .eq("id", id);

  if (error) {
    throw error;
  }
}