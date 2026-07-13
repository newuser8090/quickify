import type { ReactNode } from "react";

import StickyCartBar from "@/components/cart/StickyCartBar";

type Props = {
  children: ReactNode;
};

export default function ShopLayout({
  children,
}: Props) {
  return (
    <>
      {children}
    </>
  );
}