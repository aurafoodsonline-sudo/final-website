import { getSetting } from "./data";

export function normalizeWhatsAppPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  return digits;
}

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
  const message = (template || `Aura Foods - Order Confirmed\n\nAssalam-o-Alaikum {{customer_name}}!\n\nOrder ID: #{{order_number}}\nWebsite: https://aurafoods.online\n\nItems:\n{{items}}\nTotal: Rs. {{total}}\nPayment: {{payment_method}}\n\nTrack order: https://aurafoods.online/en/track-order`).
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
    return { status: "not_sent" as const, stub: true };
  }

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: normalizeWhatsAppPhone(order.customerPhone),
      type: "text",
      text: { body: message },
    }),
  }).catch(() => null);

  return { status: res && res.ok ? ("sent" as const) : ("no_response" as const) };
}

export async function sendWhatsAppAdminAlert(order: {
  orderNumber: string; customerName: string; customerPhone: string; total: number; itemsText: string;
}) {
  const adminPhone = process.env.WHATSAPP_ADMIN_PHONE;
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!adminPhone || !token || !phoneId) return { status: "not_sent" as const };

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: normalizeWhatsAppPhone(adminPhone),
      type: "text",
      text: { body: `New Order #${order.orderNumber}\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\nAmount: Rs. ${order.total}\n\n${order.itemsText}` },
    }),
  }).catch(() => null);
  return { status: res && res.ok ? ("sent" as const) : ("no_response" as const) };
}
