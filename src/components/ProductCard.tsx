import Link from "next/link";
import Image from "next/image";
import { Lang, t } from "@/lib/constants";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ p, lang }: { p: any; lang: Lang }) {
  const d = t(lang);
  const name = lang === "ur" ? p.nameUr : p.nameEn;
  const tagline = lang === "ur" ? p.taglineUr : p.taglineEn;
  const stockBadge =
    p.websiteStockStatus === "out_of_stock" ? d.out_of_stock :
    p.websiteStockStatus === "limited" ? d.limited_stock : null;
  return (
    <Link href={`/${lang}/product/${p.slug}`} className="group block rounded-2xl bg-white/70 border border-cinnamon/10 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-square bg-cream">
        <Image src={p.image} alt={lang === "ur" ? p.imageAltUr ?? name : p.imageAltEn ?? name} fill className="object-cover" />
        {p.bestSeller ? <span className="absolute top-2 left-2 bg-chili text-white text-xs px-2 py-1 rounded-full">{d.best_sellers}</span> : null}
        {stockBadge ? <span className="absolute top-2 right-2 bg-cinnamon text-white text-xs px-2 py-1 rounded-full">{stockBadge}</span> : null}
      </div>
      <div className="p-4">
        <h3 className="font-heritage text-lg leading-snug">{name}</h3>
        <p className="text-sm opacity-70 mt-1">{tagline}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-chili font-semibold">Rs. {p.price}</span>
          {p.oldPrice ? <span className="text-sm line-through opacity-50">Rs. {p.oldPrice}</span> : null}
        </div>
        {p.websiteStockStatus !== "out_of_stock" && (
          <div className="mt-3">
            <AddToCartButton
              product={{ id: p.id, slug: p.slug, name, price: p.price, image: p.image }}
              label={d.add_to_cart}
              addedLabel={lang === "ur" ? "شامل ہو گیا ✓" : "Added ✓"}
              size="sm"
            />
          </div>
        )}
      </div>
    </Link>
  );
}
