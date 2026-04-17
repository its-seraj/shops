"use client";

import { useCart } from "@/components/cart-provider";
import { formatInr } from "@/lib/shop";

export function CartDrawer() {
  const { items, isCartOpen, closeCart, subtotalInr, removeItem, updateQuantity } = useCart();

  if (!isCartOpen) {
    return null;
  }

  return (
    <>
      <button
        className="drawer-backdrop"
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
      />
      <aside className="cart-drawer" aria-label="Shopping cart">
        <div className="cart-header">
          <div>
            <span className="badge">Order enquiry</span>
            <h2>Your cart</h2>
          </div>
          <button className="ghost-button" type="button" onClick={closeCart}>
            Close
          </button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <p className="muted">Your cart is empty. Add a spice pack to begin.</p>
          ) : (
            items.map((item) => (
              <div className="cart-row" key={item.variant.id}>
                <div>
                  <strong>{item.product.name}</strong>
                  <p className="muted">
                    {item.variant.packSize} | {formatInr(item.variant.priceInr)}
                  </p>
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => removeItem(item.variant.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="stack">
                  <div className="qty-control">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <strong>{item.quantity}</strong>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <strong>{formatInr(item.variant.priceInr * item.quantity)}</strong>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-total">
          <span>Estimated total</span>
          <strong>{formatInr(subtotalInr)}</strong>
        </div>
        <a className="primary-button" href="#checkout" onClick={closeCart}>
          Continue to enquiry form
        </a>
      </aside>
    </>
  );
}
