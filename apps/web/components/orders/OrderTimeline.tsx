import { CheckCircle2, Circle } from "lucide-react";

const timelineSteps = [
  "Placed",
  "Processing",
  "Packed",
  "Out for Delivery",
  "Delivered",
];

type Props = {
  status: string;
};

export default function OrderTimeline({ status }: Props) {
  const currentIndex = timelineSteps.indexOf(status);

  if (status === "Cancelled") {
    return (
      <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
        This order has been cancelled.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4">
      <h3 className="mb-4 font-bold">Order Timeline</h3>

      <div className="space-y-4">
        {timelineSteps.map((step, index) => {
          const completed = index <= currentIndex;

          return (
            <div key={step} className="flex gap-3">
              <div className="flex flex-col items-center">
                {completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300" />
                )}

                {index < timelineSteps.length - 1 && (
                  <div
                    className={`mt-1 h-6 w-px ${
                      completed ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>

              <p
                className={`text-sm font-semibold ${
                  completed ? "text-green-700" : "text-gray-400"
                }`}
              >
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}