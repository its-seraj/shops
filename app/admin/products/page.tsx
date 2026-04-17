import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/admin-auth";
import { getProductActivationControl, groupProductsByCategory } from "@/lib/catalog";
import { getCategories, getProducts } from "@/lib/data";
import { formatInr } from "@/lib/shop";
import {
  deleteProduct,
  deleteVariant,
  saveCategory,
  saveProduct,
  saveVariant,
  updateProductActive
} from "@/app/admin/actions";

function EyeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <path d="M12 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m3 3 18 18" />
      <path d="M10.6 10.6a2.5 2.5 0 0 0 2.8 2.8" />
      <path d="M8.7 5.4A10.8 10.8 0 0 1 12 5c6 0 9.5 7 9.5 7a16.7 16.7 0 0 1-3.1 3.9" />
      <path d="M6.2 6.8C3.8 8.5 2.5 12 2.5 12s3.5 7 9.5 7a10.3 10.3 0 0 0 5-1.3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M9 7V4h6v3" />
    </svg>
  );
}

export default async function AdminProducts() {
  const { setupMode } = await requireAdmin();
  const [categories, products] = await Promise.all([
    getCategories({ includeInactive: true }),
    getProducts({ includeInactive: true })
  ]);
  const productGroups = groupProductsByCategory(categories, products);

  return (
    <main className="admin-layout">
      <AdminNav />
      <section className="container section">
        <div className="admin-heading admin-hero-panel">
          <div>
            <span className="badge">Catalog admin</span>
            <h1>Products and packs</h1>
            <p className="muted">
              Add categories, publish products, tune pack sizes, and hide items that are not ready to sell.
            </p>
          </div>
        </div>
        {setupMode ? (
          <div className="notice">
            Forms are shown for layout preview. Connect Supabase service role to save changes.
          </div>
        ) : null}

        <div className="admin-grid admin-form-grid">
          <form action={saveCategory} className="admin-card admin-form-card stack">
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

          <form action={saveProduct} className="admin-card admin-form-card stack">
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
            <h2>Products by category</h2>
            <p>Manage each category separately. Deleting a product also removes its pack sizes.</p>
          </div>
          <div className="stack">
            {productGroups.map((group) => (
              <section className="admin-card category-admin-section stack" key={group.category.id}>
                <div className="cart-total">
                  <div>
                    <span className="badge">{group.category.active ? "Active category" : "Inactive category"}</span>
                    <h2>{group.category.name}</h2>
                    <p className="muted">{group.category.description || "No description added yet."}</p>
                  </div>
                  <strong>{group.products.length} products</strong>
                </div>

                {group.products.length === 0 ? (
                  <div className="notice">No products in this category yet.</div>
                ) : (
                  <div className="stack">
                    {group.products.map((product) => {
                      const activationControl = getProductActivationControl(product.active);

                      return (
                        <article className="admin-card product-admin-card stack" key={product.id}>
                          <div className="cart-total admin-product-header">
                            <div className="admin-product-title">
                              <span className="badge">{product.active ? "Active" : "Inactive"}</span>
                              <h3>{product.name}</h3>
                              <p className="muted">{product.description || "No description added yet."}</p>
                            </div>
                            <div className="admin-actions">
                              <form action={updateProductActive}>
                                <input name="productId" type="hidden" value={product.id} />
                                <input name="active" type="hidden" value={String(activationControl.nextActive)} />
                                <button
                                  aria-label={activationControl.label}
                                  className="icon-button active-icon-button"
                                  title={activationControl.label}
                                  type="submit"
                                  disabled={setupMode}
                                >
                                  {activationControl.nextActive ? <EyeIcon /> : <EyeOffIcon />}
                                </button>
                              </form>
                              <form action={deleteProduct}>
                                <input name="productId" type="hidden" value={product.id} />
                                <button
                                  aria-label="Delete product"
                                  className="icon-button danger-icon-button"
                                  title="Delete product"
                                  type="submit"
                                  disabled={setupMode}
                                >
                                  <TrashIcon />
                                </button>
                              </form>
                            </div>
                          </div>
                          <div className="admin-table-wrap">
                            <table className="admin-table">
                              <thead>
                                <tr>
                                  <th>Pack</th>
                                  <th>Price</th>
                                  <th>Status</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {product.variants.map((variant) => (
                                  <tr key={variant.id}>
                                    <td>{variant.packSize}</td>
                                    <td>{formatInr(variant.priceInr)}</td>
                                    <td>{variant.active ? "Active" : "Inactive"}</td>
                                    <td>
                                      <form action={deleteVariant}>
                                        <input name="variantId" type="hidden" value={variant.id} />
                                        <button className="ghost-button danger-button compact-button" type="submit" disabled={setupMode}>
                                          Delete pack
                                        </button>
                                      </form>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
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
                      );
                    })}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
