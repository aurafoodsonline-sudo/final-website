"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CartItem, cartKey, getCart, clearCart } from "@/lib/cart";
import { deliveryChargeFor } from "@/lib/pricing";
import { useRouter } from "next/navigation";
import { Lang, t } from "@/lib/constants";

export default function CheckoutForm({ lang }: { lang: Lang }) {
  const d = t(lang);
  const ur = lang === "ur";
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(getCart());
    setLoaded(true);
  }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryCharges = deliveryChargeFor(subtotal);
  const total = subtotal + deliveryCharges;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    if (items.length === 0) { setError(ur ? "کارٹ خالی ہے۔" : "Your cart is empty."); return; }
    setSubmitting(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      customerName: fd.get("customerName"),
      customerPhone: fd.get("customerPhone"),
      customerEmail: fd.get("customerEmail"),
      customerAddress: fd.get("customerAddress"),
      city: fd.get("city"),
      paymentMethod: fd.get("paymentMethod"),
      items: items.map((i) => ({ productId: i.productId, qty: i.qty, variant: i.variant, type: i.type ?? "product" })),
    };
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.orderNumber) {
        clearCart();
        router.push(`/${lang}/order-confirmed?ref=${encodeURIComponent(json.orderNumber)}&phone=${encodeURIComponent(json.customerPhone ?? "")}&wa=${encodeURIComponent(json.whatsappStatus ?? "not_sent")}&total=${encodeURIComponent(json.total ?? "")}`);
        return;
      }
      setError(json.error ?? (ur ? "کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔" : "Something went wrong. Please try again."));
    } catch {
      setError(ur ? "انٹرنیٹ کنکشن چیک کر کے دوبارہ کوشش کریں۔" : "Could not reach the server. Please check your connection and try again.");
    }
    setSubmitting(false);
  }

  if (!loaded) return null;

  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="opacity-70 mb-6">{ur ? "آپ کا کارٹ خالی ہے۔" : "Your cart is empty."}</p>
        <Link href={`/${lang}/shop`} className="bg-chili text-white px-6 py-3 rounded-full font-medium">{d.browse_spices}</Link>
      </div>
    );
  }

  const field = "border rounded-lg px-3 py-2 w-full";
  return (
    <form onSubmit={handleSubmit} className="grid gap-3 bg-white/70 rounded-2xl p-6">
      <div className="mb-2 text-sm space-y-1 border-b border-cinnamon/10 pb-3">
        {items.map((i) => <div key={cartKey(i)} className="flex justify-between gap-3"><span>{i.name} × {i.qty}</span><span className="shrink-0">Rs. {i.price * i.qty}</span></div>)}
        <div className="flex justify-between font-medium pt-1"><span>{d.subtotal}</span><span>Rs. {subtotal}</span></div>
        <div className="flex justify-between opacity-70"><span>{d.delivery_charges}</span><span>{deliveryCharges === 0 ? (ur ? "مفت" : "Free") : `Rs. ${deliveryCharges}`}</span></div>
        <div className="flex justify-between font-semibold text-chili"><span>{d.total}</span><span>Rs. {total}</span></div>
        <Link href={`/${lang}/cart`} className="text-xs underline opacity-70">{ur ? "کارٹ میں تبدیلی کریں" : "Edit cart"}</Link>
      </div>
      <label className="text-sm">{d.full_name} *<input name="customerName" autoComplete="name" required className={field} /></label>
      <label className="text-sm">{d.phone} *<input name="customerPhone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0300 1234567" required className={field} /></label>
      <label className="text-sm">{d.email} <span className="opacity-60">({ur ? "اختیاری — ریویو دینے کے لیے" : "optional — needed to write a review later"})</span>
        <input name="customerEmail" type="email" autoComplete="email" className={field} />
      </label>
      <label className="text-sm">{d.address} *<input name="customerAddress" autoComplete="street-address" required className={field} /></label>
      <label className="text-sm">{ur ? "شہر" : "City"} *<input name="city" autoComplete="address-level2" required className={field} /></label>
      <fieldset className="border rounded-lg px-3 py-3">
        <legend className="text-sm font-medium px-1">{d.payment_method}</legend>
        <label className="flex items-center gap-2 text-sm py-1"><input type="radio" name="paymentMethod" value="cod" defaultChecked /> {d.cod}</label>
      </fieldset>
      {error && <p className="text-sm text-chili bg-chili/10 rounded-lg px-3 py-2" role="alert">{error}</p>}
      <button disabled={submitting} className="bg-chili text-white px-6 py-3 rounded-full font-medium disabled:opacity-50">
        {submitting ? (ur ? "آرڈر بھیجا جا رہا ہے..." : "Placing order...") : `${d.place_order} — Rs. ${total}`}
      </button>
    </form>
  );
}
