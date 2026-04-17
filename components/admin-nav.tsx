import Link from "next/link";
import { logoutAdmin } from "@/app/admin/actions";
import { LogoMark } from "@/components/logo-mark";

export function AdminNav() {
  return (
    <header className="topbar admin-topbar">
      <nav className="container admin-nav" aria-label="Admin navigation">
        <Link className="brand admin-brand" href="/admin">
          <LogoMark />
          <span>
            <strong>Wholesale India</strong>
            <small>Admin studio</small>
          </span>
        </Link>
        <div className="admin-nav-links">
          <Link className="admin-nav-link" href="/admin">
            Dashboard
          </Link>
          <Link className="admin-nav-link" href="/admin/products">
            Products
          </Link>
          <Link className="admin-nav-link" href="/admin/orders">
            Orders
          </Link>
          <Link className="admin-nav-link storefront-link" href="/">
            Storefront
          </Link>
          <form action={logoutAdmin}>
            <button className="admin-nav-link admin-logout" type="submit">
              Logout
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
