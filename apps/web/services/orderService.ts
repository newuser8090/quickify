import { supabase } from "@/lib/supabase";
import {
  notifyNewOrder,
  notifyPaymentSuccess,
} from "@/services/adminNotifyService";
import { CartItem } from "@/store/cartStore";

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