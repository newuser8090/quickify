import { supabase } from "@/lib/supabase";

export type SalesReportFilters = {
  fromDate: string;
  toDate: string;
};

export type SalesReportSummary = {
  grossRevenue: number;
  refundedAmount: number;
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  codOrders: number;
  refundedOrders: number;
  averageOrderValue: number;
};

export type DailySalesRow = {
  date: string;
  grossRevenue: number;
  refundedAmount: number;
  revenue: number;
  orders: number;
};

export type PaymentMethodRow = {
  method: string;
  orders: number;
  grossRevenue: number;
  refundedAmount: number;
  revenue: number;
};

export type TopProductRow = {
  productId: number;
  productName: string;
  quantitySold: number;
  grossRevenue: number;
  refundedAmount: number;
  revenue: number;
};

type SalesOrderRow = {
  id: number;
  total: number | null;
  status: string | null;
  payment_method: string | null;
  payment_status: string | null;
  refund_status: string | null;
  refund_amount: number | null;
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

function isPaidNonCancelledOrder(
  order: SalesOrderRow
) {
  const status =
    order.status?.toLowerCase() ?? "";

  const paymentStatus =
    order.payment_status?.toLowerCase() ?? "";

  return (
    status !== "cancelled" &&
    paymentStatus === "paid"
  );
}

function getRefundAmount(
  order: SalesOrderRow
) {
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

export async function getSalesReport(
  filters: SalesReportFilters
) {
  const from =
    `${filters.fromDate}T00:00:00`;

  const to =
    `${filters.toDate}T23:59:59`;

  const {
    data: orders,
    error: ordersError,
  } = await supabase
    .from("orders")
    .select(
      `
      id,
      total,
      status,
      payment_method,
      payment_status,
      refund_status,
      refund_amount,
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
    .order("created_at", {
      ascending: true,
    });

  if (ordersError) throw ordersError;

  const safeOrders =
    (orders ?? []) as SalesOrderRow[];

  const paidOrdersList =
    safeOrders.filter(
      isPaidNonCancelledOrder
    );

  const totalOrders = safeOrders.length;
  const paidOrders =
    paidOrdersList.length;

  const codOrders = safeOrders.filter(
    (order) => {
      const paymentMethod =
        order.payment_method
          ?.toLowerCase() ?? "";

      return (
        paymentMethod ===
          "cash on delivery" ||
        paymentMethod === "cod"
      );
    }
  ).length;

  const refundedOrders =
    paidOrdersList.filter(
      (order) =>
        order.refund_status?.toLowerCase() ===
        "refunded"
    ).length;

  const grossRevenue =
    paidOrdersList.reduce(
      (sum, order) =>
        sum +
        Number(order.total ?? 0),
      0
    );

  const refundedAmount =
    paidOrdersList.reduce(
      (sum, order) =>
        sum + getRefundAmount(order),
      0
    );

  const totalRevenue = Math.max(
    0,
    grossRevenue - refundedAmount
  );

  const averageOrderValue =
    paidOrders > 0
      ? Math.round(
          totalRevenue / paidOrders
        )
      : 0;

  const dailyMap = new Map<
    string,
    DailySalesRow
  >();

  const productMap = new Map<
    number,
    TopProductRow
  >();

  const paymentMap = new Map<
    string,
    PaymentMethodRow
  >();

  for (const order of paidOrdersList) {
    const date = new Date(order.created_at)
      .toISOString()
      .slice(0, 10);

    const orderGrossRevenue =
      Number(order.total ?? 0);

    const orderRefundAmount =
      getRefundAmount(order);

    const orderNetRevenue = Math.max(
      0,
      orderGrossRevenue -
        orderRefundAmount
    );

    const existingDaily =
      dailyMap.get(date) ?? {
        date,
        grossRevenue: 0,
        refundedAmount: 0,
        revenue: 0,
        orders: 0,
      };

    existingDaily.grossRevenue +=
      orderGrossRevenue;

    existingDaily.refundedAmount +=
      orderRefundAmount;

    existingDaily.revenue +=
      orderNetRevenue;

    existingDaily.orders += 1;

    dailyMap.set(date, existingDaily);

    const paymentMethod =
      order.payment_method ?? "Unknown";

    const existingPayment =
      paymentMap.get(paymentMethod) ?? {
        method: paymentMethod,
        orders: 0,
        grossRevenue: 0,
        refundedAmount: 0,
        revenue: 0,
      };

    existingPayment.orders += 1;

    existingPayment.grossRevenue +=
      orderGrossRevenue;

    existingPayment.refundedAmount +=
      orderRefundAmount;

    existingPayment.revenue +=
      orderNetRevenue;

    paymentMap.set(
      paymentMethod,
      existingPayment
    );

    const refundRatio =
      orderGrossRevenue > 0
        ? Math.max(
            0,
            Math.min(
              1,
              orderRefundAmount /
                orderGrossRevenue
            )
          )
        : 0;

    for (
      const item of
      order.order_items ?? []
    ) {
      if (item.product_id === null) {
        continue;
      }

      const productId =
        Number(item.product_id);

      const quantity =
        Number(item.quantity ?? 0);

      const price =
        Number(item.price ?? 0);

      const itemGrossRevenue =
        price * quantity;

      const itemRefundAmount =
        itemGrossRevenue * refundRatio;

      const itemNetRevenue =
        itemGrossRevenue -
        itemRefundAmount;

      const netQuantity =
        quantity * (1 - refundRatio);

      const existingProduct =
        productMap.get(productId) ?? {
          productId,
          productName: item.name,
          quantitySold: 0,
          grossRevenue: 0,
          refundedAmount: 0,
          revenue: 0,
        };

      existingProduct.quantitySold +=
        netQuantity;

      existingProduct.grossRevenue +=
        itemGrossRevenue;

      existingProduct.refundedAmount +=
        itemRefundAmount;

      existingProduct.revenue +=
        itemNetRevenue;

      productMap.set(
        productId,
        existingProduct
      );
    }
  }

  const summary: SalesReportSummary = {
    grossRevenue,
    refundedAmount,
    totalRevenue,
    totalOrders,
    paidOrders,
    codOrders,
    refundedOrders,
    averageOrderValue,
  };

  const dailySales =
    Array.from(dailyMap.values()).map(
      (row) => ({
        ...row,
        grossRevenue:
          Math.round(row.grossRevenue),
        refundedAmount:
          Math.round(row.refundedAmount),
        revenue:
          Math.round(row.revenue),
      })
    );

  const topProducts =
    Array.from(productMap.values())
      .map((product) => ({
        ...product,
        quantitySold:
          Math.round(
            product.quantitySold * 100
          ) / 100,
        grossRevenue:
          Math.round(
            product.grossRevenue
          ),
        refundedAmount:
          Math.round(
            product.refundedAmount
          ),
        revenue:
          Math.round(product.revenue),
      }))
      .sort(
        (firstProduct, secondProduct) =>
          secondProduct.quantitySold -
          firstProduct.quantitySold
      );

  const paymentMethods =
    Array.from(paymentMap.values())
      .map((row) => ({
        ...row,
        grossRevenue:
          Math.round(row.grossRevenue),
        refundedAmount:
          Math.round(
            row.refundedAmount
          ),
        revenue:
          Math.round(row.revenue),
      }))
      .sort(
        (firstMethod, secondMethod) =>
          secondMethod.revenue -
          firstMethod.revenue
      );

  return {
    summary,
    dailySales,
    topProducts,
    paymentMethods,
    orders: safeOrders,
  };
}
