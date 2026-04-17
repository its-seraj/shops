import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutPanel } from "@/components/checkout-panel";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { getCategoryBySlug, getProducts } from "@/lib/data";

export default async function CategoryDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, products] = await Promise.all([
    getCategoryBySlug(slug),
    getProducts({ categorySlug: slug })
  ]);

  if (!category) {
    notFound();
  }

  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="badge">Category</span>
            <h2>{category.name}</h2>
          </div>
          <p>{category.description}</p>
        </div>
        <div className="hero-actions" style={{ marginTop: 0, marginBottom: 24 }}>
          <Link className="secondary-button" href="/categories">
            View all categories
          </Link>
          <a className="primary-button" href="#checkout">
            Send order enquiry
          </a>
        </div>
        <div className="product-grid">
          {products.length === 0 ? (
            <div className="notice">No active products found in this category.</div>
          ) : (
            products.map((product) => <ProductCard product={product} key={product.id} />)
          )}
        </div>
      </section>
      <section className="container section" id="checkout">
        <div className="section-heading">
          <h2>Send enquiry</h2>
          <p>
            Add products from this category, then submit your details. Our team will get in touch
            soon to confirm the order.
          </p>
        </div>
        <CheckoutPanel />
      </section>
    </main>
  );
}
