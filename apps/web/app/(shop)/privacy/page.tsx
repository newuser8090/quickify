import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          Quickify respects your privacy. We use your information only to manage
          orders, delivery addresses, payments, and account services. Your data
          is not sold to third parties.
        </p>
      </section>
      <Footer />
    </main>
  );
}