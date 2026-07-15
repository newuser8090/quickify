import {
  Check,
  CheckCircle2,
  Clock3,
  PackageCheck,
  ShoppingBag,
  Truck,
  XCircle,
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

export default function OrderTimeline({
  status,
}: Props) {
  const currentIndex =
    timelineSteps.findIndex(
      (step) =>
        step.label === status
    );

  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-3.5 text-red-700 sm:p-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 sm:h-10 sm:w-10">
          <XCircle
            size={18}
            className="sm:h-5 sm:w-5"
          />
        </span>

        <div>
          <p className="text-sm font-bold sm:text-base">
            Order cancelled
          </p>

          <p className="mt-0.5 text-[11px] text-red-600 sm:text-sm">
            This order will not be delivered.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400 sm:text-xs">
            Live progress
          </p>

          <h3 className="mt-1 text-base font-black text-gray-900 sm:text-lg">
            Order Timeline
          </h3>
        </div>

        {currentIndex >= 0 && (
          <span className="rounded-full bg-green-50 px-2.5 py-1 text-[9px] font-black text-green-700 sm:px-3 sm:text-xs">
            Step {currentIndex + 1} of{" "}
            {timelineSteps.length}
          </span>
        )}
      </div>

      <div className="space-y-0">
        {timelineSteps.map(
          (step, index) => {
            const Icon =
              step.icon;

            const completed =
              index <
              currentIndex;

            const active =
              index ===
              currentIndex;

            const upcoming =
              index >
              currentIndex;

            return (
              <div
                key={
                  step.label
                }
                className="flex gap-3 sm:gap-4"
              >
                <div className="flex shrink-0 flex-col items-center">
                  <div
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition sm:h-10 sm:w-10 ${
                      active
                        ? "border-green-600 bg-green-600 text-white shadow-[0_6px_18px_rgba(22,163,74,0.28)]"
                        : completed
                          ? "border-green-500 bg-green-50 text-green-600"
                          : "border-gray-200 bg-white text-gray-300"
                    }`}
                  >
                    {completed ? (
                      <Check
                        size={15}
                        strokeWidth={3}
                        className="sm:h-[18px] sm:w-[18px]"
                      />
                    ) : (
                      <Icon
                        size={14}
                        className="sm:h-[18px] sm:w-[18px]"
                      />
                    )}

                    {active && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-green-400/25" />
                    )}
                  </div>

                  {index <
                    timelineSteps.length -
                      1 && (
                    <div
                      className={`my-1 h-8 w-0.5 rounded-full sm:h-10 ${
                        index <
                        currentIndex
                          ? "bg-green-500"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1 pb-4 sm:pb-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={`text-sm font-black sm:text-base ${
                        upcoming
                          ? "text-gray-400"
                          : "text-gray-900"
                      }`}
                    >
                      {
                        step.label
                      }
                    </p>

                    {active && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-green-700 sm:px-2.5 sm:text-[10px]">
                        Current
                      </span>
                    )}

                    {completed && (
                      <span className="text-[9px] font-bold text-green-600 sm:text-xs">
                        Completed
                      </span>
                    )}
                  </div>

                  <p
                    className={`mt-0.5 text-[11px] leading-4 sm:mt-1 sm:text-sm sm:leading-5 ${
                      upcoming
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    {
                      step.description
                    }
                  </p>
                </div>
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}