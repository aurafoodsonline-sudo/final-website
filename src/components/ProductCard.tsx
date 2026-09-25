import Link from "next/link";
import Image from "next/image";
import { Lang, t } from "@/lib/constants";
import AddToCartButton from "./AddToCartButton";
import { parseGrammageOptions } from "@/lib/grammage";

export default function ProductCard({ p, lang }: { p: any; lang: Lang }) {
  const d = t(lang);
  const name = lang === "ur" ? p.nameUr : p.nameEn;
  const tagline = lang === "ur" ? p.taglineUr : p.taglineEn;
  const options = parseGrammageOptions(p.grammageOptions, p.weightLabel, p.price);
  const first = options[0];
  const image = p.image || "/images/logo.jpg";
  const alt = (lang === "ur" ? p.imageAltUr : p.imageAltEn) || name;
  const stockBadge =
    p.websiteStockStatus === "out_of_stock" ? d.out_of_stock :
    p.websiteStockStatus === "limited" ? d.limited_stock : null;
  return (
    <Link href={`/${lang}/product/${p.slug}`} className="group block rounded-2xl bg-white/70 border border-cinnamon/10 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-square bg-cream">
        <Image src={image} unoptimized={image.startsWith("/uploads/")} alt={alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
        {p.bestSeller ? <span className="absolute top-2 left-2 bg-chili text-white text-xs px-2 py-1 rounded-full">{d.best_sellers}</span> : null}
        {stockBadge ? <span className="absolute top-2 right-2 bg-cinnamon text-white text-xs px-2 py-1 rounded-full">{stockBadge}</span> : null}
      </div>
      <div className="p-4">
        <h3 className="font-heritage text-lg leading-snug">{name}</h3>
        <p className="text-sm opacity-70 mt-1">{tagline}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-2">
          <span className="text-chili font-semibold">Rs. {first.price}</span>
          <span className="text-xs opacity-60">/ {first.label}</span>
          {options.length > 1 ? <span className="text-xs opacity-60">· {options.length} {lang === "ur" ? "سائز" : "sizes"}</span> : null}
        </div>
        {p.websiteStockStatus !== "out_of_stock" && (
          <div className="mt-3">
            <AddToCartButton
              product={{ id: p.id, slug: p.slug, name: `${name} (${first.label})`, price: first.price, image, variant: first.label }}
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
