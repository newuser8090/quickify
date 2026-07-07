import { supabase } from "@/lib/supabase";

export type Address = {
  id: number;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string | null;
  is_default: boolean;
};

export async function getAddresses(userId: string) {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data as Address[];
}

export async function addAddress(
  address: Omit<Address, "id">
) {
  const { error } = await supabase
    .from("addresses")
    .insert(address);

  if (error) throw error;
}

export async function updateAddress(
  id: number,
  address: Partial<Address>
) {
  const { error } = await supabase
    .from("addresses")
    .update(address)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteAddress(id: number) {
  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id);

  if (error) throw error;
}