"use client";
import { useEffect, useState } from "react";
import { CartItem, cartKey, getCart, removeFromCart, updateCartQty } from "@/lib/cart";
import { deliveryChargeFor } from "@/lib/pricing";
import Image from "next/image";
import Link from "next/link";
import { Lang, t } from "@/lib/constants";

export default function CartView({ lang }: { lang: Lang }) {
  const d = t(lang);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(getCart());
    setLoaded(true);
    const handler = () => setItems(getCart());
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = deliveryChargeFor(subtotal);

  if (!loaded) return null;

  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="opacity-70 mb-6">{lang === "ur" ? "آپ کا کارٹ خالی ہے۔" : "Your cart is empty."}</p>
        <Link href={`/${lang}/shop`} className="bg-chili text-white px-6 py-3 rounded-full font-medium">{d.browse_spices}</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4 mb-8">
        {items.map((i) => {
          const key = cartKey(i);
          return (
            <div key={key} className="flex items-center gap-4 bg-white/70 rounded-xl p-3 text-start">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-cream">
                <Image src={i.image || "/images/logo.jpg"} unoptimized={(i.image ?? "").startsWith("/uploads/")} alt={i.name} fill sizes="64px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium break-words">{i.name}</p>
                <p className="text-sm opacity-70">Rs. {i.price}</p>
                <div className="mt-2 inline-flex items-center border border-cinnamon/20 rounded-full overflow-hidden text-sm" aria-label="Quantity">
                  <button type="button" onClick={() => updateCartQty(key, i.qty - 1)} className="px-3 py-1" aria-label="Decrease quantity">−</button>
                  <span className="min-w-8 text-center">{i.qty}</span>
                  <button type="button" onClick={() => updateCartQty(key, i.qty + 1)} className="px-3 py-1" aria-label="Increase quantity">+</button>
                </div>
              </div>
              <div className="text-end shrink-0">
                <p className="font-medium">Rs. {i.price * i.qty}</p>
                <button type="button" onClick={() => removeFromCart(key)} className="text-sm text-chili mt-2">
                  {lang === "ur" ? "ہٹائیں" : "Remove"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="space-y-1 mb-6 text-sm">
        <div className="flex justify-between"><span>{d.subtotal}</span><span>Rs. {subtotal}</span></div>
        <div className="flex justify-between opacity-70"><span>{d.delivery_charges}</span><span>{delivery === 0 ? (lang === "ur" ? "مفت" : "Free") : `Rs. ${delivery}`}</span></div>
        <div className="flex justify-between font-semibold text-base text-chili pt-1"><span>{d.total}</span><span>Rs. {subtotal + delivery}</span></div>
      </div>
      <Link href={`/${lang}/checkout`} className="block text-center bg-chili text-white px-6 py-3 rounded-full font-medium">{d.checkout_title}</Link>
      <Link href={`/${lang}/shop`} className="block text-center mt-3 text-sm underline opacity-80">{lang === "ur" ? "خریداری جاری رکھیں" : "Continue shopping"}</Link>
    </div>
  );
}
