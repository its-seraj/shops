insert into public.categories (name, slug, description, image_url, display_order, active)
values
  (
    'Wholesale Spices',
    'spices',
    'Fresh spice powders and whole spices packed for homes, retailers, restaurants, and resellers.',
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80',
    1,
    true
  )
on conflict (slug) do nothing;

insert into public.products (category_id, name, slug, description, images, wholesale_label, active)
select
  categories.id,
  product.name,
  product.slug,
  product.description,
  product.images,
  product.wholesale_label,
  true
from public.categories
cross join (
  values
    (
      'Salem Turmeric Powder',
      'salem-turmeric-powder',
      'High-curcumin turmeric powder with strong color and aroma for daily cooking and resale packs.',
      array['https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1200&q=80'],
      'Wholesale best seller'
    ),
    (
      'Guntur Red Chilli Powder',
      'guntur-red-chilli-powder',
      'Bold red chilli powder for restaurants, snacks, pickles, and high-volume kitchens.',
      array['https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?auto=format&fit=crop&w=1200&q=80'],
      'Hot wholesale deal'
    ),
    (
      'Coriander Powder',
      'coriander-powder',
      'Freshly ground coriander powder with a citrusy aroma and balanced flavor.',
      array['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80'],
      'Restaurant pack'
    )
) as product(name, slug, description, images, wholesale_label)
where categories.slug = 'spices'
on conflict (slug) do nothing;

insert into public.product_variants (product_id, pack_size, price_inr, compare_at_price_inr, active)
select products.id, variant.pack_size, variant.price_inr, variant.compare_at_price_inr, true
from public.products
cross join (
  values
    ('250g', 95, 120),
    ('500g', 180, 220),
    ('1kg', 330, 390)
) as variant(pack_size, price_inr, compare_at_price_inr)
where products.slug = 'salem-turmeric-powder'
on conflict do nothing;

insert into public.product_variants (product_id, pack_size, price_inr, compare_at_price_inr, active)
select products.id, variant.pack_size, variant.price_inr, variant.compare_at_price_inr, true
from public.products
cross join (
  values
    ('250g', 125, 150),
    ('500g', 235, 280),
    ('1kg', 450, 520)
) as variant(pack_size, price_inr, compare_at_price_inr)
where products.slug = 'guntur-red-chilli-powder'
on conflict do nothing;

insert into public.product_variants (product_id, pack_size, price_inr, compare_at_price_inr, active)
select products.id, variant.pack_size, variant.price_inr, variant.compare_at_price_inr, true
from public.products
cross join (
  values
    ('250g', 80, 100),
    ('500g', 150, 190),
    ('1kg', 285, 340)
) as variant(pack_size, price_inr, compare_at_price_inr)
where products.slug = 'coriander-powder'
on conflict do nothing;
