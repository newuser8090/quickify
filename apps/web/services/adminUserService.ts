import { supabase } from "@/lib/supabase";

export type AdminUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  created_at: string | null;
};

export type AdminUserOrder = {
  id: number;
  total: number;
  status: string;
  payment_method: string;
  payment_status: string | null;
  refund_status: string | null;
  refund_amount: number | null;
  created_at: string;
};

export type AdminUserAddress = {
  id: number;
  label: string | null;
  full_name: string | null;
  phone: string | null;
  address_line: string | null;
  landmark: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
};

export type AdminUserWishlistItem = {
  id: number;
  product?: {
    id: number;
    name: string;
    price: number;
    image: string | null;
  } | null;
};

export type AdminUserStats = AdminUser & {
  order_count: number;
  total_spent: number;
  address_count: number;
  wishlist_count: number;
  last_order_date: string | null;
  orders: AdminUserOrder[];
  addresses: AdminUserAddress[];
  wishlist_items: AdminUserWishlistItem[];
};

function getOrderNetRevenue(order: AdminUserOrder) {
  const status = order.status?.toLowerCase() ?? "";
  const paymentStatus =
    order.payment_status?.toLowerCase() ?? "";
  const refundStatus =
    order.refund_status?.toLowerCase() ?? "";

  const countsAsRevenue =
    status !== "cancelled" &&
    paymentStatus === "paid";

  if (!countsAsRevenue) {
    return 0;
  }

  const grossAmount = Number(order.total ?? 0);

  const refundedAmount =
    refundStatus === "refunded"
      ? Number(order.refund_amount ?? 0)
      : 0;

  return Math.max(0, grossAmount - refundedAmount);
}

export async function getAdminUsers() {
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (usersError) throw usersError;

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      total,
      status,
      payment_method,
      payment_status,
      refund_status,
      refund_amount,
      created_at
      `
    )
    .order("created_at", { ascending: false });

  if (ordersError) throw ordersError;

  const { data: addresses, error: addressError } = await supabase
    .from("addresses")
    .select("*");

  if (addressError) throw addressError;

  const { data: wishlistItems, error: wishlistError } = await supabase
    .from("wishlist_items")
    .select(
      `
      id,
      user_id,
      product:products(
        id,
        name,
        price,
        image
      )
      `
    );

  if (wishlistError) throw wishlistError;

  return (users ?? []).map((user) => {
    const userOrders = (orders ?? []).filter(
      (order) => order.user_id === user.id
    ) as AdminUserOrder[];

    const userAddresses = (addresses ?? []).filter(
      (address) => address.user_id === user.id
    );

    const userWishlist = (wishlistItems ?? []).filter(
      (item) => item.user_id === user.id
    );

    const totalSpent = userOrders.reduce(
      (sum, order) => sum + getOrderNetRevenue(order),
      0
    );

    return {
      ...user,
      order_count: userOrders.length,
      total_spent: totalSpent,
      address_count: userAddresses.length,
      wishlist_count: userWishlist.length,
      last_order_date: userOrders[0]?.created_at ?? null,
      orders: userOrders,
      addresses: userAddresses,
      wishlist_items: userWishlist,
    };
  }) as AdminUserStats[];
}

export async function updateUserRole(
  userId: string,
  role: "customer" | "admin"
) {
  const { error } = await supabase.rpc("set_user_role", {
    target_user_id: userId,
    new_role: role,
  });

  if (error) throw error;
}
