"use client";

import Logo from "./Logo";
import SearchBar from "./SearchBar";
import LocationBar from "./LocationBar";
import UserButton from "./UserButton";
import CartButton from "./CartButton";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">

        <Logo />

        <LocationBar />

        <SearchBar />

        <UserButton />

        <CartButton />

      </div>
    </header>
  );
}