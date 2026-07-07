import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 bg-zinc-900 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">
        <div>
          <h2 className="text-3xl font-bold text-green-400">Quickify</h2>
          <p className="mt-3 text-gray-400">
            Fresh groceries delivered in minutes.
          </p>
        </div>

        <div>
          <h3 className="font-bold">Quick Links</h3>
          <ul className="mt-4 space-y-3 text-gray-400">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/orders">My Orders</Link></li>
            <li><Link href="/wishlist">Wishlist</Link></li>
            <li><Link href="/addresses">Addresses</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold">My Account</h3>
          <ul className="mt-4 space-y-3 text-gray-400">
            <li><Link href="/coupons">Coupons</Link></li>
            <li><Link href="/settings">Settings</Link></li>
            <li><Link href="/login">Login</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold">Support</h3>
          <ul className="mt-4 space-y-3 text-gray-400">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Quickify. All rights reserved.
      </div>
    </footer>
  );
}