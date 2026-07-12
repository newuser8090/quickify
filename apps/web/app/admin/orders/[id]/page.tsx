"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import {
  ArrowLeft,
  Bike,
  CalendarClock,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import AdminLayout from "@/components/admin/AdminLayout";
import DeliveryTrackingPanel from "@/components/admin/DeliveryTrackingPanel";
import OrderTimeline from "@/components/orders/OrderTimeline";
import {
  cancelOnlineOrder,
  getAdminOrder,
  updateOrderStatus,
} from "@/services/adminOrderService";
import {
  assignDeliveryPartner,
  getDeliveryPartners,
  releaseDeliveryPartner,
} from "@/services/deliveryPartnerService";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type AdminOrderItem = {
  id: number;
  product_id: number | null;
  name: string;
  unit: string | null;
  price: number;
  quantity: number;
  variant_name: string | null;
  product?:
    | {
        id: number;
        name: string;
        image: string | null;
      }
    | {
        id: number;
        name: string;
        image: string | null;
      }[]
    | null;
};

type DeliveryPartnerOption = {
  id: string;
  name: string;
  status: string;
  vehicle_type: string;
};

type AdminOrder = {
  id: number;
  created_at: string;
  total: number;
  payment_method: string;
  payment_status: string | null;
  status: string;
  delivery_slot?: string | null;

  delivery_partner_id: string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  delivery_location_updated_at: string | null;
  estimated_delivery_minutes: number | null;

  order_items?: AdminOrderItem[];

  addresses?: {
    full_name: string;
    phone: string;
    address_line: string;
    landmark: string | null;
    city: string;
    state: string;
    pincode: string;
  } | null;

  delivery_partners?: {
    name: string;
    phone: string;
    vehicle_type: string;
    vehicle_number: string | null;
  } | null;

  return_status: string | null;
  return_reason: string | null;
  return_requested_at: string | null;
  return_reviewed_at: string | null;
  return_review_note: string | null;

  refund_status: string | null;
  refund_amount: number | null;
  refund_method: string | null;
  razorpay_refund_id: string | null;
  refund_requested_at: string | null;
  refunded_at: string | null;
  razorpay_payment_id: string | null;
};

