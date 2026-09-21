/**
 * =========================================================================
 * VAN BASKET PRODUCTION PRODUCT CATALOG & SEMANTIC ID MAPPING
 * =========================================================================
 * Defines human-readable, production-ready product and variant IDs.
 * Maps semantic identifiers (e.g., 'van-honey-250g', 'van-honey-500g')
 * to exact verified prices, labels, SKUs, and legacy database UUIDs.
 * =========================================================================
 */

export interface ProductVariantItem {
  id: string;            // Semantic production ID (e.g. 'van-honey-250g')
  productId: string;     // Semantic product ID (e.g. 'raw-wildflower-honey')
  productSlug?: string;  // Product slug for routing
  productName: string;   // Full product title
  sizeLabel: string;     // Variant label (e.g. '250g', '500g')
  price: number;         // Current verified price
  originalPrice?: number;// Strikethrough compare-at price
  sku: string;           // Official SKU code
  image: string;         // High-res product imagery
  dbUuid: string;        // Database UUID for backwards-compatible foreign keys
  stockQty: number;
  isActive: boolean;
}

export interface ProductCatalogItem {
  id: string;            // Semantic product ID (slug)
  slug: string;
  name: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  image: string;
  isPurchasable: boolean;
  freeShipping: boolean;
  variants: ProductVariantItem[];
}

export const VANBASKET_CATALOG: Record<string, ProductCatalogItem> = {
  "raw-wildflower-honey": {
    id: "raw-wildflower-honey",
    slug: "raw-wildflower-honey",
    name: "Wild Forest Honey",
    badge: "Signature Harvest",
    badgeColor: "bg-brand-honey text-brand-espresso font-bold",
    description:
      "Raw Apis dorsata wild forest honey gathered from high canopies in Chhattisgarh. Unpasteurized, unfiltered, and rich in natural pollen and enzymes.",
    image: "/assets/product/500g%20Honey/product-1.jpg",
    isPurchasable: true,
    freeShipping: true,
    variants: [
      {
        id: "van-honey-250g",
        productId: "raw-wildflower-honey",
        productName: "Wild Forest Honey",
        sizeLabel: "250g",
        price: 280,
        originalPrice: 350,
        sku: "VAN-HONEY-250G",
        image: "/assets/product/250g%20Honey/product-1.png",
        dbUuid: "a1111111-1111-1111-1111-111111111111",
        stockQty: 100,
        isActive: true,
      },
      {
        id: "van-honey-500g",
        productId: "raw-wildflower-honey",
        productName: "Wild Forest Honey",
        sizeLabel: "500g",
        price: 480,
        originalPrice: 599,
        sku: "VAN-HONEY-500G",
        image: "/assets/product/500g%20Honey/product-1.jpg",
        dbUuid: "b2222222-2222-2222-2222-222222222222",
        stockQty: 100,
        isActive: true,
      },
      {
        id: "van-honey-1kg",
        productId: "raw-wildflower-honey",
        productName: "Wild Forest Honey",
        sizeLabel: "1kg",
        price: 1099,
        originalPrice: 1299,
        sku: "VAN-HONEY-1000G",
        image: "/assets/product/500g%20Honey/product-2.jpg",
        dbUuid: "c3333333-3333-3333-3333-333333333333",
        stockQty: 100,
        isActive: true,
      },
      {
        id: "van-honey-5kg",
        productId: "raw-wildflower-honey",
        productName: "Wild Forest Honey",
        sizeLabel: "5kg",
        price: 2599,
        originalPrice: 2999,
        sku: "VAN-HONEY-5KG",
        image: "/assets/product/500g%20Honey/product-3.jpg",
        dbUuid: "c5555555-5555-5555-5555-555555555555",
        stockQty: 100,
        isActive: true,
      },
    ],
  },
  "jamun-pulp": {
    id: "jamun-pulp",
    slug: "jamun-pulp",
    name: "Pure Wild Jamun Pulp",
    badge: "Seasonal Superfood",
    badgeColor: "bg-purple-100 text-purple-900 border border-purple-200 font-bold",
    description:
      "100% natural, thick, seedless forest Jamun pulp harvested from seasonal wild trees of Chhattisgarh for sugar balance, digestion, and vitality.",
    image: "/assets/product/Jamun%20Pulp/jamun%20pulp/image-1.png",
    isPurchasable: true,
    freeShipping: true,
    variants: [
      {
        id: "van-jamun-pulp-1kg",
        productId: "jamun-pulp",
        productName: "Pure Wild Jamun Pulp",
        sizeLabel: "1 kg",
        price: 499,
        originalPrice: 649,
        sku: "VAN-JAMUN-1KG",
        image: "/assets/product/Jamun%20Pulp/jamun%20pulp/image-1.png",
        dbUuid: "e1111111-1111-1111-1111-111111111111",
        stockQty: 100,
        isActive: true,
      },
    ],
  },
  "gift-hampers": {
    id: "gift-hampers",
    slug: "gift-hampers",
    name: "Van Basket Gift Hamper",
    badge: "Festive Luxury",
    badgeColor: "bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold",
    description:
      "Artisanal luxury festive hamper containing raw forest honey, organic wooden dipper, and signature gold-accent gift packaging.",
    image: "/assets/instagram%20Post/post_1.jpg",
    isPurchasable: true,
    freeShipping: true,
    variants: [
      {
        id: "van-gift-hamper-luxury",
        productId: "gift-hampers",
        productName: "Van Basket Gift Hamper",
        sizeLabel: "Luxury Box",
        price: 799,
        originalPrice: 999,
        sku: "VAN-GIFT-HAMPER",
        image: "/assets/instagram%20Post/post_1.jpg",
        dbUuid: "f1111111-1111-1111-1111-111111111111",
        stockQty: 50,
        isActive: true,
      },
    ],
  },
  "bulk-honey": {
    id: "bulk-honey",
    slug: "bulk-honey",
    name: "Bulk Honey & Jamun Pulp",
    badge: "Commercial Division",
    badgeColor: "bg-brand-forest text-brand-cream-light font-bold",
    description:
      "Direct Forest allocations in commercial 25kg - 200kg drums for wholesale, retail, and pharmaceutical applications.",
    image: "/assets/product/bulk%20Honey/bulk-honey-order.jpg",
    isPurchasable: false,
    freeShipping: false,
    variants: [
      {
        id: "van-bulk-honey-b2b",
        productId: "bulk-honey",
        productName: "Bulk Honey & Jamun Pulp",
        sizeLabel: "Commercial 25kg - 200kg",
        price: 0,
        sku: "VAN-BULK-HONEY",
        image: "/assets/product/bulk%20Honey/bulk-honey-order.jpg",
        dbUuid: "bulk-orders-honey-b2b",
        stockQty: 1000,
        isActive: true,
      },
    ],
  },
};

