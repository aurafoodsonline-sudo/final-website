import { db } from "@/db";
import { settings } from "@/db/schema";
import { updateSettings } from "@/lib/admin-actions";

export default async function SettingsPage() {
  const all = await db.select().from(settings);
  const get = (k: string) => all.find((s) => s.key === k)?.value ?? "";

  return (
    <div className="max-w-2xl">
      <h1 className="font-heritage text-2xl mb-4">WhatsApp & Payment Settings</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h2 className="font-semibold mb-3">WhatsApp Automated Order Confirmation</h2>
        <form action={updateSettings} className="grid gap-3">
          <input type="hidden" name="whatsapp_automation_enabled" value="false" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="whatsapp_automation_enabled" value="true" defaultChecked={get("whatsapp_automation_enabled") === "true"} /> Automation ON
          </label>
          <label className="text-sm">Message Template
            <textarea name="whatsapp_template" defaultValue={get("whatsapp_template")} rows={6} className="border rounded-lg px-3 py-2 w-full mt-1 font-mono text-xs" />
          </label>
          <p className="text-xs opacity-60">Uses Meta's WhatsApp Business Cloud API. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID env vars to go live — until then, messages are logged as a labelled stub.</p>
          <button className="bg-chili text-white px-5 py-2 rounded-full w-fit">Save</button>
        </form>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold mb-3">Payment Integrations — Status</h2>
        <ul className="text-sm space-y-1">
          <li>Cash on Delivery: <b className="text-cardamom">Live</b></li>
          <li>Card (Stripe reference implementation): <b className="text-turmeric">Stub — needs STRIPE_SECRET_KEY</b></li>
          <li>JazzCash: <b className="text-turmeric">Stub — needs merchant credentials</b></li>
          <li>Easypaisa: <b className="text-turmeric">Stub — needs merchant credentials</b></li>
        </ul>
        <p className="text-xs opacity-60 mt-2">All credentials are read from server-side environment variables only and are never exposed to the frontend.</p>
      </div>
    </div>
  );
}