const statuses = [
  "Placed",
  "Processing",
  "Packed",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function AdminOrderDetailsPage({
  params,
}: Props) {
  const { id } = use(params);
  const orderId = Number(id);

  const queryClient = useQueryClient();

  const [updating, setUpdating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState("");

  const [
    showCancellationDialog,
    setShowCancellationDialog,
  ] = useState(false);

  const [cancellingOrder, setCancellingOrder] =
    useState(false);

  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: () => getAdminOrder(orderId),
    enabled: Number.isFinite(orderId),
  });

  const { data: partners = [] } = useQuery({
    queryKey: ["delivery-partners"],
    queryFn: getDeliveryPartners,
  });

  const typedOrder =
    order as AdminOrder | undefined;

  const availablePartners = (
    partners as DeliveryPartnerOption[]
  ).filter(
    (partner) => partner.status === "Available"
  );

  async function refreshOrder() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["admin-order", orderId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["admin-orders"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["admin-returns"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["delivery-partners"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["admin-dashboard-stats"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["admin-users"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["sales-report"],
      }),
    ]);
  }

  async function releasePartnerIfNeeded() {
    if (!typedOrder?.delivery_partner_id) return;

    await releaseDeliveryPartner(
      typedOrder.delivery_partner_id
    );
  }

  async function handleStatusChange(
    nextStatus: string
  ) {
    if (!typedOrder) return;

    const paymentMethod =
      typedOrder.payment_method
        ?.toLowerCase()
        .trim() ?? "";

    const paymentStatus =
      typedOrder.payment_status
        ?.toLowerCase()
        .trim() ?? "";

    const isPaidOnlineOrder =
      paymentMethod === "online" &&
      paymentStatus === "paid";

    if (
      nextStatus === "Cancelled" &&
      isPaidOnlineOrder &&
      typedOrder.status !== "Cancelled"
    ) {
      setShowCancellationDialog(true);
      return;
    }

    try {
      setUpdating(true);

      await updateOrderStatus(
        typedOrder.id,
        nextStatus
      );

      if (
        nextStatus === "Delivered" ||
        nextStatus === "Cancelled"
      ) {
        await releasePartnerIfNeeded();
      }

      toast.success("Order status updated");

      await refreshOrder();
    } catch (error) {
      console.error(
        "Failed to update order status:",
        error
      );

      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  async function handleOnlineCancellation(
    refundPayment: boolean
  ) {
    if (!typedOrder) return;

    try {
      setCancellingOrder(true);

      const result = await cancelOnlineOrder({
        orderId: typedOrder.id,
        refundPayment,
      });

      await releasePartnerIfNeeded();

      if (!refundPayment) {
        toast.success(
          "Order cancelled without initiating a refund"
        );
      } else if (
        result.refundStatus === "Refunded"
      ) {
        toast.success(
          "Order cancelled and refund completed"
        );
      } else {
        toast.success(
          "Order cancelled and refund initiated"
        );
      }

      setShowCancellationDialog(false);

      await refreshOrder();
    } catch (error) {
      console.error(
        "Online order cancellation failed:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "The order could not be cancelled."
      );
    } finally {
      setCancellingOrder(false);
    }
  }

  async function handleAssignPartner() {
    if (!typedOrder) return;

    if (!selectedPartner) {
      toast.error(
        "Please select a delivery partner"
      );
      return;
    }

    try {
      setAssigning(true);

      await assignDeliveryPartner(
        typedOrder.id,
        selectedPartner
      );

      await updateOrderStatus(
        typedOrder.id,
        "Out for Delivery"
      );

      toast.success(
        "Delivery partner assigned"
      );

      setSelectedPartner("");

      await refreshOrder();
    } catch (error) {
      console.error(
        "Failed to assign delivery partner:",
        error
      );

      toast.error(
        "Failed to assign delivery partner"
      );
    } finally {
      setAssigning(false);
    }
  }

  return (
    <AdminLayout>
      <Link
        href="/admin/orders"
        className="mb-6 inline-flex items-center gap-2 font-semibold text-green-700 hover:underline"
      >
        <ArrowLeft size={18} />
        Back to orders
      </Link>

      {isLoading ? (
        <div className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
          Loading order details...
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
          <h2 className="text-xl font-bold text-red-700">
            Order could not be loaded
          </h2>

          <p className="mt-2 text-sm text-red-600">
            Please check your connection and try again.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : !typedOrder ? (
        <div className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
          Order not found.
        </div>
      ) : (
        <div className="space-y-6">
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">
                  Order #{typedOrder.id}
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  {new Date(
                    typedOrder.created_at
                  ).toLocaleString("en-IN")}
                </p>

                <p className="mt-3 text-2xl font-bold text-green-700">
                  {formatCurrency(
                    Number(typedOrder.total ?? 0)
                  )}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-7 items-center rounded-full bg-blue-50 px-3 text-xs font-bold text-blue-700">
                    {typedOrder.payment_method}
                  </span>

                  <PaymentStatusBadge
                    status={
                      typedOrder.payment_status
                    }
                  />

                  {typedOrder.delivery_slot && (
                    <span className="inline-flex h-7 items-center gap-2 rounded-full bg-green-50 px-3 text-xs font-bold text-green-700">
                      <CalendarClock size={14} />
                      {typedOrder.delivery_slot}
                    </span>
                  )}
                </div>
              </div>

              <select
                value={typedOrder.status}
                disabled={
                  updating || cancellingOrder
                }
                onChange={(event) =>
                  handleStatusChange(
                    event.target.value
                  )
                }
                className="rounded-xl border border-gray-200 px-4 py-3 font-semibold outline-none transition focus:border-green-600 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                {statuses.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6">
              <OrderTimeline
                status={typedOrder.status}
              />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <OrderItemsCard
                items={
                  typedOrder.order_items ?? []
                }
              />

              <DeliveryAddressCard
                address={typedOrder.addresses}
              />

              <DeliveryPartnerCard
                partner={
                  typedOrder.delivery_partners
                }
                availablePartners={
                  availablePartners
                }
                selectedPartner={
                  selectedPartner
                }
                assigning={assigning}
                onPartnerChange={
                  setSelectedPartner
                }
                onAssign={
                  handleAssignPartner
                }
              />
            </div>

            {typedOrder.delivery_partner_id && (
              <div className="mt-6">
                <DeliveryTrackingPanel
                  orderId={typedOrder.id}
                  latitude={
                    typedOrder.delivery_latitude
                  }
                  longitude={
                    typedOrder.delivery_longitude
                  }
                  estimatedMinutes={
                    typedOrder.estimated_delivery_minutes
                  }
                  updatedAt={
                    typedOrder.delivery_location_updated_at
                  }
                />
              </div>
            )}
          </section>

          <ReturnRefundSummary
            order={typedOrder}
          />
        </div>
      )}

      {showCancellationDialog && typedOrder && (
        <CancellationRefundDialog
          orderId={typedOrder.id}
          amount={Number(
            typedOrder.total ?? 0
          )}
          processing={cancellingOrder}
          onClose={() =>
            setShowCancellationDialog(false)
          }
          onCancelWithoutRefund={() =>
            handleOnlineCancellation(false)
          }
          onCancelAndRefund={() =>
            handleOnlineCancellation(true)
          }
        />
      )}
    </AdminLayout>
  );
}

function CancellationRefundDialog({
  orderId,
  amount,
  processing,
  onClose,
  onCancelWithoutRefund,
  onCancelAndRefund,
}: {
  orderId: number;
  amount: number;
  processing: boolean;
  onClose: () => void;
  onCancelWithoutRefund: () => void;
  onCancelAndRefund: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !processing
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-bold">
          Cancel Online Order
        </h2>

        <p className="mt-3 text-gray-600">
          Order #{orderId} has already been paid online.
          Choose whether the full payment should be
          refunded when cancelling this order.
        </p>

        <div className="mt-5 rounded-2xl bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-700">
            Full refund amount
          </p>

          <p className="mt-1 text-2xl font-bold text-blue-900">
            {formatCurrency(amount)}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={onCancelAndRefund}
            disabled={processing}
            className="w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {processing
              ? "Processing..."
              : "Cancel Order & Refund Payment"}
          </button>

          <button
            type="button"
            onClick={onCancelWithoutRefund}
            disabled={processing}
            className="w-full rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Cancel Order Without Refund
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="w-full rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Go Back
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Choosing refund will initiate a full Razorpay
          refund using the original payment ID.
        </p>
      </div>
    </div>
  );
}

function PaymentStatusBadge({
  status,
}: {
  status: string | null;
}) {
  const normalizedStatus =
    status?.toLowerCase() ?? "pending";

  const className =
    normalizedStatus === "paid"
      ? "bg-green-100 text-green-700"
      : normalizedStatus === "failed"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700";

  return (
    <span
      className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-bold ${className}`}
    >
      {status ?? "Pending"}
    </span>
  );
}

function OrderItemsCard({
  items,
}: {
  items: AdminOrderItem[];
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-5">
      <h3 className="font-bold">
        Items
      </h3>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">
          No order items found.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item) => {
            const product =
              Array.isArray(item.product)
                ? item.product[0]
                : item.product;

            const imageUrl =
              product?.image ?? null;

            return (
              <div
                key={item.id}
                className="flex gap-3 border-b border-gray-200 pb-4 last:border-none last:pb-0"
              >
                <Link
                  href={`/product/${
                    item.product_id ??
                    product?.id ??
                    ""
                  }`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white"
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">
                      📦
                    </div>
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-semibold">
                    {item.name}
                  </p>

                  {item.variant_name && (
                    <p className="mt-1 text-sm font-medium text-green-700">
                      {item.variant_name}
                    </p>
                  )}

                  {item.unit && (
                    <p className="text-sm text-gray-500">
                      {item.unit}
                    </p>
                  )}

                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="font-bold">
                    {formatCurrency(
                      item.price *
                        item.quantity
                    )}
                  </p>

                  <p className="text-xs text-gray-500">
                    {formatCurrency(
                      item.price
                    )}{" "}
                    each
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DeliveryAddressCard({
  address,
}: {
  address: AdminOrder["addresses"];
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-5">
      <h3 className="font-bold">
        Delivery Address
      </h3>

      {address ? (
        <div className="mt-4 text-gray-600">
          <p className="font-semibold text-gray-900">
            {address.full_name}
          </p>

          <p>{address.phone}</p>

          <p className="mt-2">
            {address.address_line}
          </p>

          {address.landmark && (
            <p>{address.landmark}</p>
          )}

          <p>
            {address.city}, {address.state} -{" "}
            {address.pincode}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-gray-500">
          Address not available.
        </p>
      )}
    </div>
  );
}

function DeliveryPartnerCard({
  partner,
  availablePartners,
  selectedPartner,
  assigning,
  onPartnerChange,
  onAssign,
}: {
  partner: AdminOrder["delivery_partners"];
  availablePartners: DeliveryPartnerOption[];
  selectedPartner: string;
  assigning: boolean;
  onPartnerChange: (value: string) => void;
  onAssign: () => void;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-5">
      <div className="flex items-center gap-2">
        <Bike
          className="text-green-600"
          size={20}
        />

        <h3 className="font-bold">
          Delivery Partner
        </h3>
      </div>

      {partner ? (
        <div className="mt-4 rounded-xl bg-white p-4">
          <p className="font-bold">
            {partner.name}
          </p>

          <p className="mt-1 text-sm text-gray-600">
            {partner.phone}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {partner.vehicle_type}

            {partner.vehicle_number
              ? ` • ${partner.vehicle_number}`
              : ""}
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <select
            value={selectedPartner}
            onChange={(event) =>
              onPartnerChange(event.target.value)
            }
            disabled={assigning}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-green-600 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            <option value="">
              Select available partner
            </option>

            {availablePartners.map(
              (availablePartner) => (
                <option
                  key={availablePartner.id}
                  value={availablePartner.id}
                >
                  {availablePartner.name} •{" "}
                  {availablePartner.vehicle_type}
                </option>
              )
            )}
          </select>

          <button
            type="button"
            onClick={onAssign}
            disabled={
              assigning || !selectedPartner
            }
            className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {assigning
              ? "Assigning..."
              : "Assign Partner"}
          </button>

          {availablePartners.length === 0 && (
            <p className="text-sm text-red-500">
              No available partners right now.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ReturnRefundSummary({
  order,
}: {
  order: AdminOrder;
}) {
  const returnStatus =
    order.return_status ?? "None";

  const refundStatus =
    order.refund_status ?? "None";

  if (
    returnStatus === "None" &&
    refundStatus === "None"
  ) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <RotateCcw className="text-green-600" />

            <h2 className="text-xl font-bold">
              Return & Refund Status
            </h2>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Return and refund actions are managed from
            the dedicated Returns section.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ReturnStatusBadge
            status={returnStatus}
          />

          <RefundStatusBadge
            status={refundStatus}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {order.return_reason && (
          <InfoCard
            label="Return reason"
            value={order.return_reason}
          />
        )}

        {order.return_requested_at && (
          <InfoCard
            label="Requested on"
            value={new Date(
              order.return_requested_at
            ).toLocaleString("en-IN")}
          />
        )}

        {order.return_review_note && (
          <InfoCard
            label="Admin note"
            value={order.return_review_note}
          />
        )}

        {Number(order.refund_amount ?? 0) > 0 && (
          <InfoCard
            label="Refund amount"
            value={formatCurrency(
              Number(order.refund_amount ?? 0)
            )}
          />
        )}

        {order.refund_method && (
          <InfoCard
            label="Refund method"
            value={order.refund_method}
          />
        )}

        {order.refunded_at && (
          <InfoCard
            label="Refunded on"
            value={new Date(
              order.refunded_at
            ).toLocaleString("en-IN")}
          />
        )}
      </div>

      <Link
        href="/admin/returns"
        className="mt-5 inline-flex items-center justify-center rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
      >
        Open Returns Management
      </Link>
    </section>
  );
}

function ReturnStatusBadge({
  status,
}: {
  status: string;
}) {
  const normalizedStatus =
    status.toLowerCase();

  const className =
    normalizedStatus === "requested"
      ? "bg-yellow-100 text-yellow-700"
      : normalizedStatus === "approved"
        ? "bg-blue-100 text-blue-700"
        : normalizedStatus === "rejected"
          ? "bg-red-100 text-red-700"
          : normalizedStatus === "returned"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-600";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${className}`}
    >
      Return: {status}
    </span>
  );
}

function RefundStatusBadge({
  status,
}: {
  status: string;
}) {
  const normalizedStatus =
    status.toLowerCase();

  const className =
    normalizedStatus === "refunded"
      ? "bg-green-100 text-green-700"
      : normalizedStatus === "processing"
        ? "bg-blue-100 text-blue-700"
        : normalizedStatus === "failed"
          ? "bg-red-100 text-red-700"
          : normalizedStatus === "pending"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-gray-100 text-gray-600";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${className}`}
    >
      Refund: {status}
    </span>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-2 break-words font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}
