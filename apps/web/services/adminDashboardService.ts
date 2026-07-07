import { supabase } from "@/lib/supabase";

type DashboardOrderItem = {
  id: number;
  name: string;
  price: number | null;
  quantity: number | null;
};

type DashboardOrder = {
  id: number;
  total: number | null;
  user_id: string | null;
  status: string;
  payment_method: string | null;
  payment_status: string | null;
  created_at: string;
  order_items: DashboardOrderItem[] | null;
};

type LowStockProduct = {
  id: number;
  name: string;
  stock: number | null;
};

export type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  todayRevenue: number;
  todayOrders: number;
  averageOrderValue: number;
  codOrders: number;
  onlineOrders: number;
  paidOrders: number;
  pendingPayments: number;
  recentOrders: DashboardOrder[];
  lowStockProducts: LowStockProduct[];
  bestSellingProducts: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
  revenueByDay: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  orderStatusData: {
    name: string;
    value: number;
  }[];
  paymentMethodData: {
    name: string;
    value: number;
  }[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [ordersResult, productsResult, lowStockResult] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "id, total, user_id, status, payment_method, payment_status, created_at, order_items(*)"
      )
      .order("created_at", { ascending: false }),

    supabase.from("products").select("id", { count: "exact", head: true }),

    supabase
      .from("products")
      .select("id, name, stock")
      .lte("stock", 20)
      .order("stock", { ascending: true })
      .limit(8),
  ]);

  if (ordersResult.error) throw ordersResult.error;
  if (productsResult.error) throw productsResult.error;
  if (lowStockResult.error) throw lowStockResult.error;

  const orders = (ordersResult.data ?? []) as DashboardOrder[];
  const lowStockProducts = (lowStockResult.data ?? []) as LowStockProduct[];

  const today = new Date().toDateString();

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.total ?? 0),
    0
  );

  const todayOrdersList = orders.filter(
    (order) => new Date(order.created_at).toDateString() === today
  );

  const todayRevenue = todayOrdersList.reduce(
    (sum, order) => sum + Number(order.total ?? 0),
    0
  );

  const uniqueCustomers = new Set(orders.map((order) => order.user_id)).size;

  const revenueMap = new Map<string, { revenue: number; orders: number }>();
  const statusMap = new Map<string, number>();
  const paymentMethodMap = new Map<string, number>();
  const productMap = new Map<string, { quantity: number; revenue: number }>();

  let codOrders = 0;
  let onlineOrders = 0;
  let paidOrders = 0;
  let pendingPayments = 0;

  orders.forEach((order) => {
    const date = new Date(order.created_at).toLocaleDateString();

    const existingDay = revenueMap.get(date) ?? { revenue: 0, orders: 0 };

    revenueMap.set(date, {
      revenue: existingDay.revenue + Number(order.total ?? 0),
      orders: existingDay.orders + 1,
    });

    statusMap.set(order.status, (statusMap.get(order.status) ?? 0) + 1);

    const paymentMethod = order.payment_method ?? "Unknown";

    paymentMethodMap.set(
      paymentMethod,
      (paymentMethodMap.get(paymentMethod) ?? 0) + 1
    );

    if (paymentMethod === "Cash on Delivery") codOrders += 1;
    if (paymentMethod === "Online") onlineOrders += 1;

    if (order.payment_status === "Paid") paidOrders += 1;
    if (order.payment_status === "Pending") pendingPayments += 1;

    order.order_items?.forEach((item) => {
      const existing = productMap.get(item.name) ?? {
        quantity: 0,
        revenue: 0,
      };

      productMap.set(item.name, {
        quantity: existing.quantity + Number(item.quantity ?? 0),
        revenue:
          existing.revenue +
          Number(item.price ?? 0) * Number(item.quantity ?? 0),
      });
    });
  });

  return {
    totalRevenue,
    totalOrders: orders.length,
    totalProducts: productsResult.count ?? 0,
    totalCustomers: uniqueCustomers,
    todayRevenue,
    todayOrders: todayOrdersList.length,
    averageOrderValue:
      orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0,
    codOrders,
    onlineOrders,
    paidOrders,
    pendingPayments,
    recentOrders: orders.slice(0, 6),
    lowStockProducts,
    bestSellingProducts: Array.from(productMap.entries())
      .map(([name, value]) => ({
        name,
        ...value,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6),
    revenueByDay: Array.from(revenueMap.entries()).map(([date, value]) => ({
      date,
      revenue: value.revenue,
      orders: value.orders,
    })),
    orderStatusData: Array.from(statusMap.entries()).map(([name, value]) => ({
      name,
      value,
    })),
    paymentMethodData: Array.from(paymentMethodMap.entries()).map(
      ([name, value]) => ({
        name,
        value,
      })
    ),
  };
}