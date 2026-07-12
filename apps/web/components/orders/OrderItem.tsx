import Image from "next/image";
import Link from "next/link";

type ProductImageData = {
  id?: number;
  image?: string | null;
  name?: string | null;
};

type Props = {
  item: {
    product_id?: number | null;
    name: string;
    quantity: number;
    price: number;
    unit?: string | null;
    variant_name?: string | null;
    product?:
      | ProductImageData
      | ProductImageData[]
      | null;
  };
};

export default function OrderItem({
  item,
}: Props) {
  const product = Array.isArray(
    item.product
  )
    ? item.product[0]
    : item.product;

  const productId =
    item.product_id ??
    product?.id ??
    null;

  const imageUrl =
    product?.image ?? null;

  const content = (
    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
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
    </div>
  );

  return (
    <div className="flex min-w-0 flex-1 items-center gap-4">
      {productId ? (
        <Link
          href={`/product/${productId}`}
          className="shrink-0"
        >
          {content}
        </Link>
      ) : (
        content
      )}

      <div className="min-w-0 flex-1">
        {productId ? (
          <Link
            href={`/product/${productId}`}
            className="line-clamp-2 font-semibold transition hover:text-green-700"
          >
            {item.name}
          </Link>
        ) : (
          <p className="line-clamp-2 font-semibold">
            {item.name}
          </p>
        )}

        {item.variant_name && (
          <p className="mt-1 text-sm font-medium text-green-700">
            {item.variant_name}
          </p>
        )}

        {item.unit && (
          <p className="mt-1 text-sm text-gray-500">
            {item.unit}
          </p>
        )}

        <p className="mt-1 text-sm text-gray-500">
          Qty {item.quantity}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-bold text-gray-900">
          ₹
          {(
            item.price *
            item.quantity
          ).toLocaleString("en-IN")}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          ₹
          {Number(
            item.price
          ).toLocaleString("en-IN")}{" "}
          each
        </p>
      </div>
    </div>
  );
}
