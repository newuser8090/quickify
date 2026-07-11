import { supabase } from "@/lib/supabase";

export async function isAdmin(
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error(
      "Admin role check failed:",
      error
    );
    return false;
  }

  return (
    data?.role === "admin" ||
    data?.role === "creator"
  );
}