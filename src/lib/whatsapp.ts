import { getSetting } from "./data";

export function normalizeWhatsAppPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  return digits;
}

async function sendCloudMessage(to: string, payload: Record<string, unknown>) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return { status: "not_sent" as const, reason: "missing_credentials" };

  try {
    const response = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to: normalizeWhatsAppPhone(to), ...payload }),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      console.error("[WhatsApp Cloud API error]", response.status, JSON.stringify(body));
      const apiError = body?.error;
      const reason = [
        apiError?.message,
        apiError?.error_user_msg,
        apiError?.code ? `code ${apiError.code}` : null,
        apiError?.error_subcode ? `subcode ${apiError.error_subcode}` : null,
        apiError?.error_data?.details,
      ].filter(Boolean).join(" | ") || (body ? JSON.stringify(body) : `HTTP ${response.status}`);
      return { status: "no_response" as const, reason };
    }
    return { status: "sent" as const };
  } catch (error) {
    console.error("[WhatsApp request error]", error);
    return { status: "no_response" as const, reason: "network_error" };
  }
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

  const message = `Aura Foods - Order Confirmed\n\nAssalam-o-Alaikum ${order.customerName}!\n\nOrder ID: #${order.orderNumber}\n\nThank you for your order.`;

  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
  if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    console.log("[WhatsApp STUB — no live credentials] would send to", order.customerPhone, ":\n", message);
    return { status: "not_sent" as const, stub: true };
  }
  if (!templateName) {
    console.error("[WhatsApp config error] WHATSAPP_TEMPLATE_NAME is required for automatic order messages. Create and approve a Meta template first.");
    return { status: "not_sent" as const, reason: "missing_approved_template" };
  }

  const payload = {
    type: "template",
    template: {
      name: templateName,
      language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE ?? "en_US" },
      components: [{ type: "body", parameters: [
        { type: "text", text: order.customerName },
        { type: "text", text: order.orderNumber },
      ] }],
    },
  };
  return sendCloudMessage(order.customerPhone, payload);
}

export async function sendWhatsAppAdminAlert(order: {
  orderNumber: string; customerName: string; customerPhone: string; total: number; itemsText: string;
}) {
  const adminPhone = process.env.WHATSAPP_ADMIN_PHONE;
  if (!adminPhone) return { status: "not_sent" as const };
  return sendCloudMessage(adminPhone, {
    type: "text",
    text: { body: `New Order #${order.orderNumber}\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\nAmount: Rs. ${order.total}\n\n${order.itemsText}` },
  });
}
