import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/admin-auth";
import { getCategories, getProducts } from "@/lib/data";
import { formatInr } from "@/lib/shop";
import { saveCategory, saveProduct, saveVariant } from "@/app/admin/actions";

export default async function AdminProducts() {
  const { setupMode } = await requireAdmin();
  const [categories, products] = await Promise.all([
    getCategories({ includeInactive: true }),
    getProducts({ includeInactive: true })
  ]);

  return (
    <main className="admin-layout">
      <AdminNav />
      <section className="container section">
        <div className="admin-heading">
          <div>
            <span className="badge">Catalog admin</span>
            <h1>Products and packs</h1>
          </div>
        </div>
        {setupMode ? (
          <div className="notice">
            Forms are shown for layout preview. Connect Supabase service role to save changes.
          </div>
        ) : null}

        <div className="admin-grid">
          <form action={saveCategory} className="admin-card stack">
            <h2>Add category</h2>
            <div className="field">
              <label htmlFor="category-name">Name</label>
              <input id="category-name" name="name" required disabled={setupMode} />
            </div>
            <div className="field">
              <label htmlFor="category-slug">Slug</label>
              <input id="category-slug" name="slug" disabled={setupMode} />
            </div>
            <div className="field">
              <label htmlFor="category-description">Description</label>
              <textarea id="category-description" name="description" disabled={setupMode} />
            </div>
            <div className="field">
              <label htmlFor="category-image">Image URL</label>
              <input id="category-image" name="imageUrl" disabled={setupMode} />
            </div>
            <div className="field">
              <label htmlFor="category-order">Display order</label>
              <input id="category-order" name="displayOrder" type="number" defaultValue={1} disabled={setupMode} />
            </div>
            <label>
              <input name="active" type="checkbox" defaultChecked disabled={setupMode} /> Active
            </label>
            <button className="primary-button" type="submit" disabled={setupMode}>
              Save category
            </button>
          </form>

          <form action={saveProduct} className="admin-card stack">
            <h2>Add product</h2>
            <div className="field">
              <label htmlFor="product-category">Category</label>
              <select id="product-category" name="categoryId" required disabled={setupMode}>
                {categories.map((category) => (
                  <option value={category.id} key={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="product-name">Name</label>
              <input id="product-name" name="name" required disabled={setupMode} />
            </div>
            <div className="field">
              <label htmlFor="product-slug">Slug</label>
              <input id="product-slug" name="slug" disabled={setupMode} />
            </div>
            <div className="field">
              <label htmlFor="product-label">Wholesale label</label>
              <input id="product-label" name="wholesaleLabel" defaultValue="Wholesale price" disabled={setupMode} />
            </div>
            <div className="field">
              <label htmlFor="product-description">Description</label>
              <textarea id="product-description" name="description" disabled={setupMode} />
            </div>
            <div className="field">
              <label htmlFor="product-images">Image URLs</label>
              <textarea id="product-images" name="images" placeholder="One URL per line" disabled={setupMode} />
            </div>
            <label>
              <input name="active" type="checkbox" defaultChecked disabled={setupMode} /> Active
            </label>
            <button className="primary-button" type="submit" disabled={setupMode}>
              Save product
            </button>
          </form>
        </div>

        <div className="section">
          <div className="section-heading">
            <h2>Current products</h2>
            <p>Edit products by adding a replacement entry with the same slug or use Supabase table editor for detailed edits.</p>
          </div>
          <div className="stack">
            {products.map((product) => (
              <article className="admin-card stack" key={product.id}>
                <div className="cart-total">
                  <div>
                    <span className="badge">{product.active ? "Active" : "Inactive"}</span>
                    <h2>{product.name}</h2>
                    <p className="muted">{product.description}</p>
                  </div>
                  <strong>{product.category?.name}</strong>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Pack</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((variant) => (
                      <tr key={variant.id}>
                        <td>{variant.packSize}</td>
                        <td>{formatInr(variant.priceInr)}</td>
                        <td>{variant.active ? "Active" : "Inactive"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <form action={saveVariant} className="checkout-form">
                  <input name="productId" type="hidden" value={product.id} />
                  <div className="field">
                    <label>Pack size</label>
                    <input name="packSize" placeholder="250g" required disabled={setupMode} />
                  </div>
                  <div className="field">
                    <label>Price INR</label>
                    <input name="priceInr" type="number" min={1} required disabled={setupMode} />
                  </div>
                  <div className="field">
                    <label>Compare price</label>
                    <input name="compareAtPriceInr" type="number" min={1} disabled={setupMode} />
                  </div>
                  <label>
                    <input name="active" type="checkbox" defaultChecked disabled={setupMode} /> Active
                  </label>
                  <button className="secondary-button" type="submit" disabled={setupMode}>
                    Add pack size
                  </button>
                </form>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
