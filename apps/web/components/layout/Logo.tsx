export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-xl font-bold text-white">
        Q
      </div>

      <div>
        <h1 className="text-xl font-extrabold">
          Quickify
        </h1>

        <p className="text-xs text-gray-500">
          Delivery in minutes
        </p>
      </div>
    </div>
  );
}