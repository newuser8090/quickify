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
    <header className="sticky top-0 z-50 border-b bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 md:py-4">
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="min-w-0 shrink-0">
            <Logo />
          </div>

          <div className="hidden min-w-0 lg:block">
            <LocationBar />
          </div>

          <div className="hidden min-w-0 flex-1 md:block">
            <SearchBar />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <Link
              href="/wishlist"
              className="relative rounded-xl p-2.5 transition hover:bg-red-50 sm:p-3"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart
                size={21}
                className="text-gray-700 transition hover:fill-red-500 hover:text-red-500"
              />
            </Link>

            <NotificationBell />

            <UserButton />

            <div className="hidden sm:block">
              <CartButton />
            </div>
          </div>
        </div>

        <div className="mt-3 md:hidden">
          <SearchBar />
        </div>

        <div className="mt-2 lg:hidden">
          <LocationBar />
        </div>
      </div>
    </header>
  );
}
