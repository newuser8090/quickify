type Props = {
  status: string;
};

export default function OrderStatusBadge({
  status,
}: Props) {
  const styles: Record<string, string> = {
    Placed: "bg-blue-100 text-blue-700",
    Processing: "bg-yellow-100 text-yellow-700",
    Shipped: "bg-purple-100 text-purple-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}