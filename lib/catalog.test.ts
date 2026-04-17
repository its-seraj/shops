import { describe, expect, test } from "vitest";
import {
  filterProductsByCategorySlug,
  getCategoryPath,
  getProductActivationControl,
  groupProductsByCategory
} from "@/lib/catalog";
import type { Category, ProductWithCategory } from "@/lib/types";

function createCategory(slug: string): Category {
  return {
    id: slug,
    name: slug,
    slug,
    description: "",
    imageUrl: "",
    displayOrder: 1,
    active: true,
    createdAt: "2026-04-18T00:00:00.000Z",
    updatedAt: "2026-04-18T00:00:00.000Z"
  };
}

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

  test("groups products under their matching category for admin catalog views", () => {
    const categories = [createCategory("spices"), createCategory("gadgets")];
    const products = [
      createProduct({ id: "turmeric", categorySlug: "spices" }),
      createProduct({ id: "cumin", categorySlug: "spices" }),
      createProduct({ id: "headphones", categorySlug: "gadgets" })
    ];

    expect(
      groupProductsByCategory(categories, products).map((group) => ({
        categorySlug: group.category.slug,
        productIds: group.products.map((product) => product.id)
      }))
    ).toEqual([
      { categorySlug: "spices", productIds: ["turmeric", "cumin"] },
      { categorySlug: "gadgets", productIds: ["headphones"] }
    ]);
  });

  test("builds the correct product activation toggle control", () => {
    expect(getProductActivationControl(true)).toEqual({
      label: "Make inactive",
      nextActive: false
    });
    expect(getProductActivationControl(false)).toEqual({
      label: "Make active",
      nextActive: true
    });
  });
});
