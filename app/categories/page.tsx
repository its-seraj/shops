import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getCategoryPath } from "@/lib/catalog";
import { getCategories } from "@/lib/data";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="badge">Shop by category</span>
            <h2>All categories</h2>
          </div>
          <p>
            Choose a category to view only products from that section. Spices are live now, and
            future categories like gadgets can be added from the admin panel.
          </p>
        </div>
        <div className="category-grid">
          {categories.length === 0 ? (
            <div className="notice">No active categories found.</div>
          ) : (
            categories.map((category) => (
              <Link className="category-card" href={getCategoryPath(category.slug)} key={category.id}>
                {category.imageUrl ? <img alt="" src={category.imageUrl} /> : null}
                <div className="category-card-content">
                  <span className="badge">Open category</span>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
