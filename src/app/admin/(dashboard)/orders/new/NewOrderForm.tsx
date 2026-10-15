"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type CatalogItem = { key: string; id: number; name: string; price: number; type: "product" | "bundle" };
type Line = { key: string; id: number | null; name: string; price: number; type: "product" | "bundle"; qty: number; deliveryCharge: number };

const SOURCES = ["facebook", "instagram", "tiktok", "whatsapp", "phone", "offline", "website", "other"];

export default function NewOrderForm({ products, bundles, defaultDeliveryCharge }: { products: CatalogItem[]; bundles: CatalogItem[]; defaultDeliveryCharge: number }) {
  const router = useRouter();
  const catalog = [...products, ...bundles];
  const [lines, setLines] = useState<Line[]>(catalog[0]
    ? [{ ...catalog[0], qty: 1, deliveryCharge: defaultDeliveryCharge }]
    : [{ key: "", id: null, name: "", price: 0, type: "product", qty: 1, deliveryCharge: defaultDeliveryCharge }]);
  const [source, setSource] = useState("facebook");
  const [discount, setDiscount] = useState(0);
  const [globalDeliveryCharge, setGlobalDeliveryCharge] = useState(defaultDeliveryCharge);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function chooseItem(idx: number, key: string) {
    if (!key) {
      setLines((ls) => ls.map((line, i) => (i === idx ? { ...line, key: "", id: null, name: "", price: 0, type: "product" } : line)));
      return;
    }
    const item = catalog.find((entry) => entry.key === key);
    if (!item) return;
    setLines((ls) => ls.map((line, i) => (i === idx ? { ...item, qty: line.qty, deliveryCharge: line.deliveryCharge } : line)));
  }
  function setLine(idx: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((line, i) => (i === idx ? { ...line, ...patch } : line)));
  }

  const subtotal = lines.reduce((s, l) => s + (l.price || 0) * (l.qty || 0), 0);
  const deliveryCharges = lines.reduce((s, l) => s + (l.deliveryCharge || 0), 0);
  const total = subtotal - discount + deliveryCharges;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError("");
    if (lines.length === 0) { setError("Add at least one product."); return; }
    if (lines.some((l) => !l.name.trim())) { setError("Enter a spice name for every item."); return; }
    if (lines.some((l) => !l.qty || l.qty < 1)) { setError("Every product needs a quantity of at least 1."); return; }
    if (discount > subtotal) { setError("Discount cannot be more than the subtotal."); return; }
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      source, discount, deliveryCharges, paymentStatus,
      customerName: fd.get("customerName"), customerPhone: fd.get("customerPhone"),
      customerAddress: fd.get("customerAddress"), city: fd.get("city"), notes: fd.get("notes"),
      items: lines.map((l) => ({ productId: l.id, type: l.type, name: l.name, price: l.price, qty: l.qty, deliveryCharge: l.deliveryCharge })),
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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm max-w-5xl grid gap-4">
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
        <p className="text-xs opacity-60 mb-2">Choose a catalog product or enter any spice name and price manually.</p>
        {lines.map((l, i) => (
          <div key={i} className="grid grid-cols-2 md:grid-cols-[minmax(12rem,1.5fr)_minmax(12rem,1.5fr)_5rem_7rem_8rem_auto] gap-2 mb-3 items-end">
            <label className="text-xs">Spice Name
              <input value={l.name} onChange={(e) => setLine(i, { name: e.target.value })} className="border rounded-lg px-2 py-1.5 w-full mt-1" required />
            </label>
            <label className="text-xs">Catalog item (optional)
              <select value={l.key} onChange={(e) => chooseItem(i, e.target.value)} className="border rounded-lg px-2 py-1.5 w-full mt-1">
                <option value="">Custom/manual item</option>
                {products.length > 0 && <optgroup label="Products">{products.map((item) => <option key={item.key} value={item.key}>{item.name} — Rs. {item.price}</option>)}</optgroup>}
                {bundles.length > 0 && <optgroup label="Bundles">{bundles.map((item) => <option key={item.key} value={item.key}>{item.name} (Bundle) — Rs. {item.price}</option>)}</optgroup>}
              </select>
            </label>
            <label className="text-xs">Qty
              <input type="number" min={1} value={l.qty || ""} onChange={(e) => setLine(i, { qty: Math.max(0, Math.round(Number(e.target.value))) })} className="border rounded-lg px-2 py-1.5 w-full mt-1" required />
            </label>
            <label className="text-xs">Price (Rs.)
              <input type="number" min={0} value={l.price} onChange={(e) => setLine(i, { price: Math.max(0, Number(e.target.value)) })} className="border rounded-lg px-2 py-1.5 w-full mt-1" required />
            </label>
            <label className="text-xs">Delivery (Rs.)
              <input type="number" min={0} value={l.deliveryCharge} onChange={(e) => setLine(i, { deliveryCharge: Math.max(0, Number(e.target.value)) })} className="border rounded-lg px-2 py-1.5 w-full mt-1" required />
            </label>
            <button type="button" onClick={() => setLines((ls) => ls.filter((_, idx) => idx !== i))} className="text-chili text-sm px-2 py-2" aria-label="Remove line">✕</button>
          </div>
        ))}
        <div className="flex flex-wrap items-end gap-2">
          <button type="button" onClick={() => setLines((ls) => [...ls, { key: "", id: null, name: "", price: 0, type: "product", qty: 1, deliveryCharge: 0 }])} className="text-sm underline">+ Add another item</button>
          <label className="text-xs ml-auto">Global delivery charge (Rs.)
            <input type="number" min={0} value={globalDeliveryCharge} onChange={(e) => setGlobalDeliveryCharge(Math.max(0, Number(e.target.value)))} className="border rounded-lg px-2 py-1.5 w-36 mt-1" />
          </label>
          <button type="button" onClick={() => setLines((ls) => ls.map((line) => ({ ...line, deliveryCharge: globalDeliveryCharge })))} className="border border-cinnamon/30 rounded-full px-3 py-1.5 text-sm">Apply to All</button>
        </div>
      </div>

      <div>
        <label className="text-sm">Discount (Rs.)<input type="number" min={0} value={discount} onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))} className={input} /></label>
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
