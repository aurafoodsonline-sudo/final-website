"use client";
export type CartItem = { productId: number; slug: string; name: string; price: number; image: string; qty: number; variant?: string; type?: "product" | "bundle" };

const KEY = "aura_cart_v1";
const MAX_QTY = 99;

// One cart line = one product/bundle in one size.
export function cartKey(item: Pick<CartItem, "productId" | "variant" | "type">) {
  return `${item.type ?? "product"}-${item.productId}-${item.variant ?? ""}`;
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((i) => i && Number(i.qty) > 0) : [];
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage unavailable */ }
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const existing = cart.find((c) => cartKey(c) === cartKey(item));
  if (existing) existing.qty = Math.min(MAX_QTY, existing.qty + item.qty);
  else cart.push({ ...item, qty: Math.min(MAX_QTY, Math.max(1, item.qty)) });
  setCart(cart);
}

export function updateCartQty(key: string, qty: number) {
  const cart = getCart()
    .map((c) => (cartKey(c) === key ? { ...c, qty: Math.min(MAX_QTY, Math.max(0, Math.round(qty))) } : c))
    .filter((c) => c.qty > 0);
  setCart(cart);
}

export function removeFromCart(key: string) {
  setCart(getCart().filter((c) => cartKey(c) !== key));
}

export function clearCart() {
  setCart([]);
}
