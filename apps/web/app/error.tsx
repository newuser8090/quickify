"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle size={38} />
        </div>

        <h1 className="mt-6 text-3xl font-bold">Something went wrong</h1>

        <p className="mt-3 text-gray-500">
          Quickify ran into a temporary issue. Please try again.
        </p>

        <button
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
        >
          <RefreshCcw size={18} />
          Try Again
        </button>
      </div>
    </main>
  );
}