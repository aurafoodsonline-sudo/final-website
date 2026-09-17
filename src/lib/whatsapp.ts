import { getSetting } from "./data";

// Real Meta WhatsApp Business Cloud API call, wired but inert until env credentials exist
// (WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID). Falls back to a clearly-logged stub so the
// order-confirmation workflow (Section 11) can be exercised end-to-end before those exist.
export async function sendWhatsAppOrderConfirmation(order: {
  orderNumber: string; customerName: string; customerPhone: string; itemsText: string;
  subtotal: number; deliveryCharges: number; total: number; paymentMethod: string;
  customerAddress: string; createdAt: string;
}) {
  const enabled = (await getSetting("whatsapp_automation_enabled", "true")) === "true";
  if (!enabled) return { status: "not_sent" as const };

  const template = await getSetting("whatsapp_template", "");
  const message = template
    .replace("{{customer_name}}", order.customerName)
    .replace("{{order_number}}", order.orderNumber)
    .replace("{{items}}", order.itemsText)
    .replace("{{subtotal}}", String(order.subtotal))
    .replace("{{delivery_charges}}", String(order.deliveryCharges))
    .replace("{{total}}", String(order.total))
    .replace("{{payment_method}}", order.paymentMethod)
    .replace("{{address}}", order.customerAddress)
    .replace("{{order_date}}", order.createdAt);

  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    console.log("[WhatsApp STUB — no live credentials] would send to", order.customerPhone, ":\n", message);
    return { status: "sent" as const, stub: true };
  }

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: order.customerPhone,
      type: "text",
      text: { body: message },
    }),
  }).catch(() => null);

  return { status: res && res.ok ? ("sent" as const) : ("no_response" as const) };
}
