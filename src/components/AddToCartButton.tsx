"use client";
import { addToCart } from "@/lib/cart";
import { useState } from "react";

export default function AddToCartButton({ product, label, addedLabel, size = "md" }: { product: { id: number; slug: string; name: string; price: number; image: string }; label: string; addedLabel: string; size?: "sm" | "md" }) {
  const [added, setAdded] = useState(false);
  const sizeClass = size === "sm" ? "text-sm px-4 py-1.5" : "px-6 py-3";
  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <button
        onClick={() => {
          addToCart({ productId: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image, qty: 1 });
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
