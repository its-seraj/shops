"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import type { LeadOrderStatus } from "@/lib/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function requireServiceClient() {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    throw new Error("Supabase service role is not configured.");
  }

  return supabase;
}

export async function loginAdmin(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/admin/login?error=Supabase%20is%20not%20configured");
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin");
}

export async function logoutAdmin() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}

export async function saveCategory(formData: FormData) {
  const supabase = requireServiceClient();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "");
  const slug = slugify(String(formData.get("slug") ?? name));
  const payload = {
    name,
    slug,
    description: String(formData.get("description") ?? ""),
    image_url: String(formData.get("imageUrl") ?? ""),
    display_order: Number(formData.get("displayOrder") ?? 0),
    active: formData.get("active") === "on"
  };

  if (id) {
    await supabase.from("categories").update(payload).eq("id", id);
  } else {
    await supabase.from("categories").insert(payload);
  }

  revalidatePath("/");
  revalidatePath("/admin/products");
}

export async function saveProduct(formData: FormData) {
  const supabase = requireServiceClient();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "");
  const slug = slugify(String(formData.get("slug") ?? name));
  const images = String(formData.get("images") ?? "")
    .split(/\r?\n|,/)
    .map((image) => image.trim())
    .filter(Boolean);
  const payload = {
    category_id: String(formData.get("categoryId") ?? ""),
    name,
    slug,
    description: String(formData.get("description") ?? ""),
    images,
    wholesale_label: String(formData.get("wholesaleLabel") ?? "Wholesale price"),
    active: formData.get("active") === "on"
  };

  if (id) {
    await supabase.from("products").update(payload).eq("id", id);
  } else {
    await supabase.from("products").insert(payload);
  }

  revalidatePath("/");
  revalidatePath("/admin/products");
}

export async function saveVariant(formData: FormData) {
  const supabase = requireServiceClient();
  const id = String(formData.get("id") ?? "");
  const compareAt = Number(formData.get("compareAtPriceInr") ?? 0);
  const payload = {
    product_id: String(formData.get("productId") ?? ""),
    pack_size: String(formData.get("packSize") ?? ""),
    price_inr: Number(formData.get("priceInr") ?? 0),
    compare_at_price_inr: compareAt > 0 ? compareAt : null,
    active: formData.get("active") === "on"
  };

  if (id) {
    await supabase.from("product_variants").update(payload).eq("id", id);
  } else {
    await supabase.from("product_variants").insert(payload);
  }

  revalidatePath("/");
  revalidatePath("/admin/products");
}

export async function updateOrderStatus(formData: FormData) {
  const supabase = requireServiceClient();
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "new") as LeadOrderStatus;

  await supabase.from("lead_orders").update({ status }).eq("id", orderId);
  revalidatePath("/admin/orders");
}
