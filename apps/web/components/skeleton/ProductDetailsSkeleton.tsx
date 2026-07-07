export default function ProductDetailsSkeleton() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-6">
        <div className="grid gap-8 rounded-3xl bg-white p-8 lg:grid-cols-2">
          <div>
            <div className="h-[520px] animate-pulse rounded-3xl bg-gray-200" />

            <div className="mt-5 grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-2xl bg-gray-200"
                />
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="h-8 w-28 animate-pulse rounded bg-gray-200" />
            <div className="h-12 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
            <div className="h-12 w-48 animate-pulse rounded bg-gray-200" />

            <div className="space-y-3">
              <div className="h-4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-2xl bg-gray-200"
                />
              ))}
            </div>

            <div className="h-14 animate-pulse rounded-2xl bg-gray-300" />
          </div>
        </div>
      </div>
    </main>
  );
}