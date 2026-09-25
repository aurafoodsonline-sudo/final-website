"use client";

import { FormEvent, useState } from "react";
import { Lang, t, SOCIAL_LINKS } from "@/lib/constants";

interface TrackResult {
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  whatsappConfirmationStatus: string;
  total: number;
  createdAt: string;
}

export default function TrackOrderForm({ lang }: { lang: Lang }) {
  const d = t(lang);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    const data = new FormData(event.currentTarget);
    const query = new URLSearchParams({
      orderNumber: String(data.get("orderNumber") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
    });
    try {
      const response = await fetch(`/api/track-order?${query.toString()}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setResult(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to find that order.");
    } finally {
      setLoading(false);
    }
  }

  const statuses = ["pending", "confirmed", "delivered"];
  const currentIndex = result ? Math.max(statuses.indexOf(result.orderStatus), 0) : -1;
  const chatUrl = `${SOCIAL_LINKS.whatsapp}?text=${encodeURIComponent(`Assalam-o-Alaikum Aura Foods, Order ${result?.orderNumber ?? ""} ke bare me pochna tha`)}`;

  return (
    <div className="grid gap-6 text-left">
      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium">{d.order_ref}</label>
          <input name="orderNumber" placeholder="AF-123456" required className="w-full rounded-lg border border-cinnamon/20 px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{d.phone}</label>
          <input name="phone" type="tel" placeholder="0300 1234567" required className="w-full rounded-lg border border-cinnamon/20 px-3 py-2" />
        </div>
        {error && <p className="rounded-lg bg-chili/10 px-3 py-2 text-sm text-chili">{error}</p>}
        <button disabled={loading} className="rounded-full bg-chili px-5 py-3 font-medium text-white disabled:opacity-50">
          {loading ? "Checking..." : d.track_btn}
        </button>
      </form>

      {result && (
        <section className="rounded-2xl border border-cinnamon/10 bg-white p-6 shadow-sm" aria-live="polite">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide opacity-60">{d.order_ref}</p>
              <h2 className="font-heritage text-2xl text-cinnamon">{result.orderNumber}</h2>
            </div>
            <span className="rounded-full bg-cardamom/15 px-3 py-1 text-sm font-medium capitalize text-cardamom">{result.orderStatus.replace(/_/g, " ")}</span>
          </div>
          <div className="mb-6 grid grid-cols-3 gap-2">
            {statuses.map((status, index) => (
              <div key={status} className={`border-t-4 pt-2 text-xs capitalize ${index <= currentIndex ? "border-cardamom text-cardamom" : "border-cinnamon/15 opacity-50"}`}>
                {status}
              </div>
            ))}
          </div>
          <div className="grid gap-2 border-t border-cinnamon/10 pt-4 text-sm">
            <p className="flex justify-between"><span>{d.total}</span><b>Rs. {result.total}</b></p>
            <p className="flex justify-between"><span>{d.payment_method}</span><span className="capitalize">{result.paymentStatus}</span></p>
            <p className="flex justify-between"><span>WhatsApp</span><span className="capitalize">{result.whatsappConfirmationStatus.replace(/_/g, " ")}</span></p>
          </div>
          <a href={chatUrl} className="mt-5 block rounded-full bg-cardamom px-5 py-3 text-center font-medium text-white">{d.chat_whatsapp}</a>
        </section>
      )}
    </div>
  );
}
