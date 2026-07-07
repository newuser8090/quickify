"use client";

import { CheckCircle2, Circle, Download } from "lucide-react";

import OrderStatusBadge from "./OrderStatusBadge";
import OrderItem from "./OrderItem";

type OrderAddress = {
  full_name?: string | null;
  phone?: string | null;
  address_line?: string | null;
  landmark?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | number | null;
};

type OrderItemType = {
  id: number;
  name: string;
  variant_name?: string | null;
  unit?: string | null;
  price: number;
  quantity: number;
};

type OrderUser = {
  email?: string | null;
  user_metadata?: {
    full_name?: string | null;
  };
};

type Order = {
  id: number;
  status: string;
  created_at: string;
  payment_method: string;
  payment_status?: string | null;
  razorpay_payment_id?: string | null;
  subtotal?: number | null;
  delivery_fee?: number | null;
  platform_fee?: number | null;
  discount?: number | null;
  total: number;
  addresses?: OrderAddress | OrderAddress[] | null;
  user?: OrderUser | null;
  order_items: OrderItemType[];
};

type Props = {
  order: Order;
};

const steps = ["Placed", "Processing", "Shipped", "Delivered"];

export default function OrderCard({ order }: Props) {
  const currentIndex = steps.indexOf(order.status);
  const isCancelled = order.status === "Cancelled";

  function downloadInvoice() {
    const invoiceWindow = window.open("", "_blank");
    if (!invoiceWindow) return;

    const address = Array.isArray(order.addresses)
      ? order.addresses[0]
      : order.addresses;

    const customerName =
      address?.full_name ||
      order.user?.user_metadata?.full_name ||
      order.user?.email ||
      "Customer";

    const fullAddress = [
      address?.address_line,
      address?.landmark,
      address?.city,
      address?.state,
      address?.pincode,
    ]
      .filter(Boolean)
      .join(", ");

    const itemsHtml = order.order_items
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>
              <strong>${item.name}</strong>
              ${item.variant_name ? `<br/><small>${item.variant_name}</small>` : ""}
              ${item.unit ? `<br/><small>${item.unit}</small>` : ""}
            </td>
            <td>${item.quantity}</td>
            <td>₹${item.price}</td>
            <td>₹${item.price * item.quantity}</td>
          </tr>
        `
      )
      .join("");

    invoiceWindow.document.write(`
      <html>
        <head>
          <title>Quickify Invoice #${order.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 32px;
              color: #111827;
            }

            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #16a34a;
              padding-bottom: 18px;
            }

            .brand {
              font-size: 32px;
              font-weight: bold;
              color: #16a34a;
            }

            .muted {
              color: #6b7280;
              font-size: 14px;
            }

            .section {
              padding: 14px 16px;
              background: #f9fafb;
              border-radius: 10px;
            }

            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-top: 14px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 24px;
            }

            th {
              background: #ecfdf5;
              color: #166534;
            }

            th, td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
              text-align: left;
            }

            .summary {
              margin-top: 24px;
              margin-left: auto;
              width: 320px;
            }

            .row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
            }

            .grand {
              font-size: 22px;
              font-weight: bold;
              border-top: 2px solid #111827;
              margin-top: 8px;
              padding-top: 12px;
            }

            .footer {
              margin-top: 40px;
              text-align: center;
              color: #6b7280;
              font-size: 13px;
            }
          </style>
        </head>

        <body>
          <div class="header">
            <div>
              <div class="brand">Quickify</div>
              <p class="muted">Fresh groceries delivered fast</p>
            </div>

            <div>
              <h2>Tax Invoice</h2>
              <p><strong>Invoice No:</strong> QK-${order.id}</p>
              <p><strong>Order ID:</strong> #${order.id}</p>
              <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
            </div>
          </div>

          <div class="grid">
            <div class="section">
              <h3 style="margin:0 0 8px;font-size:16px;">Bill To</h3>
              <p style="margin:2px 0;"><strong>${customerName}</strong></p>
              <p style="margin:2px 0;">${address?.phone ?? ""}</p>
            </div>

            <div class="section">
              <h3 style="margin:0 0 8px;font-size:16px;">Delivery Address</h3>
              <p style="margin:2px 0;">${fullAddress || "Address not available"}</p>
            </div>
          </div>

          <div class="section" style="margin-top:12px;">
            <h3>Payment Details</h3>

            <table style="width:100%;border-collapse:collapse;margin-top:10px;">
              <tr>
                <td style="padding:6px 0;font-weight:bold;">Payment Method</td>
                <td style="padding:6px 0;">${order.payment_method}</td>
              </tr>

              <tr>
                <td style="padding:6px 0;font-weight:bold;">Invoice Number</td>
                <td style="padding:6px 0;">QK-${order.id}</td>
              </tr>

              <tr>
                <td style="padding:6px 0;font-weight:bold;">Order ID</td>
                <td style="padding:6px 0;">#${order.id}</td>
              </tr>

              <tr>
                <td style="padding:6px 0;font-weight:bold;">Order Date</td>
                <td style="padding:6px 0;">
                  ${new Date(order.created_at).toLocaleString()}
                </td>
              </tr>

              ${
                order.razorpay_payment_id
                  ? `
                    <tr>
                      <td style="padding:6px 0;font-weight:bold;">Transaction ID</td>
                      <td style="padding:6px 0;">
                        ${order.razorpay_payment_id}
                      </td>
                    </tr>
                  `
                  : ""
              }
            </table>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="summary">
            <div class="row">
              <span>Subtotal</span>
              <strong>₹${order.subtotal ?? order.total}</strong>
            </div>

            <div class="row">
              <span>Delivery Fee</span>
              <strong>₹${order.delivery_fee ?? 0}</strong>
            </div>

            <div class="row">
              <span>Platform Fee</span>
              <strong>₹${order.platform_fee ?? 0}</strong>
            </div>

            <div class="row">
              <span>Discount</span>
              <strong>-₹${order.discount ?? 0}</strong>
            </div>

            <div class="row grand">
              <span>Grand Total</span>
              <span>₹${order.total}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for shopping with Quickify.</p>
            <p>This is a computer-generated invoice.</p>
          </div>

          <script>
            window.print();
          </script>
        </body>
      </html>
    `);

    invoiceWindow.document.close();
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Order #{order.id}</h2>

          <p className="text-sm text-gray-500">
            {new Date(order.created_at).toLocaleString()}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {order.payment_method}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                order.payment_status === "Paid"
                  ? "bg-green-100 text-green-700"
                  : order.payment_status === "Failed"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {order.payment_status ?? "Pending"}
            </span>
          </div>
        </div>

        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-6 rounded-2xl bg-gray-50 p-5">
        <h3 className="mb-5 font-bold">Order Tracking</h3>

        {isCancelled ? (
          <p className="font-semibold text-red-600">
            This order has been cancelled.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => {
              const completed = index <= currentIndex;

              return (
                <div key={step} className="flex items-center gap-3">
                  {completed ? (
                    <CheckCircle2 className="text-green-600" size={24} />
                  ) : (
                    <Circle className="text-gray-300" size={24} />
                  )}

                  <span
                    className={`font-semibold ${
                      completed ? "text-green-700" : "text-gray-400"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 space-y-2">
        {order.order_items.map((item) => (
          <OrderItem key={item.id} item={item} />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <button
          onClick={downloadInvoice}
          className="flex items-center gap-2 rounded-xl border px-4 py-2 font-semibold text-green-700 hover:bg-green-50"
        >
          <Download size={18} />
          Download Invoice
        </button>

        <span className="text-xl font-bold text-green-600">
          ₹{order.total}
        </span>
      </div>
    </div>
  );
}