import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  href?: string;
  showViewAll?: boolean;
};

export default function SectionHeader({
  title,
  subtitle,
  href = "#",
  showViewAll = true,
}: Props) {
  return (
    <div className="mx-auto mb-6 flex max-w-7xl items-end justify-between px-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>

        {subtitle && (
          <p className="mt-2 text-gray-500">
            {subtitle}
          </p>
        )}
      </div>

      {showViewAll && (
        <Link
          href={href}
          className="flex items-center gap-2 font-semibold text-green-600 transition hover:text-green-700"
        >
          View All
          <ArrowRight size={18} />
        </Link>
      )}
    </div>
  );
}