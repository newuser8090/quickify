import { supabase } from "@/lib/supabase";
import type {
  AdminNotification,
  AdminNotificationType,
} from "@/types/adminNotification";

export async function getAdminNotifications() {
  const { data, error } = await supabase
    .from("admin_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) throw error;

  return data as AdminNotification[];
}

export async function createAdminNotification(payload: {
  title: string;
  message: string;
  type: AdminNotificationType;
  reference_id?: string | null;
}) {
  const { data, error } = await supabase
    .from("admin_notifications")
    .insert({
      title: payload.title,
      message: payload.message,
      type: payload.type,
      reference_id: payload.reference_id ?? null,
    })
    .select()
    .single();

  if (error) {
  throw {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  };
}

  return data as AdminNotification;
}

export async function markAdminNotificationAsRead(id: string) {
  const { error } = await supabase
    .from("admin_notifications")
    .update({ is_read: true })
    .eq("id", id);

  if (error) throw error;
}

export async function markAllAdminNotificationsAsRead() {
  const { error } = await supabase
    .from("admin_notifications")
    .update({ is_read: true })
    .eq("is_read", false);

  if (error) throw error;
}

export async function clearReadAdminNotifications() {
  const { error } = await supabase
    .from("admin_notifications")
    .delete()
    .eq("is_read", true);

  if (error) throw error;
}