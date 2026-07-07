"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AddressList from "@/components/address/AddressList";

export default function AddressesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <AddressList />
      </section>

      <Footer />
    </main>
  );
}