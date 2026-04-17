import type { Category, ProductWithCategory } from "@/lib/types";

export function getCategoryPath(slug: string) {
  return `/categories/${encodeURIComponent(slug)}`;
}

export function filterProductsByCategorySlug(
  products: ProductWithCategory[],
  categorySlug: string
) {
  return products.filter((product) => product.category?.slug === categorySlug);
}

export function groupProductsByCategory(
  categories: Category[],
  products: ProductWithCategory[]
) {
  return categories.map((category) => ({
    category,
    products: products.filter((product) => product.categoryId === category.id)
  }));
}

export function getProductActivationControl(active: boolean) {
  return active
    ? { label: "Make inactive", nextActive: false }
    : { label: "Make active", nextActive: true };
}
