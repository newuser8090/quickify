import { createAdminNotification } from "@/services/adminNotificationService";

type OrderNotifyInput = {
  id: number | string;
};

type StockNotifyInput = {
  productId: number;
  variantId?: number | null;
  productName: string;
  variantName?: string | null;
  stock: number;
};

export async function notifyNewOrder(order: OrderNotifyInput) {
  try {
    await createAdminNotification({
      title: "New Order",
      message: `A new order has been placed: ${order.id}`,
      type: "order",
      reference_id: String(order.id),
    });
  } catch (error) {
    console.warn("New order admin notification failed:", error);
  }
}

export async function notifyPaymentSuccess(order: OrderNotifyInput) {
  try {
    await createAdminNotification({
      title: "Payment Successful",
      message: `Payment received for order: ${order.id}`,
      type: "payment",
      reference_id: String(order.id),
    });
  } catch (error) {
    console.warn("Payment admin notification failed:", error);
  }
}

export async function notifyLowStock(input: StockNotifyInput) {
  try {
    await createAdminNotification({
      title: input.stock === 0 ? "Out of Stock" : "Low Stock Alert",
      message: input.variantName
        ? `${input.productName} (${input.variantName}) has only ${input.stock} left in stock.`
        : `${input.productName} has only ${input.stock} left in stock.`,
      type: "stock",
      reference_id: String(input.variantId ?? input.productId),
    });
  } catch (error) {
    console.warn("Low stock admin notification failed:", error);
  }
}