/**
 * Flat list of all available variants across all products.
 */
export const ALL_VARIANTS: ProductVariantItem[] = Object.values(VANBASKET_CATALOG).flatMap(
  (p) => p.variants.map((v) => ({ ...v, productSlug: p.slug }))
);

/**
 * Universal resolver: takes any variant identifier (semantic ID, legacy UUID, SKU, or size)
 * and returns the canonical ProductVariantItem.
 */
export function resolveVariant(identifier: string | null | undefined): ProductVariantItem | null {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();

  // 1. Direct match by semantic ID
  const byId = ALL_VARIANTS.find((v) => v.id.toLowerCase() === clean);
  if (byId) return byId;

  // 2. Match by legacy database UUID
  const byUuid = ALL_VARIANTS.find((v) => v.dbUuid.toLowerCase() === clean);
  if (byUuid) return byUuid;

  // 3. Match by SKU
  const bySku = ALL_VARIANTS.find((v) => v.sku.toLowerCase() === clean);
  if (bySku) return bySku;

  // 4. Match by size label (e.g. '250g', '500g') defaulting to Honey
  const bySize = ALL_VARIANTS.find((v) => v.sizeLabel.toLowerCase().replace(/\s+/g, "") === clean.replace(/\s+/g, ""));
  if (bySize) return bySize;

  return null;
}
