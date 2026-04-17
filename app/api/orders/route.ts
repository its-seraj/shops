import { NextResponse } from "next/server";
import { buildLeadOrderSnapshot, validateLeadCheckout } from "@/lib/shop";
import { resolveCartItems } from "@/lib/data";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const orderPayloadSchema = validateLeadCheckout;

function createOrderCode() {
  const date = new Date();
  const compactDate = date.toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ORD-${compactDate}-${suffix}`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || !Array.isArray(body.items)) {
    return NextResponse.json({ error: "Cart items are required." }, { status: 400 });
  }

  const customerResult = orderPayloadSchema(body.customer);

  if (!customerResult.success) {
    return NextResponse.json(
      {
        error: "Please check the order form.",
        fieldErrors: customerResult.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  const cartItems = await resolveCartItems(body.items);

  if (cartItems.length === 0) {
    return NextResponse.json(
      { error: "Please add at least one available item to the cart." },
      { status: 400 }
    );
  }

  const snapshot = buildLeadOrderSnapshot(cartItems);
  const orderCode = createOrderCode();
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({
      orderCode,
      totalEstimateInr: snapshot.totalEstimateInr,
      setupMode: true
    });
  }

  const customer = customerResult.data;

  const { data: order, error: orderError } = await supabase
    .from("lead_orders")
    .insert({
      order_code: orderCode,
      customer_name: customer.customerName,
      phone: customer.phone,
      address_line_1: customer.addressLine1,
      address_line_2: customer.addressLine2 || null,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,
      notes: customer.notes || null,
      total_estimate_inr: snapshot.totalEstimateInr,
      source_metadata: {
        userAgent: request.headers.get("user-agent"),
        referrer: request.headers.get("referer")
      }
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: orderError?.message ?? "Could not create order." },
      { status: 500 }
    );
  }

  const { error: itemsError } = await supabase.from("lead_order_items").insert(
    snapshot.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId,
      product_name_snapshot: item.productNameSnapshot,
      variant_label_snapshot: item.variantLabelSnapshot,
      unit_price_inr_snapshot: item.unitPriceInrSnapshot,
      quantity: item.quantity,
      line_total_inr: item.lineTotalInr
    }))
  );

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json({
    orderCode,
    totalEstimateInr: snapshot.totalEstimateInr
  });
}
