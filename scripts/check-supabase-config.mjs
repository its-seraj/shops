import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(path) {
  if (!existsSync(path)) {
    return;
  }

  const lines = readFileSync(path, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");

    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    const rawValue = trimmed.slice(equalsIndex + 1).trim();
    process.env[key] ??= rawValue.replace(/^["']|["']$/g, "");
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY"
];

const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(`Missing env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);

const { data: categories, error: categoryError } = await supabase
  .from("categories")
  .select("id,name,slug,active")
  .order("display_order");

if (categoryError) {
  console.error("Could not read categories:", categoryError.message);
  process.exit(1);
}

const { data: products, error: productError } = await supabase
  .from("products")
  .select("id,name,slug,active,product_variants(id,pack_size,price_inr,active)")
  .order("name");

if (productError) {
  console.error("Could not read products:", productError.message);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      connected: true,
      categoryCount: categories?.length ?? 0,
      productCount: products?.length ?? 0,
      categories,
      products
    },
    null,
    2
  )
);
