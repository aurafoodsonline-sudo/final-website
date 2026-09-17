"use client";
export type CartItem = { productId: number; slug: string; name: string; price: number; image: string; qty: number };

const KEY = "aura_cart_v1";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

export function setCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const existing = cart.find((c) => c.productId === item.productId);
  if (existing) existing.qty += item.qty;
  else cart.push(item);
  setCart(cart);
}

export function removeFromCart(productId: number) {
  setCart(getCart().filter((c) => c.productId !== productId));
}

export function clearCart() {
  setCart([]);
}
