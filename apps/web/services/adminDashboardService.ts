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
  refund_status: string | null;
  refund_amount: number | null;
  created_at: string;
  order_items: DashboardOrderItem[] | null;
};

type LowStockProduct = {
  id: number;
  name: string;
  stock: number | null;
};

export type DashboardStats = {
  grossRevenue: number;
  refundedAmount: number;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  todayGrossRevenue: number;
  todayRefundedAmount: number;
  todayRevenue: number;
  todayOrders: number;
  averageOrderValue: number;
  codOrders: number;
  onlineOrders: number;
  paidOrders: number;
  pendingPayments: number;
  refundedOrders: number;
  recentOrders: DashboardOrder[];
  lowStockProducts: LowStockProduct[];
  bestSellingProducts: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
  revenueByDay: {
    date: string;
    grossRevenue: number;
    refundedAmount: number;
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

function isPaidNonCancelledOrder(order: DashboardOrder) {
  const status = order.status?.toLowerCase() ?? "";
  const paymentStatus =
    order.payment_status?.toLowerCase() ?? "";

  return (
    status !== "cancelled" &&
    paymentStatus === "paid"
  );
}

function getCompletedRefundAmount(order: DashboardOrder) {
  const refundStatus =
    order.refund_status?.toLowerCase() ?? "";

  if (refundStatus !== "refunded") {
    return 0;
  }

  return Math.max(
    0,
    Number(order.refund_amount ?? 0)
  );
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    ordersResult,
    productsResult,
    lowStockResult,
    usersResult,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select(
        `
        id,
        total,
        user_id,
        status,
        payment_method,
        payment_status,
        refund_status,
        refund_amount,
        created_at,
        order_items (
          id,
          name,
          price,
          quantity
        )
        `
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("products")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("products")
      .select("id, name, stock")
      .lte("stock", 20)
      .order("stock", { ascending: true })
      .limit(8),

    supabase
      .from("users")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("role", "customer"),
  ]);

  if (ordersResult.error) throw ordersResult.error;
  if (productsResult.error) throw productsResult.error;
  if (lowStockResult.error) throw lowStockResult.error;
  if (usersResult.error) throw usersResult.error;

  const orders =
    (ordersResult.data ?? []) as DashboardOrder[];

  const lowStockProducts =
    (lowStockResult.data ?? []) as LowStockProduct[];

  const today = new Date().toDateString();

  const paidOrdersList = orders.filter(
    isPaidNonCancelledOrder
  );

  const grossRevenue = paidOrdersList.reduce(
    (sum, order) =>
      sum + Number(order.total ?? 0),
    0
  );

  const refundedAmount = paidOrdersList.reduce(
    (sum, order) =>
      sum + getCompletedRefundAmount(order),
    0
  );

  const totalRevenue = Math.max(
    0,
    grossRevenue - refundedAmount
  );

  const todayOrdersList = orders.filter(
    (order) =>
      new Date(order.created_at).toDateString() ===
      today
  );

  const todayPaidOrders = paidOrdersList.filter(
    (order) =>
      new Date(order.created_at).toDateString() ===
      today
  );

  const todayGrossRevenue =
    todayPaidOrders.reduce(
      (sum, order) =>
        sum + Number(order.total ?? 0),
      0
    );

  const todayRefundedAmount =
    todayPaidOrders.reduce(
      (sum, order) =>
        sum + getCompletedRefundAmount(order),
      0
    );

  const todayRevenue = Math.max(
    0,
    todayGrossRevenue - todayRefundedAmount
  );

  const revenueMap = new Map<
    string,
    {
      grossRevenue: number;
      refundedAmount: number;
      orders: number;
    }
  >();

  const statusMap = new Map<string, number>();
  const paymentMethodMap =
    new Map<string, number>();

  const productMap = new Map<
    string,
    {
      quantity: number;
      revenue: number;
    }
  >();

  let codOrders = 0;
  let onlineOrders = 0;
  let paidOrders = 0;
  let pendingPayments = 0;
  let refundedOrders = 0;

  orders.forEach((order) => {
    const date = new Date(order.created_at)
      .toISOString()
      .slice(0, 10);

    const normalizedStatus =
      order.status?.toLowerCase() ?? "unknown";

    const paymentMethod =
      order.payment_method ?? "Unknown";

    const normalizedPaymentMethod =
      paymentMethod.toLowerCase();

    const normalizedPaymentStatus =
      order.payment_status?.toLowerCase() ??
      "pending";

    const normalizedRefundStatus =
      order.refund_status?.toLowerCase() ??
      "none";

    const isCancelled =
      normalizedStatus === "cancelled";

    const isCashOnDelivery =
      normalizedPaymentMethod ===
        "cash on delivery" ||
      normalizedPaymentMethod === "cod";

    const isOnlineOrder =
      normalizedPaymentMethod === "online";

    const countsAsPaidRevenue =
      !isCancelled &&
      normalizedPaymentStatus === "paid";

    const orderGrossRevenue =
      countsAsPaidRevenue
        ? Number(order.total ?? 0)
        : 0;

    const orderRefundAmount =
      countsAsPaidRevenue
        ? getCompletedRefundAmount(order)
        : 0;

    const existingDay =
      revenueMap.get(date) ?? {
        grossRevenue: 0,
        refundedAmount: 0,
        orders: 0,
      };

    revenueMap.set(date, {
      grossRevenue:
        existingDay.grossRevenue +
        orderGrossRevenue,
      refundedAmount:
        existingDay.refundedAmount +
        orderRefundAmount,
      orders: existingDay.orders + 1,
    });

    const statusLabel =
      order.status ?? "Unknown";

    statusMap.set(
      statusLabel,
      (statusMap.get(statusLabel) ?? 0) + 1
    );

    paymentMethodMap.set(
      paymentMethod,
      (paymentMethodMap.get(paymentMethod) ??
        0) + 1
    );

    if (isCashOnDelivery) {
      codOrders += 1;
    }

    if (isOnlineOrder) {
      onlineOrders += 1;
    }

    if (
      normalizedPaymentStatus === "paid" &&
      !isCancelled
    ) {
      paidOrders += 1;
    }

    if (
      normalizedPaymentStatus === "pending" &&
      !isCancelled
    ) {
      pendingPayments += 1;
    }

    if (
      normalizedRefundStatus === "refunded"
    ) {
      refundedOrders += 1;
    }

    if (countsAsPaidRevenue) {
      const total = Number(order.total ?? 0);

      const refundRatio =
        total > 0
          ? Math.max(
              0,
              Math.min(
                1,
                orderRefundAmount / total
              )
            )
          : 0;

      order.order_items?.forEach((item) => {
        const quantity = Number(
          item.quantity ?? 0
        );

        const price = Number(item.price ?? 0);

        const itemGrossRevenue =
          price * quantity;

        const itemNetRevenue =
          itemGrossRevenue *
          (1 - refundRatio);

        const itemNetQuantity =
          quantity * (1 - refundRatio);

        const existing =
          productMap.get(item.name) ?? {
            quantity: 0,
            revenue: 0,
          };

        productMap.set(item.name, {
          quantity:
            existing.quantity +
            itemNetQuantity,
          revenue:
            existing.revenue +
            itemNetRevenue,
        });
      });
    }
  });

  const averageOrderValue =
    paidOrdersList.length > 0
      ? Math.round(
          totalRevenue /
            paidOrdersList.length
        )
      : 0;

  return {
    grossRevenue,
    refundedAmount,
    totalRevenue,
    totalOrders: orders.length,
    totalProducts:
      productsResult.count ?? 0,
    totalCustomers:
      usersResult.count ?? 0,
    todayGrossRevenue,
    todayRefundedAmount,
    todayRevenue,
    todayOrders: todayOrdersList.length,
    averageOrderValue,
    codOrders,
    onlineOrders,
    paidOrders,
    pendingPayments,
    refundedOrders,
    recentOrders: orders.slice(0, 6),
    lowStockProducts,
    bestSellingProducts: Array.from(
      productMap.entries()
    )
      .map(([name, value]) => ({
        name,
        quantity: Math.round(
          value.quantity * 100
        ) / 100,
        revenue: Math.round(
          value.revenue
        ),
      }))
      .sort(
        (firstProduct, secondProduct) =>
          secondProduct.quantity -
          firstProduct.quantity
      )
      .slice(0, 6),
    revenueByDay: Array.from(
      revenueMap.entries()
    )
      .map(([date, value]) => ({
        date,
        grossRevenue:
          value.grossRevenue,
        refundedAmount:
          value.refundedAmount,
        revenue: Math.max(
          0,
          value.grossRevenue -
            value.refundedAmount
        ),
        orders: value.orders,
      }))
      .sort((firstDay, secondDay) =>
        firstDay.date.localeCompare(
          secondDay.date
        )
      ),
    orderStatusData: Array.from(
      statusMap.entries()
    ).map(([name, value]) => ({
      name,
      value,
    })),
    paymentMethodData: Array.from(
      paymentMethodMap.entries()
    ).map(([name, value]) => ({
      name,
      value,
    })),
  };
}
