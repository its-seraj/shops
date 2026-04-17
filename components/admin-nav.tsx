import Link from "next/link";
import { logoutAdmin } from "@/app/admin/actions";
import { LogoMark } from "@/components/logo-mark";

export function AdminNav() {
  return (
    <header className="topbar">
      <nav className="container admin-nav" aria-label="Admin navigation">
        <Link className="brand" href="/admin">
          <LogoMark />
          <span>Admin</span>
        </Link>
        <div className="admin-nav-links">
          <Link className="secondary-button" href="/">
            Storefront
          </Link>
          <Link className="secondary-button" href="/admin/products">
            Products
          </Link>
          <Link className="secondary-button" href="/admin/orders">
            Orders
          </Link>
          <form action={logoutAdmin}>
            <button className="ghost-button" type="submit">
              Logout
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
