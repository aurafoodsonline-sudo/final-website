import { db } from "@/db";
import { products, bundles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { parseGrammageOptions } from "@/lib/grammage";
import NewOrderForm from "./NewOrderForm";

export default async function NewOrderPage() {
  const all = await db.select().from(products);
  const allBundles = await db.select().from(bundles).where(eq(bundles.isHidden, 0));
  // One choice per product size, e.g. "Royal Garam Masala (100g)".
  const productChoices = all.flatMap((p) =>
    parseGrammageOptions(p.grammageOptions, p.weightLabel, p.price).map((o, index) => ({
      key: `product:${p.id}:${index}`, id: p.id, name: `${p.nameEn} (${o.label})`, price: o.price, type: "product" as const,
    })).concat(p.wholesalePrice ? [{ key: `product:${p.id}:wholesale`, id: p.id, name: `${p.nameEn} (1kg Wholesale)`, price: p.wholesalePrice, type: "product" as const }] : [])
  );
  const bundleChoices = allBundles.map((b) => ({ key: `bundle:${b.id}`, id: b.id, name: b.nameEn, price: b.price, type: "bundle" as const }));
  return (
    <div>
      <h1 className="font-heritage text-2xl mb-1">New Manual Order</h1>
      <p className="text-sm opacity-70 mb-4">For orders received on Facebook, Instagram, WhatsApp, phone or in person. They appear in Orders and the Dashboard just like website orders.</p>
      <NewOrderForm products={productChoices} bundles={bundleChoices} />
    </div>
  );
}
