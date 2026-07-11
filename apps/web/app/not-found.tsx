import Link from "next/link";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-700">
          <SearchX size={38} />
        </div>

        <h1 className="mt-6 text-4xl font-bold">Page not found</h1>

        <p className="mt-3 text-gray-500">
          The page you are looking for does not exist or may have been moved.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
        >
          <Home size={18} />
          Back to Home
        </Link>
      </div>
    </main>
  );
}