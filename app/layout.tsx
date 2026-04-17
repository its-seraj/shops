import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { MetaPixel } from "@/components/meta-pixel";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-serif"
});

export const metadata: Metadata = {
  title: "Wholesale India",
  description: "Wholesale spices and multi-category products with manual order confirmation."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable}`}>
        <MetaPixel pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID} />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
