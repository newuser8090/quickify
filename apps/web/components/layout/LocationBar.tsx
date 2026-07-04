import { MapPin } from "lucide-react";

export default function LocationBar() {
  return (
    <div className="hidden md:flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2">
      <MapPin size={18} className="text-green-600" />

      <div>
        <p className="text-xs text-gray-500">
          Deliver to
        </p>

        <p className="font-semibold">
          Shivam's Home
        </p>
      </div>
    </div>
  );
}
