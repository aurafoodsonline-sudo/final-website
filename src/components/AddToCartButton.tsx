"use client";
import { addToCart } from "@/lib/cart";
import { useState } from "react";

export default function AddToCartButton({ product, label, addedLabel, size = "md", allowQuantity = false }: { product: { id: number; slug: string; name: string; price: number; image: string; variant?: string; type?: "product" | "bundle" }; label: string; addedLabel: string; size?: "sm" | "md"; allowQuantity?: boolean }) {
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const sizeClass = size === "sm" ? "text-sm px-4 py-1.5" : "px-6 py-3";
  return (
    <div className="flex items-center gap-3"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {allowQuantity && <div className="flex items-center border border-cinnamon/20 rounded-full overflow-hidden" aria-label="Quantity">
        <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="px-3 py-1.5" aria-label="Decrease quantity">−</button>
        <span className="min-w-8 text-center">{quantity}</span>
        <button type="button" onClick={() => setQuantity((value) => Math.min(99, value + 1))} className="px-3 py-1.5" aria-label="Increase quantity">+</button>
      </div>}
      <button
        type="button"
        onClick={() => {
          addToCart({ productId: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image, qty: quantity, variant: product.variant, type: product.type ?? "product" });
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        className={`bg-chili text-white rounded-full font-medium hover:opacity-90 ${sizeClass}`}
      >
        {added ? addedLabel : label}
      </button>
    </div>
  );
}
