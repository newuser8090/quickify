"use client";

type Props = {
  onStartShopping?: () => void;
};

export default function Hero({
  onStartShopping,
}: Props) {
  function handleStartShopping() {
    if (onStartShopping) {
      onStartShopping();
      return;
    }

    document
      .getElementById("products-section")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  return (
    <section className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-12">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-green-50 to-emerald-100 px-5 py-6 sm:rounded-3xl sm:p-10 md:p-16">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-extrabold leading-tight text-gray-900 sm:text-4xl md:text-6xl">
            Groceries delivered
            <span className="text-green-600">
              {" "}
              in minutes
            </span>
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:mt-6 sm:text-lg sm:leading-8">
            Fresh fruits, vegetables, dairy, snacks & daily essentials delivered
            instantly to your doorstep.
          </p>

          <button
            type="button"
            onClick={handleStartShopping}
            className="mt-5 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 active:scale-[0.98] sm:mt-8 sm:px-8 sm:py-4 sm:text-base"
          >
            Start Shopping
          </button>
        </div>
      </div>
    </section>
  );
}
