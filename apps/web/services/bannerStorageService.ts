import { supabase } from "@/lib/supabase";

export async function uploadBannerImage(file: File) {
  const fileExt = file.name.split(".").pop();
  const fileName = `banner-${Date.now()}.${fileExt}`;
  const filePath = `banners/${fileName}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}