import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold">About Quickify</h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          Quickify is a fast grocery delivery platform built to bring daily
          essentials, fresh products, snacks, and household items to your
          doorstep in minutes.
        </p>
      </section>
      <Footer />
    </main>
  );
}