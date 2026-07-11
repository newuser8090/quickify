import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PageHeaderProps = {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
};

export default function PageHeader({
  title,
  description,
  backHref = "/",
  backLabel = "Back to shopping",
}: PageHeaderProps) {
  return (
    <div>
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-2 font-semibold text-green-700 hover:underline"
      >
        <ArrowLeft size={18} />
        {backLabel}
      </Link>

      <h1 className="text-4xl font-bold">{title}</h1>

      {description && <p className="mt-2 text-gray-500">{description}</p>}
    </div>
  );
}