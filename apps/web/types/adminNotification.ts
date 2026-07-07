export type AdminNotificationType =
  | "order"
  | "payment"
  | "stock"
  | "customer"
  | "system";

export type AdminNotification = {
  id: string;
  title: string;
  message: string;
  type: AdminNotificationType;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
};