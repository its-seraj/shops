import Link from "next/link";
import { CheckoutPanel } from "@/components/checkout-panel";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { getCategoryPath } from "@/lib/catalog";
import { getCategories, getProducts } from "@/lib/data";

export default async function Home() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="container hero">
        <div>
          <p className="eyebrow">Wholesale pricing | Manual confirmation</p>
          <h1>Premium spices ready for serious buyers.</h1>
          <p className="hero-copy">
            Launching with quality spice packs for homes, kirana stores, restaurants, and
            resellers. Add quantities, share your address, and we will confirm availability,
            delivery, and final order details personally.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/categories/spices">
              Shop spice packs
            </Link>
            <a className="secondary-button" href="#checkout">
              Send order enquiry
            </a>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-image" aria-label="Assorted Indian spices" />
          <div className="hero-stat">
            <strong>3 sizes</strong>
            <span>Simple 250g, 500g, and 1kg pack options for fast ad-to-order flow.</span>
          </div>
        </div>
      </section>

      <section className="container trust-row" aria-label="Store benefits">
        {[
          ["No online payment", "Submit enquiry first and confirm directly."],
          ["INR pricing", "Clear pack-size prices for Indian buyers."],
          ["WhatsApp follow-up", "Your enquiry is ready for quick confirmation."],
          ["Future categories", "Built for spices today and gadgets later."]
        ].map(([title, copy]) => (
          <div className="trust-card" key={title}>
            <strong>{title}</strong>
            <span>{copy}</span>
          </div>
        ))}
      </section>

      <section className="container section" id="categories">
        <div className="section-heading">
          <h2>Browse categories</h2>
          <p>
            The site starts with wholesale spices and keeps the category system ready for
            future ranges like gadgets, accessories, and seasonal items.
          </p>
        </div>
        <div className="category-grid">
          {categories.length === 0 ? (
            <div className="notice">
              No active categories found. Connect Supabase and add categories from the admin panel
              or run `supabase/seed.sql`.
            </div>
          ) : (
            categories.map((category) => (
              <Link className="category-card" href={getCategoryPath(category.slug)} key={category.id}>
                {category.imageUrl ? <img alt="" src={category.imageUrl} /> : null}
                <div className="category-card-content">
                  <span className="badge">{category.active ? "Available now" : "Coming soon"}</span>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="container section" id="products">
        <div className="section-heading">
          <h2>Wholesale spice packs</h2>
          <p>
            Choose pack size, add quantity, and keep building the cart. The estimated total is
            saved with your lead so price changes later do not rewrite old enquiries.
          </p>
        </div>
        <div className="product-grid" id="spices">
          {products.length === 0 ? (
            <div className="notice">
              No active products found. Add products in Supabase/admin before launching ads.
            </div>
          ) : (
            products.map((product) => <ProductCard product={product} key={product.id} />)
          )}
        </div>
      </section>

      <section className="container section" id="checkout">
        <div className="section-heading">
          <h2>Send enquiry</h2>
          <p>
            Fill your name, phone, and full address. There is no payment step; we will contact
            you to confirm stock, delivery, and final order details.
          </p>
        </div>
        <CheckoutPanel />
      </section>

      <footer className="footer">
        <div className="container">
          <strong>Wholesale India</strong>
          <p>Built for Meta ad traffic, manual confirmation, and future multi-category growth.</p>
        </div>
      </footer>
    </main>
  );
}
