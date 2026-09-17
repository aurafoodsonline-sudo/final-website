import { Lang } from "@/lib/constants";

export default async function OrderConfirmedPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ ref?: string }> }) {
  const { lang: rawLang } = await params;
  const { ref } = await searchParams;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  return (
    <main className="max-w-md mx-auto px-4 py-20 text-center">
      <h1 className="font-heritage text-3xl mb-3 text-chili">
        {lang === "ur" ? "آرڈر موصول ہو گیا!" : "Order Received!"}
      </h1>
      <p className="opacity-80 mb-2">
        {lang === "ur" ? `آپ کا آرڈر نمبر: ${ref}` : `Your order reference: ${ref}`}
      </p>
      <p className="text-sm opacity-70">
        {lang === "ur"
          ? "ہم نے آپ کے واٹس ایپ نمبر پر تصدیقی پیغام بھیج دیا ہے۔ برائے مہربانی YES یا NO سے جواب دیں۔"
          : "We've sent an order confirmation to your WhatsApp number. Please reply YES or NO to confirm."}
      </p>
    </main>
  );
}
