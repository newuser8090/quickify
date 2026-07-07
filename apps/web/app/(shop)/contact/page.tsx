import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold">Contact Us</h1>
        <div className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-gray-600">Email: support@quickify.com</p>
          <p className="mt-2 text-gray-600">Phone: +91 98765 43210</p>
          <p className="mt-2 text-gray-600">Location: Lucknow, India</p>
        </div>
      </section>
      <Footer />
    </main>
  );
}