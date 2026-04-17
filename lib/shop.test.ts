import { describe, expect, test, vi } from "vitest";
import {
  buildLeadOrderSnapshot,
  buildOrderSuccessMessage,
  calculateCartTotals,
  isMetaPixelConfigured,
  trackMetaEvent,
  validateLeadCheckout,
  validateProductVariantInput
} from "@/lib/shop";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";
import type { CartItem, Product, ProductVariant } from "@/lib/types";

function createCart(): {
  product: Product;
  variants: ProductVariant[];
  cart: CartItem[];
} {
  const product: Product = {
    id: "turmeric",
    categoryId: "spices",
    name: "Salem Turmeric Powder",
    slug: "salem-turmeric-powder",
    description: "High-curcumin turmeric powder for wholesale buyers.",
    images: ["/turmeric.jpg"],
    wholesaleLabel: "Wholesale pack",
    active: true,
    createdAt: "2026-04-16T00:00:00.000Z",
    updatedAt: "2026-04-16T00:00:00.000Z"
  };

  const variants: ProductVariant[] = [
    {
      id: "turmeric-250",
      productId: "turmeric",
      packSize: "250g",
      priceInr: 95,
      compareAtPriceInr: 120,
      active: true
    },
    {
      id: "turmeric-1kg",
      productId: "turmeric",
      packSize: "1kg",
      priceInr: 330,
      compareAtPriceInr: 390,
      active: true
    }
  ];

  return {
    product,
    variants,
    cart: [
      {
        product,
        variant: variants[0],
        quantity: 2
      },
      {
        product,
        variant: variants[1],
        quantity: 1
      }
    ]
  };
}

describe("shop domain behavior", () => {
  test("calculates INR cart totals from pack-size variants and quantities", () => {
    const { cart } = createCart();

    expect(calculateCartTotals(cart)).toEqual({
      itemCount: 3,
      subtotalInr: 520,
      lines: [
        {
          productId: "turmeric",
          variantId: "turmeric-250",
          productName: "Salem Turmeric Powder",
          packSize: "250g",
          unitPriceInr: 95,
          quantity: 2,
          lineTotalInr: 190
        },
        {
          productId: "turmeric",
          variantId: "turmeric-1kg",
          productName: "Salem Turmeric Powder",
          packSize: "1kg",
          unitPriceInr: 330,
          quantity: 1,
          lineTotalInr: 330
        }
      ]
    });
  });

  test("validates Indian lead checkout fields before submitting an order", () => {
    const result = validateLeadCheckout({
      customerName: "Aarav Traders",
      phone: "9876543210",
      addressLine1: "12 Market Road",
      addressLine2: "Near mandi",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302001",
      notes: "Call before dispatch"
    });

    expect(result.success).toBe(true);
  });

  test("rejects invalid phone numbers and pincodes", () => {
    const result = validateLeadCheckout({
      customerName: "A",
      phone: "1234",
      addressLine1: "",
      city: "",
      state: "",
      pincode: "999",
      notes: ""
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected checkout validation to fail.");
    }
    expect(result.error.flatten().fieldErrors).toMatchObject({
      customerName: expect.any(Array),
      phone: expect.any(Array),
      addressLine1: expect.any(Array),
      city: expect.any(Array),
      state: expect.any(Array),
      pincode: expect.any(Array)
    });
  });

  test("creates lead order item snapshots that survive later product edits", () => {
    const { product, variants, cart } = createCart();
    const snapshot = buildLeadOrderSnapshot(cart);

    product.name = "Edited Product Name";
    variants[0].priceInr = 1;

    expect(snapshot.items[0]).toEqual({
      productId: "turmeric",
      variantId: "turmeric-250",
      productNameSnapshot: "Salem Turmeric Powder",
      variantLabelSnapshot: "250g",
      unitPriceInrSnapshot: 95,
      quantity: 2,
      lineTotalInr: 190
    });
    expect(snapshot.totalEstimateInr).toBe(520);
  });

  test("builds a WhatsApp-ready order message with customer, address, items, and total", () => {
    const { cart } = createCart();
    const url = buildWhatsAppOrderUrl({
      businessPhone: "919876543210",
      orderCode: "ORD-1001",
      customer: {
        customerName: "Aarav Traders",
        phone: "9876543210",
        addressLine1: "12 Market Road",
        addressLine2: "Near mandi",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302001",
        notes: "Call before dispatch"
      },
      totals: calculateCartTotals(cart)
    });

    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("wa.me/919876543210");
    expect(decoded).toContain("ORD-1001");
    expect(decoded).toContain("Aarav Traders");
    expect(decoded).toContain("12 Market Road, Near mandi, Jaipur, Rajasthan - 302001");
    expect(decoded).toContain("Salem Turmeric Powder - 250g x 2 = ₹190");
    expect(decoded).toContain("Estimated total: ₹520");
  });

  test("validates admin variant input for pack sizes and rupee prices", () => {
    const result = validateProductVariantInput({
      packSize: "1kg",
      priceInr: 330,
      compareAtPriceInr: 390,
      active: true
    });

    expect(result.success).toBe(true);
  });

  test("meta tracking safely no-ops when no pixel id is configured", () => {
    const fbq = vi.fn();

    expect(isMetaPixelConfigured("")).toBe(false);
    expect(() =>
      trackMetaEvent({
        pixelId: "",
        eventName: "Lead",
        payload: { value: 520 },
        fbq
      })
    ).not.toThrow();
    expect(fbq).not.toHaveBeenCalled();
  });

  test("builds a customer-friendly order success card message", () => {
    expect(
      buildOrderSuccessMessage({
        orderCode: "ORD-1001",
        setupMode: false
      })
    ).toEqual({
      title: "Order enquiry received",
      body: "Thank you for sharing your order details. Our team will get in touch soon to confirm availability, delivery, and the final order total.",
      orderCode: "ORD-1001"
    });
  });
});
