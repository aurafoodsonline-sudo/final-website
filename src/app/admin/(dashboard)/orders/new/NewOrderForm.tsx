"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Product = { id: number; nameEn: string; price: number };
type Line = { productId: number | null; name: string; price: number; qty: number };

export default function NewOrderForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([{ productId: products[0]?.id ?? null, name: products[0]?.nameEn ?? "", price: products[0]?.price ?? 0, qty: 1 }]);
  const [source, setSource] = useState("facebook");
  const [discount, setDiscount] = useState(0);
  const [deliveryCharges, setDeliveryCharges] = useState(150);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [submitting, setSubmitting] = useState(false);

  function updateLine(idx: number, productId: number) {
    const p = products.find((pp) => pp.id === productId)!;
    setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, productId, name: p.nameEn, price: p.price } : l)));
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const total = subtotal - discount + deliveryCharges;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      source, discount, deliveryCharges, paymentStatus,
      customerName: fd.get("customerName"), customerPhone: fd.get("customerPhone"),
      customerAddress: fd.get("customerAddress"), notes: fd.get("notes"),
      items: lines.map((l) => ({ productId: l.productId, name: l.name, price: l.price, qty: l.qty })),
    };
    const res = await fetch("/api/admin/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const json = await res.json();
    setSubmitting(false);
    if (json.id) router.push(`/admin/orders/${json.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm max-w-2xl grid gap-3">
      <label className="text-sm font-medium">Order Source
        <select value={source} onChange={(e) => setSource(e.target.value)} className="border rounded-lg px-3 py-2 w-full mt-1">
          {["website", "facebook", "instagram", "tiktok", "whatsapp", "offline", "phone", "other"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <input name="customerName" placeholder="Customer Name" required className="border rounded-lg px-3 py-2" />
      <input name="customerPhone" placeholder="Customer Contact Number" required className="border rounded-lg px-3 py-2" />
      <input name="customerAddress" placeholder="Customer Address" required className="border rounded-lg px-3 py-2" />

      <div>
        <p className="text-sm font-medium mb-1">Ordered Products</p>
        {lines.map((l, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <select value={l.productId ?? ""} onChange={(e) => updateLine(i, Number(e.target.value))} className="border rounded-lg px-2 py-1.5 flex-1">
              {products.map((p) => <option key={p.id} value={p.id}>{p.nameEn} (Rs. {p.price})</option>)}
            </select>
            <input type="number" min={1} value={l.qty} onChange={(e) => setLines((ls) => ls.map((x, idx) => idx === i ? { ...x, qty: Number(e.target.value) } : x))} className="border rounded-lg px-2 py-1.5 w-20" />
            <button type="button" onClick={() => setLines((ls) => ls.filter((_, idx) => idx !== i))} className="text-chili text-sm">✕</button>
          </div>
        ))}
        <button type="button" onClick={() => setLines((ls) => [...ls, { productId: products[0]?.id ?? null, name: products[0]?.nameEn ?? "", price: products[0]?.price ?? 0, qty: 1 }])} className="text-sm underline">+ Add product</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">Discount<input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="border rounded-lg px-3 py-2 w-full mt-1" /></label>
        <label className="text-sm">Delivery Charges<input type="number" value={deliveryCharges} onChange={(e) => setDeliveryCharges(Number(e.target.value))} className="border rounded-lg px-3 py-2 w-full mt-1" /></label>
      </div>
      <label className="text-sm">Payment Status
        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="border rounded-lg px-3 py-2 w-full mt-1">
          {["pending", "paid", "failed", "refunded"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <textarea name="notes" placeholder="Order Notes" className="border rounded-lg px-3 py-2" />
      <div className="text-sm bg-cinnamon/5 rounded-lg p-3">
        <div className="flex justify-between"><span>Subtotal</span><span>Rs. {subtotal}</span></div>
        <div className="flex justify-between"><span>Discount</span><span>-Rs. {discount}</span></div>
        <div className="flex justify-between"><span>Delivery</span><span>Rs. {deliveryCharges}</span></div>
        <div className="flex justify-between font-semibold"><span>Total</span><span>Rs. {total}</span></div>
      </div>
      <button disabled={submitting} className="bg-chili text-white px-6 py-2.5 rounded-full font-medium w-fit disabled:opacity-50">{submitting ? "Saving..." : "Save Order"}</button>
    </form>
  );
}
