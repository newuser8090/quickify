import { supabase } from "@/lib/supabase";

export type SalesReportFilters = {
  fromDate: string;
  toDate: string;
};

export type SalesReportSummary = {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  codOrders: number;
  averageOrderValue: number;
};

export type DailySalesRow = {
  date: string;
  revenue: number;
  orders: number;
};

export type PaymentMethodRow = {
  method: string;
  orders: number;
  revenue: number;
};

export type TopProductRow = {
  productId: number;
  productName: string;
  quantitySold: number;
  revenue: number;
};

type SalesOrderRow = {
  id: number;
  total: number | null;
  payment_method: string | null;
  payment_status: string | null;
  created_at: string;
  order_items:
    | {
        product_id: number | null;
        name: string;
        price: number | null;
        quantity: number | null;
      }[]
    | null;
};

export async function getSalesReport(filters: SalesReportFilters) {
  const from = `${filters.fromDate}T00:00:00`;
  const to = `${filters.toDate}T23:59:59`;

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(
      `
      id,
      total,
      payment_method,
      payment_status,
      created_at,
      order_items(
        product_id,
        name,
        price,
        quantity
      )
    `
    )
    .gte("created_at", from)
    .lte("created_at", to)
    .order("created_at", { ascending: true });

  if (ordersError) throw ordersError;

  const safeOrders = (orders ?? []) as SalesOrderRow[];

  const totalOrders = safeOrders.length;

  const paidOrders = safeOrders.filter(
    (order) => order.payment_status?.toLowerCase() === "paid"
  ).length;

  const codOrders = safeOrders.filter(
    (order) => order.payment_method === "Cash on Delivery"
  ).length;

  const totalRevenue = safeOrders.reduce(
    (sum, order) => sum + Number(order.total ?? 0),
    0
  );

  const averageOrderValue =
    totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const dailyMap = new Map<string, DailySalesRow>();
  const productMap = new Map<number, TopProductRow>();
  const paymentMap = new Map<string, PaymentMethodRow>();

  for (const order of safeOrders) {
    const date = new Date(order.created_at).toISOString().slice(0, 10);
    const orderTotal = Number(order.total ?? 0);

    const existingDaily = dailyMap.get(date) ?? {
      date,
      revenue: 0,
      orders: 0,
    };

    existingDaily.revenue += orderTotal;
    existingDaily.orders += 1;
    dailyMap.set(date, existingDaily);

    const paymentMethod = order.payment_method ?? "Unknown";

    const existingPayment = paymentMap.get(paymentMethod) ?? {
      method: paymentMethod,
      orders: 0,
      revenue: 0,
    };

    existingPayment.orders += 1;
    existingPayment.revenue += orderTotal;
    paymentMap.set(paymentMethod, existingPayment);

    for (const item of order.order_items ?? []) {
      const productId = Number(item.product_id);
      const quantity = Number(item.quantity ?? 0);
      const price = Number(item.price ?? 0);

      const existingProduct = productMap.get(productId) ?? {
        productId,
        productName: item.name,
        quantitySold: 0,
        revenue: 0,
      };

      existingProduct.quantitySold += quantity;
      existingProduct.revenue += price * quantity;

      productMap.set(productId, existingProduct);
    }
  }

  const summary: SalesReportSummary = {
    totalRevenue,
    totalOrders,
    paidOrders,
    codOrders,
    averageOrderValue,
  };

  const dailySales = Array.from(dailyMap.values());

  const topProducts = Array.from(productMap.values()).sort(
    (a, b) => b.quantitySold - a.quantitySold
  );

  const paymentMethods = Array.from(paymentMap.values()).sort(
    (a, b) => b.revenue - a.revenue
  );

  return {
    summary,
    dailySales,
    topProducts,
    paymentMethods,
    orders: safeOrders,
  };
}