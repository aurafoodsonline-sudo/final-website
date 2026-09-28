import Link from "next/link";
import Image from "next/image";
import { Lang } from "@/lib/constants";
import AddToCartButton from "./AddToCartButton";
import SpotlightCard from "./reactbits/SpotlightCard";

export default function BundleCard({ bundle, lang }: { bundle: any; lang: Lang }) {
  const name = lang === "ur" ? bundle.nameUr : bundle.nameEn;
  return (
    <Link href={`/${lang}/bundle/${bundle.slug}`} className="group block h-full rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-chili">
      <SpotlightCard
        spotlightColor="rgba(107, 142, 78, 0.28)"
        className="h-full rounded-2xl border border-cinnamon/10 bg-cardamom/10 transition-[transform,box-shadow] duration-500 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_22px_45px_-22px_rgba(74,44,29,0.55)]"
      >
      <div className="relative aspect-square overflow-hidden bg-cream">
        <Image src={bundle.image || "/images/logo.jpg"} unoptimized={String(bundle.image ?? "").startsWith("/uploads/")} alt={name} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]" />
        <span className="absolute top-2 left-2 bg-cardamom text-white text-xs px-2 py-1 rounded-full">{lang === "ur" ? "بنڈل" : "Bundle"}</span>
      </div>
      <div className="p-4">
        <h3 className="font-heritage text-lg leading-snug">{name}</h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-chili font-semibold">Rs. {bundle.price}</span>
          {bundle.oldPrice ? <span className="text-sm line-through opacity-50">Rs. {bundle.oldPrice}</span> : null}
        </div>
        {bundle.websiteStockStatus !== "out_of_stock" && (
          <div className="mt-3">
            <AddToCartButton product={{ id: bundle.id, slug: bundle.slug, name, price: bundle.price, image: bundle.image || "/images/logo.jpg", type: "bundle" }} label={lang === "ur" ? "کارٹ میں شامل کریں" : "Add to cart"} addedLabel={lang === "ur" ? "شامل ہو گیا ✓" : "Added ✓"} size="sm" />
          </div>
        )}
      </div>
      </SpotlightCard>
    </Link>
  );
}