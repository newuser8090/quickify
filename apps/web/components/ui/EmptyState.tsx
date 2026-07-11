import Link from "next/link";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-green-100 bg-gradient-to-br from-white to-green-50 p-12 text-center shadow-sm">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white text-green-600 shadow-sm">
        {icon ?? <span className="text-5xl">🛒</span>}
      </div>

      <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
        {title}
      </h2>

      <p className="mx-auto mt-3 max-w-md leading-7 text-gray-500">
        {description}
      </p>

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-7 inline-flex items-center justify-center rounded-2xl bg-green-600 px-7 py-3 font-bold text-white shadow-sm transition hover:bg-green-700"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}