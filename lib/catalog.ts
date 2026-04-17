import type { ProductWithCategory } from "@/lib/types";

export function getCategoryPath(slug: string) {
  return `/categories/${encodeURIComponent(slug)}`;
}

export function filterProductsByCategorySlug(
  products: ProductWithCategory[],
  categorySlug: string
) {
  return products.filter((product) => product.category?.slug === categorySlug);
}
