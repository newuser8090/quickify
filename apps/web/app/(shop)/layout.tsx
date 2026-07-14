import type {
  ReactNode,
} from "react";

import QuickMateProvider from "@/components/quickmate/QuickMateProvider";

type Props = {
  children: ReactNode;
};

export default function ShopLayout({
  children,
}: Props) {
  return (
    <>
      {children}
      <QuickMateProvider />
    </>
  );
}