import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";

import AuthProvider from "@/components/providers/AuthProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import RealtimeProvider from "@/components/providers/RealtimeProvider";
import MaintenanceProvider from "@/components/providers/MaintenanceProvider";
import CartProvider from "@/components/providers/CartProvider";
import WishlistProvider from "@/components/providers/WishlistProvider";
import AddressProvider from "@/components/providers/AddressProvider";
import StickyCartBar from "@/components/cart/StickyCartBar";

import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Quickify",
  description: "Groceries delivered in minutes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <QueryProvider>
            <RealtimeProvider>
              <MaintenanceProvider>
                <CartProvider>
                  <WishlistProvider>
                    <AddressProvider>
                      {children}
                      <StickyCartBar />
                    </AddressProvider>
                  </WishlistProvider>
                </CartProvider>
              </MaintenanceProvider>
            </RealtimeProvider>
          </QueryProvider>

          <Toaster
            position="bottom-center"
            offset={64}
            richColors
            closeButton
            duration={2000}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
