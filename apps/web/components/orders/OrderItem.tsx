type Props = {
  item: {
    name: string;
    quantity: number;
    price: number;
    unit?: string | null;
    variant_name?: string | null;
  };
};

export default function OrderItem({ item }: Props) {
  return (
    <div className="flex justify-between border-b py-3 last:border-none">
      <div>
        <p className="font-medium">
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
          Qty {item.quantity}
        </p>
      </div>

      <div className="text-right">
        <p className="font-semibold">
          ₹{item.price * item.quantity}
        </p>

        <p className="text-xs text-gray-500">
          ₹{item.price} each
        </p>
      </div>
    </div>
  );
}