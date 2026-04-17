import { AdminNav } from "@/components/admin-nav";
import { updateOrderStatus } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-auth";
import { getOrders } from "@/lib/data";
import { formatInr } from "@/lib/shop";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";
import type { CartTotals, LeadOrderStatus } from "@/lib/types";

const statuses: LeadOrderStatus[] = ["new", "contacted", "confirmed", "cancelled"];

export default async function AdminOrders() {
  const { setupMode } = await requireAdmin();
  const orders = await getOrders();
  const businessPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

  return (
    <main className="admin-layout">
      <AdminNav />
      <section className="container section">
        <div className="admin-heading admin-hero-panel">
          <div>
            <span className="badge">Lead orders</span>
            <h1>Customer enquiries</h1>
            <p className="muted">
              Prioritize new requests, confirm details, and open a ready WhatsApp message from each lead.
            </p>
          </div>
        </div>
        {setupMode ? (
          <div className="notice">
            Supabase is not configured, so real order leads will not appear here yet.
          </div>
        ) : null}
        <div className="stack">
          {orders.length === 0 ? (
            <div className="admin-card">
              <h2>No leads yet</h2>
              <p className="muted">New cart enquiries will appear here after Supabase is connected.</p>
            </div>
          ) : (
            orders.map((order) => {
              const totals: CartTotals = {
                itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
                subtotalInr: order.totalEstimateInr,
                lines: order.items.map((item) => ({
                  productId: item.productId,
                  variantId: item.variantId,
                  productName: item.productNameSnapshot,
                  packSize: item.variantLabelSnapshot,
                  unitPriceInr: item.unitPriceInrSnapshot,
                  quantity: item.quantity,
                  lineTotalInr: item.lineTotalInr
                }))
              };
              const whatsappUrl = businessPhone
                ? buildWhatsAppOrderUrl({
                    businessPhone,
                    orderCode: order.orderCode,
                    customer: {
                      customerName: order.customerName,
                      phone: order.phone,
                      addressLine1: order.addressLine1,
                      addressLine2: order.addressLine2 ?? "",
                      city: order.city,
                      state: order.state,
                      pincode: order.pincode,
                      notes: order.notes ?? ""
                    },
                    totals
                  })
                : "";

              return (
                <article className="admin-card order-admin-card stack" key={order.id}>
                  <div className="cart-total">
                    <div>
                      <span className="status-pill">{order.status}</span>
                      <h2>{order.orderCode}</h2>
                      <p className="muted">
                        {order.customerName} | {order.phone}
                      </p>
                    </div>
                    <strong>{formatInr(order.totalEstimateInr)}</strong>
                  </div>
                  <p>
                    {order.addressLine1}
                    {order.addressLine2 ? `, ${order.addressLine2}` : ""}, {order.city},{" "}
                    {order.state} - {order.pincode}
                  </p>
                  {order.notes ? <p className="notice">{order.notes}</p> : null}
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Qty</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={`${item.productId}-${item.variantId}`}>
                            <td>
                              {item.productNameSnapshot}
                              <br />
                              <span className="muted">{item.variantLabelSnapshot}</span>
                            </td>
                            <td>{item.quantity}</td>
                            <td>{formatInr(item.lineTotalInr)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="cart-total">
                    <form action={updateOrderStatus} className="product-actions">
                      <input name="orderId" type="hidden" value={order.id} />
                      <select name="status" defaultValue={order.status} disabled={setupMode}>
                        {statuses.map((status) => (
                          <option value={status} key={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <button className="secondary-button" type="submit" disabled={setupMode}>
                        Update status
                      </button>
                    </form>
                    {whatsappUrl ? (
                      <a className="primary-button" href={whatsappUrl} target="_blank" rel="noreferrer">
                        Open WhatsApp
                      </a>
                    ) : (
                      <span className="muted">Set NEXT_PUBLIC_WHATSAPP_NUMBER for WhatsApp.</span>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
