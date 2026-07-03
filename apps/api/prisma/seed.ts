/**
 * Database seed — populates the DB with the data from the mockup
 * (apps/_mockup/Components/data.jsx) plus two demo users.
 *
 * Run: pnpm --filter @jugasaro/api prisma:seed
 */
import { PrismaClient, ProductTag, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

// ---------- helpers ----------
const slugify = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const toCents = (dollars: number): number => Math.round(dollars * 100);

const tagFromString = (t: string | undefined): ProductTag | null => {
  if (!t) return null;
  return t.toUpperCase() as ProductTag;
};

// ---------- mockup data ----------
const BRAND_NAMES = [
  'Northline', 'Volta & Co', 'Meridian', 'Kasai', 'Field Studio', 'Hemlock',
  'Ojai Goods', 'Tusken', 'Monvela', 'Arcadia', 'Sable & Sons', 'Brightwell',
  'Korvo', 'Lumenhaus', 'Parallel', 'Stonecroft', 'Wovenly', 'Aurea',
  'Highmark', 'Elm & Ember', 'Cobalt Lane', 'Foxglove', 'Harbor Hill', 'Ironside',
  'Juneberry', 'Klein Studio', 'Lindenfeld', 'Moss & Co', 'Nordhus', 'Oakbridge',
  'Pensa Lab', 'Quill & Quill', 'Ravenwood', 'Silvercrest', 'Timberyard', 'Undine',
  'Vermilion', 'Wilder', 'Xander', 'Yarrow', 'Zephyr', 'Ashland',
  'Brookmere', 'Chevall', 'Driftwood', 'Echo Works', 'Fawnridge', 'Grayson & Co',
  'Hollowpine', 'Irongate', 'Jasmer', 'Kingsley', 'Larkfield', 'Mossvale',
  'Nightfall', 'Oakworth', 'Pembrook', 'Quarter Mile', 'Ridgeline', 'Stoneheart',
  'Thornwood', 'Umbra', 'Vesper', 'Winslow', 'Yonderly', 'Zellwood',
  'Alderwick', 'Briarly', 'Cloudhaven', 'Dawnridge', 'Everhart', 'Fernbrook',
  'Glade & Co', 'Hartwell', 'Inkstone', 'Junewood', 'Kestrel', 'Lakemont',
  'Maple Ridge', 'Nightingale', 'Orris', 'Pineford', 'Quay', 'Reedham',
  'Sandpiper', 'Thistle', 'Umbel', 'Varna', 'Willowdale', 'Yewbank',
  'Ashwood', 'Bristle', 'Cinder', 'Dovewood', 'Ember Lane', 'Foxtail',
  'Grove', 'Hearth & Home', 'Indigo Bay', 'Juniper',
];

const CATEGORY_DATA = [
  { name: 'Home & Living', description: 'Furniture, lighting, textiles & decor.' },
  { name: 'Fashion', description: 'Clothing, accessories & footwear.' },
  { name: 'Tech & Audio', description: 'Headphones, speakers, smart devices.' },
  { name: 'Beauty', description: 'Skincare, fragrance & wellness.' },
  { name: 'Outdoor', description: 'Bags, gear and outdoor essentials.' },
  { name: 'Kitchen', description: 'Cookware, dinnerware & coffee.' },
  { name: 'Office', description: 'Desk accessories & stationery.' },
  { name: 'Travel', description: 'Luggage, carry-ons and travel gear.' },
  { name: 'Wellness', description: 'Self-care, supplements & relaxation.' },
  { name: 'Kids', description: 'Toys, clothing and books for kids.' },
  { name: 'Pets', description: 'Beds, toys and food for pets.' },
  { name: 'Stationery', description: 'Notebooks, pens, paper goods.' },
];

// Reference photo pools per category (Unsplash). The frontend falls back to a
// gradient placeholder if any URL fails to load, so coverage is graceful.
const IMG = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;

const CATEGORY_IMAGES: Record<string, string[]> = {
  'Home & Living': ['photo-1586023492125-27b2c045efd7', 'photo-1567538096630-e0c55bd6374c', 'photo-1503602642458-232111445657', 'photo-1556228453-efd6c1ff04f6'],
  Fashion: ['photo-1551028719-00167b16eac5', 'photo-1483985988355-763728e1935b', 'photo-1576566588028-4147f3842f27', 'photo-1542291026-7eec264c27ff'],
  'Tech & Audio': ['photo-1505740420928-5e560c06d30e', 'photo-1545454675-3531b543be5d', 'photo-1608043152269-423dbba4e7e1', 'photo-1484704849700-f032a568e944'],
  Beauty: ['photo-1556228720-195a672e8a03', 'photo-1571781926291-c477ebfd024b', 'photo-1612817288484-6f916006741a', 'photo-1598440947619-2c35fc9aa908'],
  Outdoor: ['photo-1553062407-98eeb64c6a62', 'photo-1551698618-1dfe5d97d256', 'photo-1622260614153-03223fb72052', 'photo-1517466787929-bc90951d0974'],
  Kitchen: ['photo-1556909114-f6e7ad7d3136', 'photo-1495774856032-8b90bbb32b32', 'photo-1514066558159-fc8c737ef259', 'photo-1556910103-1c02745aae4d'],
  Office: ['photo-1497032205916-ac775f0649ae', 'photo-1524758631624-e2822e304c36', 'photo-1593642702821-c8da6771f0c6', 'photo-1542435503-956c469947f6'],
  Travel: ['photo-1553531384-cc64ac80f931', 'photo-1565026057447-bc90a3dceb87', 'photo-1488646953014-85cb44e25828', 'photo-1610701596007-11502861dcfa'],
  Wellness: ['photo-1540555700478-4be289fbecef', 'photo-1544161515-4ab6ce6db874', 'photo-1600334129128-685c5582fd35', 'photo-1556228578-8c89e6adf883'],
  Kids: ['photo-1545558014-8692077e9b5c', 'photo-1530103862676-de8c9debad1d', 'photo-1503454537195-1dcabb73ffb9', 'photo-1596461404969-9ae70f2830c1'],
  Pets: ['photo-1548767797-d8c844163c4c', 'photo-1583511655857-d19b40a7a54e', 'photo-1601758228041-f3b2795255f1', 'photo-1450778869180-41d0601e046e'],
  Stationery: ['photo-1531346878377-a5be20888e57', 'photo-1517842645767-c639042777db', 'photo-1583485088034-697b5bc54ccd', 'photo-1606760227091-3dd870d97f1d'],
};

const imagesForProduct = (catName: string, id: number): string[] => {
  const pool = CATEGORY_IMAGES[catName] ?? CATEGORY_IMAGES['Home & Living'];
  const a = pool[id % pool.length];
  const b = pool[(id + 1) % pool.length];
  return [IMG(a), IMG(b)];
};

interface MockProduct {
  id: number;
  brand: string;
  name: string;
  price: number;
  was?: number;
  tag?: string;
  variants?: string[];
  sizes?: string[];
  cat: string;
  oos?: boolean;
}

const PRODUCTS: MockProduct[] = [
  { id: 1, brand: 'Northline', name: 'Weekender Leather Duffel Bag', price: 268, was: 320, tag: 'sale', variants: ['#1a1a1a', '#5c4a3a', '#8b6f47'], cat: 'Fashion' },
  { id: 2, brand: 'Volta & Co', name: 'Studio Desk Lamp — Matte Black', price: 149, tag: 'new', variants: ['#1a1a1a', '#eeeeee'], cat: 'Home & Living' },
  { id: 3, brand: 'Meridian', name: 'Ceramic Pour-Over Coffee Set (4pc)', price: 88, cat: 'Kitchen' },
  { id: 4, brand: 'Kasai', name: 'Merino Crewneck Sweater', price: 120, was: 160, tag: 'sale', sizes: ['S', 'M', 'L', 'XL'], cat: 'Fashion' },
  { id: 5, brand: 'Field Studio', name: 'Heritage Canvas Apron', price: 64, cat: 'Home & Living' },
  { id: 6, brand: 'Hemlock', name: 'Walnut Cutting Board — Large', price: 72, tag: 'hot', cat: 'Kitchen' },
  { id: 7, brand: 'Lumenhaus', name: 'Noise-Cancelling Earbuds Pro', price: 199, was: 249, variants: ['#1a1a1a', '#ffffff', '#8a7ab5'], cat: 'Tech & Audio' },
  { id: 8, brand: 'Arcadia', name: 'Linen Bath Towel Set', price: 96, cat: 'Home & Living' },
  { id: 9, brand: 'Aurea', name: 'Cold Brew Carafe 1L', price: 48, tag: 'new', cat: 'Kitchen' },
  { id: 10, brand: 'Parallel', name: 'Leather-Wrapped Notebook', price: 34, cat: 'Stationery' },
  { id: 11, brand: 'Stonecroft', name: 'Cast Iron Candle Holder', price: 56, oos: true, cat: 'Home & Living' },
  { id: 12, brand: 'Brightwell', name: 'Pima Cotton Oxford Shirt', price: 110, tag: 'new', sizes: ['S', 'M', 'L', 'XL'], cat: 'Fashion' },
  { id: 13, brand: 'Korvo', name: 'Wool Beanie — Charcoal', price: 38, cat: 'Fashion', variants: ['#333', '#8a7ab5', '#d2c9b6'] },
  { id: 14, brand: 'Ojai Goods', name: 'Beeswax Taper Candles (Set of 6)', price: 28, cat: 'Home & Living' },
  { id: 15, brand: 'Wovenly', name: 'Handwoven Cotton Throw Blanket', price: 135, oos: true, cat: 'Home & Living' },
  { id: 16, brand: 'Tusken', name: 'All-Weather Backpack 24L', price: 178, tag: 'hot', variants: ['#1a1a1a', '#4a4a52'], cat: 'Outdoor' },
  { id: 17, brand: 'Monvela', name: 'Silk Pillowcase Set', price: 82, was: 110, tag: 'sale', variants: ['#eee', '#d4c5e0'], cat: 'Home & Living' },
  { id: 18, brand: 'Sable & Sons', name: 'Aged Cheddar Box (3 varieties)', price: 42, cat: 'Kitchen' },
  { id: 19, brand: 'Ironside', name: 'Minimal Steel Wallet', price: 58, cat: 'Fashion' },
  { id: 20, brand: 'Foxglove', name: 'Rose Geranium Face Serum', price: 66, tag: 'new', cat: 'Beauty' },
  { id: 21, brand: 'Juneberry', name: 'Cedar & Sage Room Spray', price: 32, cat: 'Beauty' },
  { id: 22, brand: 'Harbor Hill', name: 'Reclaimed Teak Cutting Board', price: 95, cat: 'Kitchen', oos: true },
  { id: 23, brand: 'Cobalt Lane', name: 'Pour-Over Kettle — Copper', price: 128, cat: 'Kitchen' },
  { id: 24, brand: 'Ravenwood', name: 'Wax Canvas Tote', price: 92, variants: ['#3a3a3a', '#6b5d48'], cat: 'Fashion' },
  { id: 25, brand: 'Silvercrest', name: 'Brass Clip-On Desk Clock', price: 78, tag: 'new', cat: 'Office' },
  { id: 26, brand: 'Elm & Ember', name: 'Smoke & Oak Candle 10oz', price: 42, cat: 'Home & Living' },
  { id: 27, brand: 'Timberyard', name: 'Oak Hanger Set (12pc)', price: 64, cat: 'Home & Living' },
  { id: 28, brand: 'Highmark', name: 'Alpaca Wool Scarf', price: 145, was: 180, tag: 'sale', variants: ['#333', '#9b8a6a', '#5e556b'], cat: 'Fashion' },
  { id: 29, brand: 'Klein Studio', name: 'Porcelain Pasta Bowl Set', price: 74, cat: 'Kitchen' },
  { id: 30, brand: 'Pensa Lab', name: 'Aluminum Travel Mug 16oz', price: 36, cat: 'Outdoor', variants: ['#aaa', '#333', '#8a7ab5'] },
  { id: 31, brand: 'Moss & Co', name: 'Organic Cotton Bath Mat', price: 58, cat: 'Home & Living' },
  { id: 32, brand: 'Oakbridge', name: 'Leather Card Holder — Slim', price: 48, cat: 'Fashion' },
  { id: 33, brand: 'Quill & Quill', name: 'Refillable Fountain Pen', price: 88, tag: 'new', cat: 'Stationery' },
  { id: 34, brand: 'Vermilion', name: 'Cashmere Knit Crew', price: 210, sizes: ['S', 'M', 'L', 'XL'], cat: 'Fashion', oos: true },
  { id: 35, brand: 'Wilder', name: 'Trail Running Socks (3pk)', price: 26, cat: 'Outdoor' },
  { id: 36, brand: 'Yarrow', name: 'Botanical Bath Salts 12oz', price: 24, cat: 'Beauty' },
  { id: 37, brand: 'Zephyr', name: 'Packable Rain Shell', price: 168, tag: 'hot', sizes: ['S', 'M', 'L', 'XL'], cat: 'Outdoor' },
  { id: 38, brand: 'Driftwood', name: 'Sea Salt & Cedar Bar Soap', price: 14, cat: 'Beauty' },
  { id: 39, brand: 'Echo Works', name: 'Portable Bluetooth Speaker', price: 158, was: 198, tag: 'sale', variants: ['#333', '#d4c5e0'], cat: 'Tech & Audio' },
  { id: 40, brand: 'Ashland', name: 'Raw Denim Jacket — Indigo', price: 230, sizes: ['S', 'M', 'L', 'XL'], cat: 'Fashion' },
];

// ---------- main ----------
async function main() {
  console.log('🌱 Seeding database…');

  // 1. Wipe existing data (idempotent reseeds)
  console.log('  · clearing existing data');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.address.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.heroSlide.deleteMany();

  // 2. Demo users
  console.log('  · creating demo users');
  const userPassword = await argon2.hash('Demo1234!');
  const adminPassword = await argon2.hash('Admin1234!');

  await prisma.user.createMany({
    data: [
      {
        email: 'ana@jugasaro.com',
        passwordHash: userPassword,
        name: 'Ana Demo',
        role: UserRole.USER,
      },
      {
        email: 'admin@jugasaro.com',
        passwordHash: adminPassword,
        name: 'Carlos Admin',
        role: UserRole.ADMIN,
      },
    ],
  });

  // 2b. Hero slides (home carousel — editable from the admin)
  console.log('  · creating 3 hero slides');
  await prisma.heroSlide.createMany({
    data: [
      {
        title: 'New season — Vol. 04',
        subtitle: 'Fresh drops from 100+ curated brands, one seamless store.',
        ctaLabel: 'Shop the drop',
        ctaHref: '/shop',
        imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1920&q=75',
        position: 0,
      },
      {
        title: 'Sound that moves you',
        subtitle: 'Premium audio from Lumenhaus, Echo Works and more.',
        ctaLabel: 'Shop Tech & Audio',
        ctaHref: '/categories/tech-and-audio',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1920&q=75',
        position: 1,
      },
      {
        title: 'Make your house a home',
        subtitle: 'Furniture, lighting and textiles for slow living.',
        ctaLabel: 'Shop Home & Living',
        ctaHref: '/categories/home-and-living',
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1920&q=75',
        position: 2,
      },
    ],
  });

  // 3. Brands
  console.log(`  · creating ${BRAND_NAMES.length} brands`);
  await prisma.brand.createMany({
    data: BRAND_NAMES.map((name) => ({
      slug: slugify(name),
      name,
      description: `Curated picks from ${name}.`,
    })),
  });

  // 4. Categories
  console.log(`  · creating ${CATEGORY_DATA.length} categories`);
  await prisma.category.createMany({
    data: CATEGORY_DATA.map((c) => ({
      slug: slugify(c.name),
      name: c.name,
      description: c.description,
      imageUrl: (CATEGORY_IMAGES[c.name] ?? [])[0] ? IMG((CATEGORY_IMAGES[c.name] ?? [])[0]) : null,
    })),
  });

  // 5. Products + variants
  console.log(`  · creating ${PRODUCTS.length} products`);

  const brandsByName = new Map(
    (await prisma.brand.findMany()).map((b) => [b.name, b]),
  );
  const categoriesByName = new Map(
    (await prisma.category.findMany()).map((c) => [c.name, c]),
  );

  for (const p of PRODUCTS) {
    const brand = brandsByName.get(p.brand);
    const category = categoriesByName.get(p.cat);
    if (!brand || !category) {
      throw new Error(
        `Missing brand or category for product "${p.name}" (brand=${p.brand}, cat=${p.cat})`,
      );
    }

    // Build variants from colors and/or sizes; if both, do a cartesian product.
    type VariantInput = { color: string | null; size: string | null };
    const colorList: (string | null)[] = p.variants?.length ? p.variants : [null];
    const sizeList: (string | null)[] = p.sizes?.length ? p.sizes : [null];
    const variantInputs: VariantInput[] = [];
    for (const color of colorList) {
      for (const size of sizeList) {
        variantInputs.push({ color, size });
      }
    }

    const productSlug = slugify(`${p.brand}-${p.name}-${p.id}`);

    const created = await prisma.product.create({
      data: {
        slug: productSlug,
        name: p.name,
        description: `${p.name} by ${p.brand}.`,
        price: toCents(p.price),
        compareAtPrice: p.was ? toCents(p.was) : null,
        tag: tagFromString(p.tag),
        outOfStock: !!p.oos,
        brandId: brand.id,
        categoryId: category.id,
        images: {
          create: imagesForProduct(p.cat, p.id).map((url, idx) => ({
            url,
            alt: p.name,
            position: idx,
          })),
        },
      },
    });

    if (variantInputs.length > 0 && (p.variants?.length || p.sizes?.length)) {
      await prisma.productVariant.createMany({
        data: variantInputs.map((v, idx) => ({
          productId: created.id,
          sku: `${productSlug}-${idx + 1}`.slice(0, 60),
          color: v.color,
          size: v.size,
          stock: p.oos ? 0 : 25,
        })),
      });
    } else {
      // Single default variant for products without color/size
      await prisma.productVariant.create({
        data: {
          productId: created.id,
          sku: `${productSlug}-default`.slice(0, 60),
          color: null,
          size: null,
          stock: p.oos ? 0 : 50,
        },
      });
    }
  }

  // 6. Summary
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.brand.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.productVariant.count(),
  ]);

  console.log('\n✅ Seed complete:');
  console.log(`   users:      ${counts[0]}`);
  console.log(`   brands:     ${counts[1]}`);
  console.log(`   categories: ${counts[2]}`);
  console.log(`   products:   ${counts[3]}`);
  console.log(`   variants:   ${counts[4]}`);
  console.log('\nDemo credentials:');
  console.log('   user  → ana@jugasaro.com   / Demo1234!');
  console.log('   admin → admin@jugasaro.com / Admin1234!');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
