import { z } from "zod";
import type {
  CartItem,
  CartTotals,
  LeadOrderSnapshot,
  ProductVariant
} from "@/lib/types";

export const leadCheckoutSchema = z.object({
  customerName: z.string().trim().min(2, "Enter the customer or business name."),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+91[-\s]?)?[6-9]\d{9}$/, "Enter a valid Indian mobile number."),
  addressLine1: z.string().trim().min(5, "Enter the full street address."),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(2, "Enter the city."),
  state: z.string().trim().min(2, "Enter the state."),
  pincode: z.string().trim().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode."),
  notes: z.string().trim().optional()
});

export const productVariantSchema = z.object({
  packSize: z.string().trim().min(1, "Pack size is required."),
  priceInr: z.coerce.number().int().positive("Price must be more than zero."),
  compareAtPriceInr: z.coerce.number().int().positive().optional().nullable(),
  active: z.coerce.boolean()
});

export function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

export function calculateCartTotals(items: CartItem[]): CartTotals {
  const lines = items.map((item) => {
    const quantity = Math.max(0, Math.trunc(item.quantity));
    const unitPriceInr = item.variant.priceInr;

    return {
      productId: item.product.id,
      variantId: item.variant.id,
      productName: item.product.name,
      packSize: item.variant.packSize,
      unitPriceInr,
      quantity,
      lineTotalInr: unitPriceInr * quantity
    };
  });

  return {
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotalInr: lines.reduce((sum, line) => sum + line.lineTotalInr, 0),
    lines
  };
}

export function validateLeadCheckout(input: unknown) {
  return leadCheckoutSchema.safeParse(input);
}

export function validateProductVariantInput(input: unknown) {
  return productVariantSchema.safeParse(input);
}

export function buildLeadOrderSnapshot(items: CartItem[]): LeadOrderSnapshot {
  const totals = calculateCartTotals(items);

  return {
    totalEstimateInr: totals.subtotalInr,
    items: totals.lines.map((line) => ({
      productId: line.productId,
      variantId: line.variantId,
      productNameSnapshot: line.productName,
      variantLabelSnapshot: line.packSize,
      unitPriceInrSnapshot: line.unitPriceInr,
      quantity: line.quantity,
      lineTotalInr: line.lineTotalInr
    }))
  };
}

export function isMetaPixelConfigured(pixelId?: string | null) {
  return Boolean(pixelId?.trim());
}

export function trackMetaEvent({
  pixelId,
  eventName,
  payload,
  fbq
}: {
  pixelId?: string | null;
  eventName: "PageView" | "ViewContent" | "AddToCart" | "Lead";
  payload?: Record<string, unknown>;
  fbq?: (...args: unknown[]) => void;
}) {
  if (!isMetaPixelConfigured(pixelId) || !fbq) {
    return;
  }

  fbq("track", eventName, payload ?? {});
}

export function getDefaultVariant(variants: ProductVariant[]) {
  return variants.find((variant) => variant.active) ?? variants[0] ?? null;
}

export function buildOrderSuccessMessage({
  orderCode,
  setupMode
}: {
  orderCode?: string;
  setupMode?: boolean;
}) {
  return {
    title: setupMode ? "Demo enquiry created" : "Order enquiry received",
    body: setupMode
      ? "This demo enquiry was created successfully. Connect Supabase to save real customer leads."
      : "Thank you for sharing your order details. Our team will get in touch soon to confirm availability, delivery, and the final order total.",
    orderCode
  };
}
