import { supabase } from "@/lib/supabase";
import {
  notifyNewOrder,
  notifyPaymentSuccess,
} from "@/services/adminNotifyService";
import { CartItem } from "@/store/cartStore";
import { createUserNotification } from "@/services/notificationService";


type CreateOrderInput = {
  userId: string;
  addressId: number;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  deliverySlot?: string;
};

export async function createOrder({
  userId,
  addressId,
  items,
  subtotal,
  deliveryFee,
  platformFee,
  discount,
  total,
  paymentMethod,
  paymentStatus = "Pending",
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  deliverySlot,
}: CreateOrderInput) {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      address_id: addressId,
      subtotal,
      delivery_fee: deliveryFee,
      platform_fee: platformFee,
      discount,
      total,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      razorpay_order_id: razorpayOrderId ?? null,
      razorpay_payment_id: razorpayPaymentId ?? null,
      razorpay_signature: razorpaySignature ?? null,
      delivery_slot: deliverySlot ?? null,
      status: "Placed",
    })
    .select("id")
    .single();

  if (orderError) throw orderError;

  await notifyNewOrder(order);

  if (paymentStatus.toLowerCase() === "paid") {
    await notifyPaymentSuccess(order);
  }

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    variant_id: item.variantId ?? null,
    variant_name: item.variantName ?? null,
    name: item.name,
    unit: item.unit,
    price: item.price,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    
    .insert(orderItems);
    

  if (itemsError) throw itemsError;
  await createUserNotification({
  userId,
  type: "order",
  title: "Order Placed",
  message: `Your order #${order.id} has been placed successfully.`,
  link: `/orders/${order.id}`,
});
if (paymentStatus.toLowerCase() === "paid") {
  await createUserNotification({
    userId,
    type: "order",
    title: "Payment Successful",
    message: `Payment for order #${order.id} was completed successfully.`,
    link: `/orders/${order.id}`,
  });
}

  for (const item of items) {
    if (item.variantId) {
      const { data: variant } = await supabase
        .from("product_variants")
        .select("stock")
        .eq("id", item.variantId)
        .single();

      if (variant) {
        await supabase
          .from("product_variants")
          .update({
            stock: Math.max(0, variant.stock - item.quantity),
          })
          .eq("id", item.variantId);
      }
    } else {
      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.id)
        .single();

      if (product) {
        await supabase
          .from("products")
          .update({
            stock: Math.max(0, product.stock - item.quantity),
          })
          .eq("id", item.id);
      }
    }
  }

  return order.id as number;
}

export async function getOrders(userId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      addresses(*),
      order_items(
        *,
        product:products(*),
        variant:product_variants(*)
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getOrder(orderId: number) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      addresses(*),
      order_items(
        *,
        product:products(*),
        variant:product_variants(*)
      )
    `
    )
    .eq("id", orderId)
    .single();

  if (error) throw error;

  return data;
}
export async function requestOrderReturn(
  orderId: number,
  reason: string
) {
  const normalizedReason = reason.trim();

  if (normalizedReason.length < 5) {
    throw new Error(
      "Please enter a return reason of at least 5 characters."
    );
  }

  const { error } = await supabase.rpc(
    "request_order_return",
    {
      target_order_id: orderId,
      reason_text: normalizedReason,
    }
  );

  if (error) {
    throw new Error(
      error.message ||
        "The return request could not be submitted."
    );
  }
}