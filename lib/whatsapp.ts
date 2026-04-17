import type { CartTotals, LeadCheckoutInput } from "@/lib/types";
import { formatInr } from "@/lib/shop";

export function buildAddress(customer: LeadCheckoutInput) {
  return [
    customer.addressLine1,
    customer.addressLine2,
    customer.city,
    `${customer.state} - ${customer.pincode}`
  ]
    .filter(Boolean)
    .join(", ");
}

export function buildWhatsAppOrderMessage({
  orderCode,
  customer,
  totals
}: {
  orderCode: string;
  customer: LeadCheckoutInput;
  totals: CartTotals;
}) {
  const itemLines = totals.lines
    .map(
      (line) =>
        `${line.productName} - ${line.packSize} x ${line.quantity} = ${formatInr(
          line.lineTotalInr
        )}`
    )
    .join("\n");

  return [
    `New order enquiry: ${orderCode}`,
    `Customer: ${customer.customerName}`,
    `Phone: ${customer.phone}`,
    `Address: ${buildAddress(customer)}`,
    "",
    "Items:",
    itemLines,
    "",
    `Estimated total: ${formatInr(totals.subtotalInr)}`,
    customer.notes ? `Notes: ${customer.notes}` : ""
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export function buildWhatsAppOrderUrl({
  businessPhone,
  orderCode,
  customer,
  totals
}: {
  businessPhone: string;
  orderCode: string;
  customer: LeadCheckoutInput;
  totals: CartTotals;
}) {
  const phone = businessPhone.replace(/[^\d]/g, "");
  const text = encodeURIComponent(
    buildWhatsAppOrderMessage({
      orderCode,
      customer,
      totals
    })
  );

  return `https://wa.me/${phone}?text=${text}`;
}
