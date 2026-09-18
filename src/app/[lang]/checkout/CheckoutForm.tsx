"use client";
import { useEffect, useState } from "react";
import { CartItem, getCart, clearCart } from "@/lib/cart";
import { useRouter } from "next/navigation";
import { Lang, t } from "@/lib/constants";

export default function CheckoutForm({ lang }: { lang: Lang }) {
  const d = t(lang);
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setItems(getCart()), []);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryCharges = subtotal > 0 && subtotal < 1500 ? 150 : subtotal > 0 ? 0 : 0;
  const total = subtotal + deliveryCharges;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) { setError(lang === "ur" ? "کارٹ خالی ہے۔" : "Your cart is empty."); return; }
    setSubmitting(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      customerName: fd.get("customerName"),
      customerPhone: fd.get("customerPhone"),
      customerAddress: fd.get("customerAddress"),
      city: fd.get("city"),
      paymentMethod: fd.get("paymentMethod"),
      items,
    };
    const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const json = await res.json();
    setSubmitting(false);
    if (json.orderNumber) {
      clearCart();
      router.push(`/${lang}/order-confirmed?ref=${encodeURIComponent(json.orderNumber)}&phone=${encodeURIComponent(json.customerPhone ?? "")}&wa=${encodeURIComponent(json.whatsappStatus ?? "not_sent")}`);
    } else {
      setError(json.error ?? "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 bg-white/70 rounded-2xl p-6">
      {items.length > 0 && (
        <div className="mb-2 text-sm space-y-1 border-b border-cinnamon/10 pb-3">
          {items.map((i) => <div key={i.productId} className="flex justify-between"><span>{i.name} × {i.qty}</span><span>Rs. {i.price * i.qty}</span></div>)}
          <div className="flex justify-between font-medium pt-1"><span>{d.subtotal}</span><span>Rs. {subtotal}</span></div>
          <div className="flex justify-between opacity-70"><span>{d.delivery_charges}</span><span>Rs. {deliveryCharges}</span></div>
          <div className="flex justify-between font-semibold text-chili"><span>{d.total}</span><span>Rs. {total}</span></div>
        </div>
      )}
      <input name="customerName" placeholder={d.full_name} required className="border rounded-lg px-3 py-2" />
      <input name="customerPhone" placeholder={d.phone} required className="border rounded-lg px-3 py-2" />
      <input name="customerAddress" placeholder={d.address} required className="border rounded-lg px-3 py-2" />
      <input name="city" placeholder={lang === "ur" ? "شہر" : "City"} required className="border rounded-lg px-3 py-2" />
      <fieldset className="border rounded-lg px-3 py-3">
        <legend className="text-sm font-medium px-1">{d.payment_method}</legend>
        <label className="flex items-center gap-2 text-sm py-1"><input type="radio" name="paymentMethod" value="cod" defaultChecked /> {d.cod}</label>
        <label className="flex items-center gap-2 text-sm py-1"><input type="radio" name="paymentMethod" value="card" /> {d.card}</label>
        <label className="flex items-center gap-2 text-sm py-1"><input type="radio" name="paymentMethod" value="jazzcash" /> JazzCash</label>
        <label className="flex items-center gap-2 text-sm py-1"><input type="radio" name="paymentMethod" value="easypaisa" /> Easypaisa</label>
        <p className="text-xs opacity-60 mt-1">{lang === "ur" ? "کارڈ/جیز کیش/ایزی پیسہ ڈیمو سٹب موڈ میں ہیں جب تک حقیقی مرچنٹ اکاؤنٹس نہ ہوں۔" : "Card/JazzCash/Easypaisa run in labelled demo-stub mode until live merchant credentials exist."}</p>
      </fieldset>
      {error && <p className="text-sm text-chili">{error}</p>}
      <button disabled={submitting} className="bg-chili text-white px-6 py-3 rounded-full font-medium disabled:opacity-50">
        {submitting ? "..." : d.place_order}
      </button>
    </form>
  );
}
