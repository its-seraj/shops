import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { getProductBySlug } from "@/lib/data";

export default async function ProductDetail({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="badge">{product.category?.name ?? "Wholesale"}</span>
            <h2>{product.name}</h2>
          </div>
          <p>{product.description}</p>
        </div>
        <div style={{ maxWidth: 460 }}>
          <ProductCard product={product} />
        </div>
      </section>
    </main>
  );
}
