import { db } from "@/db";
import { settings } from "@/db/schema";
import { updateSettings } from "@/lib/admin-actions";

export default async function SettingsPage() {
  const all = await db.select().from(settings);
  const get = (k: string) => all.find((s) => s.key === k)?.value ?? "";
  const live = !!process.env.WHATSAPP_TOKEN && !!process.env.WHATSAPP_PHONE_NUMBER_ID;

  return (
    <div className="max-w-2xl">
      <h1 className="font-heritage text-2xl mb-4">Settings</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h2 className="font-semibold mb-1">WhatsApp order confirmation</h2>
        <p className="text-sm mb-4">
          Connection: {live
            ? <b className="text-cardamom">Connected to WhatsApp Cloud API</b>
            : <b className="text-chili">Not connected yet</b>}
        </p>
        <form action={updateSettings} className="grid gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="whatsapp_automation_enabled" value="true" defaultChecked={get("whatsapp_automation_enabled") === "true"} />
            Automatically send a WhatsApp confirmation when a customer orders on the website
          </label>
          <label className="text-sm">Message notes / draft template <span className="opacity-60">(for your reference)</span>
            <textarea name="whatsapp_template" defaultValue={get("whatsapp_template")} rows={4} className="border rounded-lg px-3 py-2 w-full mt-1 font-mono text-xs" />
          </label>
          <p className="text-xs opacity-60">
            WhatsApp only allows automatic messages that use a template approved in your Meta Business account. The
            template name is set with the WHATSAPP_TEMPLATE_NAME environment variable, together with WHATSAPP_TOKEN and
            WHATSAPP_PHONE_NUMBER_ID. Until those are set, orders are still saved normally — the message is just not sent.
          </p>
          <button className="bg-chili text-white px-5 py-2 rounded-full w-fit">Save settings</button>
        </form>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold mb-3">Payment methods</h2>
        <ul className="text-sm space-y-1">
          <li>Cash on Delivery: <b className="text-cardamom">Live</b></li>
        </ul>
        <p className="text-xs opacity-60 mt-2">All credentials are read from server-side environment variables only and are never shown on the website.</p>
      </div>
    </div>
  );
}
