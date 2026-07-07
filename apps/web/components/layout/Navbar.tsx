"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import Logo from "./Logo";
import SearchBar from "./SearchBar";
import LocationBar from "./LocationBar";
import UserButton from "./UserButton";
import CartButton from "./CartButton";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
        <Logo />

        <LocationBar />

        <SearchBar />

        <Link
  href="/wishlist"
  className="relative rounded-xl p-3 transition hover:bg-red-50"
  title="Wishlist"
>
  <Heart
    size={22}
    className="text-gray-700 hover:fill-red-500 hover:text-red-500"
  />
</Link>

<NotificationBell />

<UserButton />

<CartButton />
      </div>
    </header>
  );
}