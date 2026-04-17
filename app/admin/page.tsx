import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/admin-auth";
import { getCategories, getOrders, getProducts } from "@/lib/data";
import { formatInr } from "@/lib/shop";

export default async function AdminDashboard() {
  const { setupMode } = await requireAdmin();
  const [categories, products, orders] = await Promise.all([
    getCategories({ includeInactive: true }),
    getProducts({ includeInactive: true }),
    getOrders()
  ]);

  return (
    <main className="admin-layout">
      <AdminNav />
      <section className="container section">
        <div className="admin-heading">
          <div>
            <span className="badge">{setupMode ? "Setup mode" : "Live admin"}</span>
            <h1>Order control room</h1>
          </div>
          <Link className="primary-button" href="/admin/orders">
            Review leads
          </Link>
        </div>
        {setupMode ? (
          <div className="notice">
            Supabase is not configured, so the storefront uses seed products and admin writes are
            disabled. Run `supabase/schema.sql`, seed data, and add env variables to go live.
          </div>
        ) : null}
        <div className="admin-grid">
          <div className="admin-card">
            <span className="badge">Catalog</span>
            <h2>{products.length} products</h2>
            <p className="muted">{categories.length} categories ready for multi-category selling.</p>
            <Link className="secondary-button" href="/admin/products">
              Manage products
            </Link>
          </div>
          <div className="admin-card">
            <span className="badge">Lead orders</span>
            <h2>{orders.length} enquiries</h2>
            <p className="muted">
              Current estimated order value:{" "}
              {formatInr(orders.reduce((sum, order) => sum + order.totalEstimateInr, 0))}
            </p>
            <Link className="secondary-button" href="/admin/orders">
              View orders
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
