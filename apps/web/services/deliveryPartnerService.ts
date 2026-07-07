import { supabase } from "@/lib/supabase";

export type DeliveryPartnerStatus =
  | "Available"
  | "Busy"
  | "Inactive";

export type DeliveryPartner = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  vehicle_type: string;
  vehicle_number: string | null;
  status: DeliveryPartnerStatus;
  created_at: string;
};

export type DeliveryPartnerForm = {
  name: string;
  phone: string;
  email?: string;
  vehicle_type: string;
  vehicle_number?: string;
};

export async function getDeliveryPartners() {
  const { data, error } = await supabase
    .from("delivery_partners")
    .select("*")
    .order("name");

  if (error) throw error;

  return (data ?? []) as DeliveryPartner[];
}

export async function createDeliveryPartner(
  values: DeliveryPartnerForm
) {
  const { error } = await supabase
    .from("delivery_partners")
    .insert({
      ...values,
      status: "Available",
    });

  if (error) throw error;
}

export async function updateDeliveryPartner(
  id: string,
  values: DeliveryPartnerForm
) {
  const { error } = await supabase
    .from("delivery_partners")
    .update(values)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteDeliveryPartner(id: string) {
  const { error } = await supabase
    .from("delivery_partners")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function updatePartnerStatus(
  id: string,
  status: DeliveryPartnerStatus
) {
  const { error } = await supabase
    .from("delivery_partners")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}

export async function assignDeliveryPartner(
  orderId: number,
  partnerId: string
) {
  const { error } = await supabase
    .from("orders")
    .update({
      delivery_partner_id: partnerId,
      delivery_assigned_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) throw error;

  await updatePartnerStatus(partnerId, "Busy");
}
export async function releaseDeliveryPartner(partnerId: string) {
  const { error } = await supabase
    .from("delivery_partners")
    .update({ status: "Available" })
    .eq("id", partnerId);

  if (error) throw error;
}