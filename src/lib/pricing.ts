// Shared by the cart, checkout page and the checkout API so every screen shows the same totals.
export const FREE_DELIVERY_FROM = 1500;
export const DELIVERY_CHARGE = 150;
export const WHOLESALE_VARIANT = "1kg Wholesale";

export function deliveryChargeFor(subtotal: number) {
  return subtotal > 0 && subtotal < FREE_DELIVERY_FROM ? DELIVERY_CHARGE : 0;
}
