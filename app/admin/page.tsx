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
  const activeProducts = products.filter((product) => product.active).length;
  const newOrders = orders.filter((order) => order.status === "new").length;
  const totalLeadValue = orders.reduce((sum, order) => sum + order.totalEstimateInr, 0);

  return (
    <main className="admin-layout">
      <AdminNav />
      <section className="container section">
        <div className="admin-heading admin-hero-panel">
          <div>
            <span className="badge">{setupMode ? "Setup mode" : "Live admin"}</span>
            <h1>Order control room</h1>
            <p className="muted">
              Track wholesale enquiries, curate products, and keep your catalog ready for Meta ad traffic.
            </p>
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
        <div className="admin-metrics">
          <div className="admin-card metric-card">
            <span className="badge">Catalog</span>
            <h2>{products.length}</h2>
            <p className="muted">Total products</p>
          </div>
          <div className="admin-card metric-card">
            <span className="badge">Visible</span>
            <h2>{activeProducts}</h2>
            <p className="muted">Active products live on storefront</p>
          </div>
          <div className="admin-card metric-card">
            <span className="badge">New leads</span>
            <h2>{newOrders}</h2>
            <p className="muted">Waiting for follow-up</p>
          </div>
          <div className="admin-card metric-card highlight-metric">
            <span className="badge">Pipeline</span>
            <h2>{formatInr(totalLeadValue)}</h2>
            <p className="muted">Estimated enquiry value</p>
          </div>
        </div>

        <div className="admin-grid">
          <div className="admin-card admin-feature-card">
            <span className="badge">Catalog desk</span>
            <h2>Build your wholesale shelf</h2>
            <p className="muted">
              {categories.length} categories are ready for spices now and future gadgets later.
            </p>
            <Link className="secondary-button" href="/admin/products">
              Manage products
            </Link>
          </div>
          <div className="admin-card admin-feature-card dark-feature">
            <span className="badge">Lead orders</span>
            <h2>{orders.length} enquiries</h2>
            <p className="muted">
              Open every customer request, review address and items, then continue on WhatsApp.
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
