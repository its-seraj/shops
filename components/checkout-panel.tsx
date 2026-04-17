"use client";

import { useState, useTransition } from "react";
import { useCart } from "@/components/cart-provider";
import { buildOrderSuccessMessage, formatInr, trackMetaEvent } from "@/lib/shop";

type SubmitState = {
  status: "idle" | "success" | "error";
  message: string;
  orderCode?: string;
};

export function CheckoutPanel() {
  const { items, subtotalInr, clearCart } = useCart();
  const [state, setState] = useState<SubmitState>({ status: "idle", message: "" });
  const [isPending, startTransition] = useTransition();

  function submitOrder(formData: FormData) {
    startTransition(async () => {
      setState({ status: "idle", message: "" });

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customer: Object.fromEntries(formData.entries()),
          items: items.map((item) => ({
            productId: item.product.id,
            variantId: item.variant.id,
            quantity: item.quantity
          }))
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setState({
          status: "error",
          message: result.error ?? "Could not submit order enquiry."
        });
        return;
      }

      trackMetaEvent({
        pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID,
        eventName: "Lead",
        payload: {
          currency: "INR",
          value: result.totalEstimateInr
        },
        fbq: window.fbq
      });

      clearCart();
      const successMessage = buildOrderSuccessMessage({
        orderCode: result.orderCode,
        setupMode: result.setupMode
      });
      setState({
        status: "success",
        message: successMessage.body,
        orderCode: successMessage.orderCode
      });
    });
  }

  if (state.status === "success") {
    const successMessage = buildOrderSuccessMessage({
      orderCode: state.orderCode
    });

    return (
      <div className="success-card" role="status" aria-live="polite">
        <div className="success-icon">✓</div>
        <span className="badge">Enquiry submitted</span>
        <h3>{successMessage.title}</h3>
        {state.orderCode ? <p className="success-code">Reference: {state.orderCode}</p> : null}
        <p>{state.message}</p>
        <div className="success-next">
          <strong>What happens next?</strong>
          <span>Our team will call or message you soon to confirm the order.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-card">
      <div className="cart-total" style={{ marginBottom: 18 }}>
        <div>
          <strong>Cart estimate</strong>
          <p className="muted">Payment is not collected online.</p>
        </div>
        <strong>{formatInr(subtotalInr)}</strong>
      </div>

      {items.length === 0 ? (
        <div className="notice">Add at least one product before sending an enquiry.</div>
      ) : null}

      <form action={submitOrder} className="checkout-form">
        <div className="field">
          <label htmlFor="customerName">Name / business</label>
          <input id="customerName" name="customerName" required minLength={2} />
        </div>
        <div className="field">
          <label htmlFor="phone">Mobile number</label>
          <input
            id="phone"
            name="phone"
            required
            inputMode="tel"
            pattern="(?:\\+91[-\\s]?)?[6-9][0-9]{9}"
            placeholder="9876543210"
          />
        </div>
        <div className="field full">
          <label htmlFor="addressLine1">Address line 1</label>
          <input id="addressLine1" name="addressLine1" required minLength={5} />
        </div>
        <div className="field full">
          <label htmlFor="addressLine2">Address line 2</label>
          <input id="addressLine2" name="addressLine2" />
        </div>
        <div className="field">
          <label htmlFor="city">City</label>
          <input id="city" name="city" required minLength={2} />
        </div>
        <div className="field">
          <label htmlFor="state">State</label>
          <input id="state" name="state" required minLength={2} />
        </div>
        <div className="field">
          <label htmlFor="pincode">Pincode</label>
          <input id="pincode" name="pincode" required inputMode="numeric" pattern="[1-9][0-9]{5}" />
        </div>
        <div className="field full">
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" name="notes" placeholder="Preferred call time, delivery notes, GST details..." />
        </div>
        <div className="field full">
          <button className="primary-button" type="submit" disabled={isPending || items.length === 0}>
            {isPending ? "Sending enquiry..." : "Submit order enquiry"}
          </button>
        </div>
      </form>

      {state.message ? (
        <p className={state.status === "error" ? "error" : "notice"}>
          {state.orderCode ? `${state.orderCode}: ` : ""}
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
