import {
  CheckCircle2,
  Circle,
  Clock3,
  PackageCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

const timelineSteps = [
  {
    label: "Placed",
    description: "Your order has been received.",
    icon: ShoppingBag,
  },
  {
    label: "Processing",
    description: "We are preparing your items.",
    icon: Clock3,
  },
  {
    label: "Packed",
    description: "Your order is packed and ready.",
    icon: PackageCheck,
  },
  {
    label: "Out for Delivery",
    description: "Your rider is on the way.",
    icon: Truck,
  },
  {
    label: "Delivered",
    description: "Order delivered successfully.",
    icon: CheckCircle2,
  },
];

type Props = {
  status: string;
};

export default function OrderTimeline({ status }: Props) {
  const currentIndex = timelineSteps.findIndex((step) => step.label === status);

  if (status === "Cancelled") {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700">
        This order has been cancelled.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5">
      <h3 className="mb-5 text-lg font-bold">Order Timeline</h3>

      <div className="space-y-0">
        {timelineSteps.map((step, index) => {
          const Icon = step.icon;
          const completed = index <= currentIndex;
          const active = index === currentIndex;
          const nextCompleted = index < currentIndex;

          return (
            <div key={step.label} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                    active
                      ? "border-green-600 bg-green-600 text-white shadow-lg shadow-green-200"
                      : completed
                        ? "border-green-500 bg-green-50 text-green-600"
                        : "border-gray-200 bg-gray-50 text-gray-300"
                  }`}
                >
                  {completed ? <Icon size={19} /> : <Circle size={18} />}
                </div>

                {index < timelineSteps.length - 1 && (
                  <div
                    className={`h-10 w-1 rounded-full transition-all ${
                      nextCompleted ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>

              <div className="pb-7">
                <div className="flex items-center gap-2">
                  <p
                    className={`font-bold ${
                      completed ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </p>

                  {active && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      Current
                    </span>
                  )}
                </div>

                <p
                  className={`mt-1 text-sm ${
                    completed ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}