export default function OfferBanner() {
  return (
    <section className="mx-auto mt-8 max-w-7xl px-6">
      <div className="rounded-3xl bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold">
          🎉 Flat 20% OFF on your first order
        </h2>

        <p className="mt-3 text-lg">
          Use coupon <strong>WELCOME20</strong> and save instantly.
        </p>
      </div>
    </section>
  );
}