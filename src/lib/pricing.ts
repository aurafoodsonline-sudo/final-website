// Shared by the cart, checkout page and the checkout API so every screen shows the same totals.
// The actual delivery fee and free-delivery limit are edited in Admin → Settings and stored in
// the `settings` table (keys below). These numbers are only used until those settings exist.
export const DEFAULT_DELIVERY_CHARGE = 150;
export const DEFAULT_FREE_DELIVERY_FROM = 1500;
export const DELIVERY_CHARGE_KEY = "delivery_charge";
export const FREE_DELIVERY_FROM_KEY = "free_delivery_from";
export const WHOLESALE_VARIANT = "1kg Wholesale";

// deliveryCharge = fee per order; freeDeliveryFrom = order subtotal at which delivery becomes
// free (0 means delivery is never free).
export type DeliveryRates = { deliveryCharge: number; freeDeliveryFrom: number };

export const DEFAULT_DELIVERY_RATES: DeliveryRates = {
  deliveryCharge: DEFAULT_DELIVERY_CHARGE,
  freeDeliveryFrom: DEFAULT_FREE_DELIVERY_FROM,
};

export function parseRate(value: unknown, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : fallback;
}

export function deliveryChargeFor(subtotal: number, rates: DeliveryRates = DEFAULT_DELIVERY_RATES) {
  if (subtotal <= 0 || rates.deliveryCharge <= 0) return 0;
  if (rates.freeDeliveryFrom > 0 && subtotal >= rates.freeDeliveryFrom) return 0;
  return rates.deliveryCharge;
}

// One-sentence description used on the FAQ and Shipping Policy pages.
export function deliveryRuleText(lang: "en" | "ur", rates: DeliveryRates) {
  const fee = rates.deliveryCharge.toLocaleString("en-US");
  const free = rates.freeDeliveryFrom.toLocaleString("en-US");
  if (rates.deliveryCharge <= 0) return lang === "ur" ? "تمام آرڈرز پر ڈیلیوری مفت ہے۔" : "Delivery is free on all orders.";
  if (rates.freeDeliveryFrom <= 0) return lang === "ur" ? `ہر آرڈر پر ڈیلیوری ${fee} روپے ہے۔` : `Delivery is Rs. ${fee} per order.`;
  return lang === "ur"
    ? `${free} روپے سے کم کے آرڈر پر ڈیلیوری ${fee} روپے ہے، اور ${free} روپے یا اس سے زیادہ پر مفت۔`
    : `Delivery is Rs. ${fee} on orders under Rs. ${free} and free on orders of Rs. ${free} or more.`;
}
