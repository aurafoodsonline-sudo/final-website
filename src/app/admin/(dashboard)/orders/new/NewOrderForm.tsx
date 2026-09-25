"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type CatalogItem = { key: string; id: number; name: string; price: number; type: "product" | "bundle" };
type Line = CatalogItem & { qty: number };

const SOURCES = ["facebook", "instagram", "tiktok", "whatsapp", "phone", "offline", "website", "other"];

export default function NewOrderForm({ products, bundles }: { products: CatalogItem[]; bundles: CatalogItem[] }) {
  const router = useRouter();
  const catalog = [...products, ...bundles];
  const [lines, setLines] = useState<Line[]>(catalog[0] ? [{ ...catalog[0], qty: 1 }] : []);
  const [source, setSource] = useState("facebook");
  const [discount, setDiscount] = useState(0);
  const [deliveryCharges, setDeliveryCharges] = useState(150);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (catalog.length === 0) {
    return <p className="bg-white rounded-xl p-6 shadow-sm">Add a product first (Products → Add Product) before creating manual orders.</p>;
  }

  function chooseItem(idx: number, key: string) {
    const item = catalog.find((entry) => entry.key === key);
    if (!item) return;
    setLines((ls) => ls.map((line, i) => (i === idx ? { ...item, qty: line.qty } : line)));
  }
  function setLine(idx: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((line, i) => (i === idx ? { ...line, ...patch } : line)));
  }

  const subtotal = lines.reduce((s, l) => s + (l.price || 0) * (l.qty || 0), 0);
  const total = subtotal - discount + deliveryCharges;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError("");
    if (lines.length === 0) { setError("Add at least one product."); return; }
    if (lines.some((l) => !l.qty || l.qty < 1)) { setError("Every product needs a quantity of at least 1."); return; }
    if (discount > subtotal) { setError("Discount cannot be more than the subtotal."); return; }
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      source, discount, deliveryCharges, paymentStatus,
      customerName: fd.get("customerName"), customerPhone: fd.get("customerPhone"),
      customerAddress: fd.get("customerAddress"), city: fd.get("city"), notes: fd.get("notes"),
      items: lines.map((l) => ({ productId: l.id, type: l.type, name: l.name, price: l.price, qty: l.qty })),
    };
    try {
      const res = await fetch("/api/admin/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.id) {
        router.push(`/admin/orders/${json.id}?ok=${encodeURIComponent(`Order ${json.orderNumber} saved.`)}`);
        return;
      }
      setError(json.error ?? "Could not save the order. Please try again.");
    } catch {
      setError("Could not reach the server. Please check your connection and try again.");
    }
    setSubmitting(false);
  }

  const input = "border rounded-lg px-3 py-2 w-full mt-1";
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm max-w-2xl grid gap-4">
      <label className="text-sm font-medium">Where did this order come from?
        <select value={source} onChange={(e) => setSource(e.target.value)} className={`${input} capitalize`}>
          {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <div className="grid md:grid-cols-2 gap-3">
        <label className="text-sm">Customer name *<input name="customerName" required className={input} /></label>
        <label className="text-sm">Phone number *<input name="customerPhone" type="tel" placeholder="0300 1234567" required className={input} /></label>
        <label className="text-sm">Address *<input name="customerAddress" required className={input} /></label>
        <label className="text-sm">City<input name="city" className={input} /></label>
      </div>

      <div>
        <p className="text-sm font-medium mb-1">Products</p>
        <p className="text-xs opacity-60 mb-2">Choose a product and size. You can change the price if you agreed a different price with the customer.</p>
        {lines.map((l, i) => (
          <div key={i} className="flex flex-wrap gap-2 mb-2 items-center">
            <select value={l.key} onChange={(e) => chooseItem(i, e.target.value)} className="border rounded-lg px-2 py-1.5 flex-1 min-w-56">
              {products.length > 0 && <optgroup label="Products">{products.map((item) => <option key={item.key} value={item.key}>{item.name} — Rs. {item.price}</option>)}</optgroup>}
              {bundles.length > 0 && <optgroup label="Bundles">{bundles.map((item) => <option key={item.key} value={item.key}>{item.name} (Bundle) — Rs. {item.price}</option>)}</optgroup>}
            </select>
            <label className="text-xs flex items-center gap-1">Qty
              <input type="number" min={1} value={l.qty || ""} onChange={(e) => setLine(i, { qty: Math.max(0, Math.round(Number(e.target.value))) })} className="border rounded-lg px-2 py-1.5 w-16" />
            </label>
            <label className="text-xs flex items-center gap-1">Rs.
              <input type="number" min={0} value={l.price} onChange={(e) => setLine(i, { price: Math.max(0, Number(e.target.value)) })} className="border rounded-lg px-2 py-1.5 w-24" />
            </label>
            <button type="button" onClick={() => setLines((ls) => ls.filter((_, idx) => idx !== i))} className="text-chili text-sm px-2" aria-label="Remove line">✕</button>
          </div>
        ))}
        <button type="button" onClick={() => setLines((ls) => [...ls, { ...catalog[0], qty: 1 }])} className="text-sm underline">+ Add another product</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">Discount (Rs.)<input type="number" min={0} value={discount} onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))} className={input} /></label>
        <label className="text-sm">Delivery charges (Rs.)<input type="number" min={0} value={deliveryCharges} onChange={(e) => setDeliveryCharges(Math.max(0, Number(e.target.value)))} className={input} /></label>
      </div>
      <label className="text-sm">Payment status
        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className={`${input} capitalize`}>
          {["pending", "paid", "failed", "refunded"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <label className="text-sm">Notes (optional)<textarea name="notes" rows={2} className={input} /></label>
      <div className="text-sm bg-cinnamon/5 rounded-lg p-3">
        <div className="flex justify-between"><span>Subtotal</span><span>Rs. {subtotal}</span></div>
        <div className="flex justify-between"><span>Discount</span><span>-Rs. {discount}</span></div>
        <div className="flex justify-between"><span>Delivery</span><span>Rs. {deliveryCharges}</span></div>
        <div className="flex justify-between font-semibold"><span>Total</span><span>Rs. {total}</span></div>
      </div>
      {error && <p role="alert" className="text-sm text-chili bg-chili/10 rounded-lg px-3 py-2">{error}</p>}
      <button disabled={submitting} className="bg-chili text-white px-6 py-2.5 rounded-full font-medium w-fit disabled:opacity-50">{submitting ? "Saving..." : "Save Order"}</button>
    </form>
  );
}
