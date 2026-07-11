import { supabase } from "@/lib/supabase";

export async function uploadCategoryIcon(file: File) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("category-icons")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("category-icons")
    .getPublicUrl(fileName);

  return data.publicUrl;
}