"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Heart,
  Sparkles,
} from "lucide-react";

import Logo from "./Logo";
import SearchBar from "./SearchBar";
import LocationBar from "./LocationBar";
import UserButton from "./UserButton";
import CartButton from "./CartButton";
import NotificationBell from "./NotificationBell";

type Props = {
  sticky?: boolean;
};

export default function Navbar({
  sticky = true,
}: Props) {
  return (
    <header
      className={`z-50 border-b border-white/70 bg-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-2xl ${
        sticky
          ? "sticky top-0"
          : "relative"
      }`}
    >
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 md:py-4">
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="flex min-w-0 shrink-0 items-center gap-2">
            <Logo />

            <span className="hidden items-center gap-1 rounded-full border border-green-100 bg-green-50 px-2.5 py-1 text-[10px] font-extrabold text-green-700 xl:inline-flex">
              <Sparkles size={12} />
              Fresh in minutes
            </span>
          </div>

          <div className="hidden min-w-0 lg:block">
            <LocationBar />
          </div>

          <SearchWrapper className="hidden min-w-0 flex-1 md:block">
            <div className="rounded-2xl bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
              <SearchBar />
            </div>
          </SearchWrapper>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <Link
              href="/wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-gray-700 transition hover:border-red-100 hover:bg-red-50 hover:text-red-500 sm:h-11 sm:w-11"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart
                size={20}
                className="transition hover:fill-red-500"
              />
            </Link>

            <NotificationBell />
            <UserButton />

            <div className="hidden sm:block">
              <CartButton />
            </div>
          </div>
        </div>

        <SearchWrapper className="mt-3 md:hidden">
          <div className="rounded-2xl bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <SearchBar />
          </div>
        </SearchWrapper>

        <div className="mt-2 lg:hidden">
          <LocationBar />
        </div>
      </div>
    </header>
  );
}

function SearchWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}