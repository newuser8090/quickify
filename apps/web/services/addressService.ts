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
  latitude: number | null;
  longitude: number | null;
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

export async function addAddress(address: Omit<Address, "id">) {
  const { error } = await supabase.from("addresses").insert({
    user_id: address.user_id,
    label: address.label,
    full_name: address.full_name,
    phone: address.phone,
    address_line: address.address_line,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    landmark: address.landmark,
    is_default: address.is_default,
    latitude: address.latitude ?? null,
    longitude: address.longitude ?? null,
  });

  if (error) throw error;
}

export async function updateAddress(
  id: number,
  address: Partial<Address>
) {
  const { error } = await supabase
    .from("addresses")
    .update({
      ...address,
      latitude: address.latitude ?? null,
      longitude: address.longitude ?? null,
    })
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