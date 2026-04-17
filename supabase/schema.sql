create extension if not exists "pgcrypto";

create type public.lead_order_status as enum ('new', 'contacted', 'confirmed', 'cancelled');

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  image_url text not null default '',
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text not null default '',
  images text[] not null default '{}',
  wholesale_label text not null default 'Wholesale price',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  pack_size text not null,
  price_inr integer not null check (price_inr > 0),
  compare_at_price_inr integer check (compare_at_price_inr is null or compare_at_price_inr > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lead_orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  customer_name text not null,
  phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  pincode text not null,
  notes text,
  status public.lead_order_status not null default 'new',
  total_estimate_inr integer not null default 0,
  source_metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lead_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.lead_orders(id) on delete cascade,
  product_id uuid,
  variant_id uuid,
  product_name_snapshot text not null,
  variant_label_snapshot text not null,
  unit_price_inr_snapshot integer not null,
  quantity integer not null check (quantity > 0),
  line_total_inr integer not null,
  created_at timestamptz not null default now()
);

create index categories_active_order_idx on public.categories(active, display_order);
create index products_category_active_idx on public.products(category_id, active);
create index variants_product_active_idx on public.product_variants(product_id, active);
create index lead_orders_status_created_idx on public.lead_orders(status, created_at desc);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger product_variants_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

create trigger lead_orders_updated_at
before update on public.lead_orders
for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.lead_orders enable row level security;
alter table public.lead_order_items enable row level security;

create policy "Public can read active categories"
on public.categories for select
using (active = true);

create policy "Public can read active products"
on public.products for select
using (active = true);

create policy "Public can read active variants"
on public.product_variants for select
using (active = true);

create policy "Authenticated admins can manage categories"
on public.categories for all
to authenticated
using (true)
with check (true);

create policy "Authenticated admins can manage products"
on public.products for all
to authenticated
using (true)
with check (true);

create policy "Authenticated admins can manage variants"
on public.product_variants for all
to authenticated
using (true)
with check (true);

create policy "Authenticated admins can read orders"
on public.lead_orders for select
to authenticated
using (true);

create policy "Authenticated admins can update orders"
on public.lead_orders for update
to authenticated
using (true)
with check (true);

create policy "Authenticated admins can read order items"
on public.lead_order_items for select
to authenticated
using (true);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
