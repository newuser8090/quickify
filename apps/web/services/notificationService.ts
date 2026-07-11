import { supabase } from "@/lib/supabase";

export type UserNotification = {
  id: number;
  user_id: string;
  type: "order" | "coupon" | "system" | "stock";
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};
export async function createUserNotification(payload: {
  userId: string;
  type: UserNotification["type"];
  title: string;
  message: string;
  link?: string | null;
}) {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      link: payload.link ?? null,
      is_read: false,
    })
    .select()
    .single();

  if (error) throw error;

  return data as UserNotification;
}
export async function getUserNotifications(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) throw error;

  return data as UserNotification[];
}

export async function markNotificationAsRead(id: number) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);

  if (error) throw error;
}

export async function markAllNotificationsAsRead(userId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw error;
}

export async function clearReadNotifications(userId: string) {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", userId)
    .eq("is_read", true);

  if (error) throw error;
}