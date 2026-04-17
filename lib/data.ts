import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { filterProductsByCategorySlug } from "@/lib/catalog";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type {
  Category,
  LeadOrder,
  LeadOrderSnapshotItem,
  ProductVariant,
  ProductWithCategory
} from "@/lib/types";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type VariantRow = {
  id: string;
  product_id: string;
  pack_size: string;
  price_inr: number;
  compare_at_price_inr: number | null;
  active: boolean;
};

type ProductRow = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  wholesale_label: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  categories?: CategoryRow | null;
  product_variants?: VariantRow[];
};

type LeadOrderRow = {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  pincode: string;
  notes: string | null;
  status: LeadOrder["status"];
  total_estimate_inr: number;
  source_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  lead_order_items?: LeadOrderItemRow[];
};

type LeadOrderItemRow = {
  product_id: string | null;
  variant_id: string | null;
  product_name_snapshot: string;
  variant_label_snapshot: string;
  unit_price_inr_snapshot: number;
  quantity: number;
  line_total_inr: number;
};

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url,
    displayOrder: row.display_order,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapVariant(row: VariantRow): ProductVariant {
  return {
    id: row.id,
    productId: row.product_id,
    packSize: row.pack_size,
    priceInr: row.price_inr,
    compareAtPriceInr: row.compare_at_price_inr,
    active: row.active
  };
}

function mapProduct(row: ProductRow): ProductWithCategory {
  return {
    id: row.id,
    categoryId: row.category_id,
    category: row.categories ? mapCategory(row.categories) : undefined,
    name: row.name,
    slug: row.slug,
    description: row.description,
    images: row.images ?? [],
    wholesaleLabel: row.wholesale_label,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    variants: (row.product_variants ?? []).map(mapVariant)
  };
}

function mapLeadOrder(row: LeadOrderRow): LeadOrder {
  return {
    id: row.id,
    orderCode: row.order_code,
    customerName: row.customer_name,
    phone: row.phone,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    notes: row.notes,
    status: row.status,
    totalEstimateInr: row.total_estimate_inr,
    sourceMetadata: row.source_metadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: (row.lead_order_items ?? []).map(
      (item): LeadOrderSnapshotItem => ({
        productId: item.product_id ?? "",
        variantId: item.variant_id ?? "",
        productNameSnapshot: item.product_name_snapshot,
        variantLabelSnapshot: item.variant_label_snapshot,
        unitPriceInrSnapshot: item.unit_price_inr_snapshot,
        quantity: item.quantity,
        lineTotalInr: item.line_total_inr
      })
    )
  };
}

export async function getCategories({ includeInactive = false } = {}) {
  noStore();
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return [];
  }

  let query = supabase.from("categories").select("*").order("display_order");

  if (!includeInactive) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapCategory(row as CategoryRow));
}

export async function getCategoryBySlug(slug: string, { includeInactive = false } = {}) {
  const categories = await getCategories({ includeInactive });
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getProducts({
  includeInactive = false,
  categorySlug
}: {
  includeInactive?: boolean;
  categorySlug?: string;
} = {}) {
  noStore();
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("products")
    .select("*, categories(*), product_variants(*)")
    .order("name");

  if (!includeInactive) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const products = (data ?? []).map((row) => mapProduct(row as ProductRow));

  if (categorySlug) {
    return filterProductsByCategorySlug(products, categorySlug);
  }

  return products;
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function resolveCartItems(
  inputItems: { productId: string; variantId: string; quantity: number }[]
) {
  const products = await getProducts();

  return inputItems.flatMap((input) => {
    const product = products.find((candidate) => candidate.id === input.productId);
    const variant = product?.variants.find((candidate) => candidate.id === input.variantId);

    if (!product || !variant || !product.active || !variant.active) {
      return [];
    }

    return [
      {
        product,
        variant,
        quantity: Math.max(1, Math.min(99, Math.trunc(input.quantity)))
      }
    ];
  });
}

export async function getOrders() {
  noStore();
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("lead_orders")
    .select("*, lead_order_items(*)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapLeadOrder(row as LeadOrderRow));
}
