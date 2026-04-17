export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  wholesaleLabel: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductVariant = {
  id: string;
  productId: string;
  packSize: string;
  priceInr: number;
  compareAtPriceInr?: number | null;
  active: boolean;
};

export type ProductWithCategory = Product & {
  category?: Category;
  variants: ProductVariant[];
};

export type CartItem = {
  product: Product;
  variant: ProductVariant;
  quantity: number;
};

export type CartLine = {
  productId: string;
  variantId: string;
  productName: string;
  packSize: string;
  unitPriceInr: number;
  quantity: number;
  lineTotalInr: number;
};

export type CartTotals = {
  itemCount: number;
  subtotalInr: number;
  lines: CartLine[];
};

export type LeadCheckoutInput = {
  customerName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
};

export type LeadOrderSnapshotItem = {
  productId: string;
  variantId: string;
  productNameSnapshot: string;
  variantLabelSnapshot: string;
  unitPriceInrSnapshot: number;
  quantity: number;
  lineTotalInr: number;
};

export type LeadOrderSnapshot = {
  totalEstimateInr: number;
  items: LeadOrderSnapshotItem[];
};

export type LeadOrderStatus = "new" | "contacted" | "confirmed" | "cancelled";

export type LeadOrder = {
  id: string;
  orderCode: string;
  customerName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  notes?: string | null;
  status: LeadOrderStatus;
  totalEstimateInr: number;
  sourceMetadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  items: LeadOrderSnapshotItem[];
};
