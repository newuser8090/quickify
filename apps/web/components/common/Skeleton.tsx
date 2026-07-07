type SkeletonProps = {
  className?: string;
};

export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-gray-200 ${className}`}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <Skeleton className="mt-4 h-5 w-3/4" />
      <Skeleton className="mt-3 h-4 w-1/2" />
      <Skeleton className="mt-5 h-6 w-24" />
      <Skeleton className="mt-5 h-10 w-full" />
    </div>
  );
}

export function AdminCardSkeleton() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex gap-5">
        <Skeleton className="h-32 w-32 shrink-0 rounded-2xl" />

        <div className="flex-1">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="mt-3 h-4 w-1/2" />
          <Skeleton className="mt-6 h-6 w-28" />
          <Skeleton className="mt-6 h-3 w-full" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-4 gap-4 border-b p-4 last:border-none"
        >
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}