"use client";

type Props = {
  onStartShopping?: () => void;
};

export default function Hero({ onStartShopping }: Props) {
  function handleStartShopping() {
    if (onStartShopping) {
      onStartShopping();
      return;
    }

    document
      .getElementById("products-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="rounded-3xl bg-gradient-to-r from-green-50 to-emerald-100 p-10 md:p-16">
        <h1 className="text-4xl font-extrabold leading-tight text-gray-900 md:text-6xl">
          Groceries delivered
          <span className="text-green-600"> in minutes</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-gray-600">
          Fresh fruits, vegetables, dairy, snacks & daily essentials delivered
          instantly to your doorstep.
        </p>

        <button
          type="button"
          onClick={handleStartShopping}
          className="mt-8 inline-block rounded-xl bg-green-600 px-8 py-4 font-semibold text-white transition hover:bg-green-700"
        >
          Start Shopping
        </button>
      </div>
    </section>
  );
}