"use client";
import { useEffect, useState } from "react";
import { CartItem, getCart, removeFromCart, setCart } from "@/lib/cart";
import Image from "next/image";
import Link from "next/link";
import { Lang, t } from "@/lib/constants";

export default function CartView({ lang }: { lang: Lang }) {
  const d = t(lang);
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(getCart());
    const handler = () => setItems(getCart());
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

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
        {items.map((i) => (
          <div key={i.productId} className="flex items-center gap-4 bg-white/70 rounded-xl p-3 text-left">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
              <Image src={i.image} alt={i.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{i.name}</p>
              <p className="text-sm opacity-70">Rs. {i.price} × {i.qty}</p>
            </div>
            <button onClick={() => { removeFromCart(i.productId); setItems(getCart()); }} className="text-sm text-chili">
              {lang === "ur" ? "ہٹائیں" : "Remove"}
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-between font-semibold mb-6">
        <span>{d.subtotal}</span><span>Rs. {subtotal}</span>
      </div>
      <Link href={`/${lang}/checkout`} className="block text-center bg-chili text-white px-6 py-3 rounded-full font-medium">{d.checkout_title}</Link>
    </div>
  );
}
