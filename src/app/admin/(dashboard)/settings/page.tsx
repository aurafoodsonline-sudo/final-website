import { db } from "@/db";
import { settings } from "@/db/schema";
import { updateSettings, updateDeliverySettings } from "@/lib/admin-actions";
import { getDeliveryRates } from "@/lib/data";
import { updateBusinessSettings, changePassword } from "@/lib/content-actions";

export default async function SettingsPage() {
  const all = await db.select().from(settings);
  const get = (k: string) => all.find((s) => s.key === k)?.value ?? "";
  const rates = await getDeliveryRates();
  const field = "border rounded-lg px-3 py-2 w-full mt-1";
  const live = !!process.env.WHATSAPP_TOKEN && !!process.env.WHATSAPP_PHONE_NUMBER_ID;

  return (
    <div className="max-w-2xl">
      <h1 className="font-heritage text-2xl mb-4">Settings</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h2 className="font-semibold mb-1">Delivery charges</h2>
        <p className="text-sm opacity-70 mb-4">Used in the cart, at checkout, and on the FAQ and Shipping Policy pages. Orders already placed keep the charge they were placed with.</p>
        <form action={updateDeliverySettings} className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm">Delivery charge (Rs.)
            <input type="number" name="delivery_charge" min={0} step={1} required defaultValue={rates.deliveryCharge} className="border rounded-lg px-3 py-2 w-full mt-1" />
            <span className="block text-xs opacity-60 mt-1">0 = free delivery on every order</span>
          </label>
          <label className="text-sm">Free delivery on orders from (Rs.)
            <input type="number" name="free_delivery_from" min={0} step={1} required defaultValue={rates.freeDeliveryFrom} className="border rounded-lg px-3 py-2 w-full mt-1" />
            <span className="block text-xs opacity-60 mt-1">0 = delivery is never free</span>
          </label>
          <button className="bg-chili text-white px-5 py-2 rounded-full w-fit sm:col-span-2">Save delivery charges</button>
        </form>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h2 className="font-semibold mb-1">Business details</h2>
        <p className="text-sm opacity-70 mb-4">Shown in the footer, on the Contact and Order pages, and used for WhatsApp buttons.</p>
        <form action={updateBusinessSettings} className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm">Business name<input name="site_name" defaultValue={get("site_name")} className={field} /></label>
          <label className="text-sm">Phone (as shown)<input name="phone" defaultValue={get("phone")} className={field} placeholder="+92 301 2730116" /></label>
          <label className="text-sm">WhatsApp number<input name="whatsapp" defaultValue={get("whatsapp")} className={field} placeholder="923012730116" />
            <span className="block text-xs opacity-60 mt-1">Used for every &ldquo;Chat on WhatsApp&rdquo; button. 03xx numbers are converted automatically.</span>
          </label>
          <label className="text-sm">Email<input name="email" type="email" defaultValue={get("email")} className={field} /></label>
          <label className="text-sm">City<input name="city" defaultValue={get("city")} className={field} /></label>
          <label className="text-sm">Address (as shown)<input name="address" defaultValue={get("address")} className={field} /></label>
          <label className="text-sm">Partner farms (About page number)<input name="partner_farms" inputMode="numeric" defaultValue={get("partner_farms")} className={field} /></label>

          <h3 className="sm:col-span-2 font-semibold mt-3">Social media links</h3>
          <p className="sm:col-span-2 text-xs opacity-60 -mt-2">Each link appears as an icon in the footer. Leave a box empty to hide that icon.</p>
          <label className="text-sm">Facebook page<input name="facebook" defaultValue={get("facebook")} className={field} placeholder="https://facebook.com/…" /></label>
          <label className="text-sm">Instagram<input name="instagram" defaultValue={get("instagram")} className={field} placeholder="https://instagram.com/…" /></label>
          <label className="text-sm">TikTok<input name="tiktok" defaultValue={get("tiktok")} className={field} placeholder="https://tiktok.com/@…" /></label>
          <label className="text-sm">YouTube<input name="youtube" defaultValue={get("youtube")} className={field} placeholder="https://youtube.com/@…" /></label>
          <label className="text-sm">Daraz shop<input name="daraz" defaultValue={get("daraz")} className={field} placeholder="https://daraz.pk/shop/…" /></label>
          <button className="bg-chili text-white px-5 py-2 rounded-full w-fit sm:col-span-2">Save business details</button>
        </form>
      </div>

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
      <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
        <h2 className="font-semibold mb-3">Change admin password</h2>
        <form action={changePassword} className="grid sm:grid-cols-3 gap-3">
          <label className="text-sm">Current password<input name="currentPassword" type="password" required autoComplete="current-password" className={field} /></label>
          <label className="text-sm">New password<input name="newPassword" type="password" required minLength={10} autoComplete="new-password" className={field} /></label>
          <label className="text-sm">Repeat new password<input name="confirmPassword" type="password" required minLength={10} autoComplete="new-password" className={field} /></label>
          <button className="bg-chili text-white px-5 py-2 rounded-full w-fit sm:col-span-3">Change password</button>
        </form>
      </div>
    </div>
  );
}
