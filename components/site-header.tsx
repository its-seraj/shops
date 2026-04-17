"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { LogoMark } from "@/components/logo-mark";

export function SiteHeader() {
  const { itemCount, openCart } = useCart();

  return (
    <header className="topbar">
      <nav className="container nav" aria-label="Main navigation">
        <Link className="brand" href="/">
          <LogoMark />
          <span>Wholesale India</span>
        </Link>
        <div className="nav-links">
          <Link href="/categories">Categories</Link>
          <Link href="/categories/spices">Spices</Link>
          <Link href="/#checkout">Order enquiry</Link>
        </div>
        <button className="cart-button" type="button" onClick={openCart}>
          Cart ({itemCount})
        </button>
      </nav>
    </header>
  );
}
