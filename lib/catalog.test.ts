import { describe, expect, test } from "vitest";
import { filterProductsByCategorySlug, getCategoryPath } from "@/lib/catalog";
import type { ProductWithCategory } from "@/lib/types";

function createProduct({
  id,
  categorySlug
}: {
  id: string;
  categorySlug: string;
}): ProductWithCategory {
  return {
    id,
    categoryId: categorySlug,
    category: {
      id: categorySlug,
      name: categorySlug,
      slug: categorySlug,
      description: "",
      imageUrl: "",
      displayOrder: 1,
      active: true,
      createdAt: "2026-04-18T00:00:00.000Z",
      updatedAt: "2026-04-18T00:00:00.000Z"
    },
    name: id,
    slug: id,
    description: "",
    images: [],
    wholesaleLabel: "Wholesale",
    active: true,
    createdAt: "2026-04-18T00:00:00.000Z",
    updatedAt: "2026-04-18T00:00:00.000Z",
    variants: []
  };
}

describe("catalog routing", () => {
  test("builds path-based category URLs from category slugs", () => {
    expect(getCategoryPath("spices")).toBe("/categories/spices");
  });

  test("filters product listings to the selected category slug", () => {
    const products = [
      createProduct({ id: "turmeric", categorySlug: "spices" }),
      createProduct({ id: "headphones", categorySlug: "gadgets" })
    ];

    expect(filterProductsByCategorySlug(products, "spices").map((product) => product.id)).toEqual([
      "turmeric"
    ]);
  });
});
