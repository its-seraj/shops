"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { formatInr, getDefaultVariant, trackMetaEvent } from "@/lib/shop";
import type { ProductWithCategory } from "@/lib/types";

export function ProductCard({ product }: { product: ProductWithCategory }) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(() => getDefaultVariant(product.variants));
  const image = product.images[0];

  return (
    <article className="product-card">
      <div className="product-image">
        {image ? <img src={image} alt={product.name} /> : null}
        <span className="badge">{product.wholesaleLabel}</span>
      </div>
      <div className="product-content">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="variant-row" aria-label={`${product.name} pack sizes`}>
          {product.variants
            .filter((variant) => variant.active)
            .map((variant) => (
              <button
                className={`variant-button ${
                  selectedVariant?.id === variant.id ? "active" : ""
                }`}
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariant(variant)}
              >
                <span>{variant.packSize}</span>
                <span className="price">
                  {formatInr(variant.priceInr)}
                  {variant.compareAtPriceInr ? (
                    <span className="strike">{formatInr(variant.compareAtPriceInr)}</span>
                  ) : null}
                </span>
              </button>
            ))}
        </div>
        <div className="product-actions">
          <button
            className="primary-button"
            type="button"
            disabled={!selectedVariant}
            onClick={() => {
              if (!selectedVariant) {
                return;
              }

              addItem(product, selectedVariant);
              trackMetaEvent({
                pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID,
                eventName: "AddToCart",
                payload: {
                  content_name: product.name,
                  content_ids: [selectedVariant.id],
                  currency: "INR",
                  value: selectedVariant.priceInr
                },
                fbq: window.fbq
              });
            }}
          >
            Add to cart
          </button>
          <Link className="secondary-button" href={`/products/${product.slug}`}>
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
