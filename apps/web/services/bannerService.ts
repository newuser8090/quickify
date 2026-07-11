import { supabase } from "@/lib/supabase";

export type BannerType = "designed" | "image";

export type Banner = {
  id: number;
  type: BannerType;
  title: string | null;
  subtitle: string | null;
  background_class: string | null;
  floating_icons: string[];
  main_icon: string | null;
  image_url: string | null;
  mobile_image_url: string | null;
  button_text: string;
  button_color_class: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
  views: number;
  clicks: number;
  created_at: string | null;
};

export type BannerFormValues = {
  type: BannerType;
  title: string;
  subtitle: string;
  background_class: string;
  floating_icons: string[];
  main_icon: string;
  image_url: string;
  mobile_image_url: string;
  button_text: string;
  button_color_class: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  starts_at: string;
  ends_at: string;
};

export async function getActiveBanners() {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data ?? []) as Banner[];
}

export async function getAdminBanners() {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data ?? []) as Banner[];
}

export async function createBanner(values: BannerFormValues) {
  const { error } = await supabase.from("banners").insert({
    type: values.type,
    title: values.type === "designed" ? values.title : null,
    subtitle: values.type === "designed" ? values.subtitle : null,
    background_class:
      values.type === "designed" ? values.background_class : null,
    floating_icons: values.type === "designed" ? values.floating_icons : [],
    main_icon: values.type === "designed" ? values.main_icon : null,
    image_url: values.type === "image" ? values.image_url : null,
    mobile_image_url:
      values.type === "image" && values.mobile_image_url
        ? values.mobile_image_url
        : null,
    button_text: values.button_text,
    button_color_class: values.button_color_class,
    category: values.category,
    is_active: values.is_active,
    sort_order: values.sort_order,
    starts_at: values.starts_at || null,
    ends_at: values.ends_at || null,
  });

  if (error) throw error;
}

export async function updateBanner(id: number, values: BannerFormValues) {
  const { error } = await supabase
    .from("banners")
    .update({
      type: values.type,
      title: values.type === "designed" ? values.title : null,
      subtitle: values.type === "designed" ? values.subtitle : null,
      background_class:
        values.type === "designed" ? values.background_class : null,
      floating_icons: values.type === "designed" ? values.floating_icons : [],
      main_icon: values.type === "designed" ? values.main_icon : null,
      image_url: values.type === "image" ? values.image_url : null,
      mobile_image_url:
        values.type === "image" && values.mobile_image_url
          ? values.mobile_image_url
          : null,
      button_text: values.button_text,
      button_color_class: values.button_color_class,
      category: values.category,
      is_active: values.is_active,
      sort_order: values.sort_order,
      starts_at: values.starts_at || null,
      ends_at: values.ends_at || null,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteBanner(id: number) {
  const { error } = await supabase.from("banners").delete().eq("id", id);

  if (error) throw error;
}

export async function incrementBannerViews(id: number) {
  const { error } = await supabase.rpc("increment_banner_views", {
    banner_id: id,
  });

  if (error) throw error;
}

export async function incrementBannerClicks(id: number) {
  const { error } = await supabase.rpc("increment_banner_clicks", {
    banner_id: id,
  });

  if (error) throw error;
}