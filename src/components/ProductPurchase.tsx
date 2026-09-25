"use client";

import { useState } from "react";
import AddToCartButton from "./AddToCartButton";
import { GrammageOption } from "@/lib/grammage";

export default function ProductPurchase({ options, product, label, addedLabel, sizeLabel = "Size", oldPrice }: {
  options: GrammageOption[];
  product: { id: number; slug: string; name: string; image: string };
  label: string;
  addedLabel: string;
  sizeLabel?: string;
  oldPrice?: number | null;
}) {
  const [selectedLabel, setSelectedLabel] = useState(options[0]?.label ?? "");
  const selected = options.find((option) => option.label === selectedLabel) ?? options[0];

  if (!selected) return null;

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <span className="text-sm opacity-70">{sizeLabel}</span>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={sizeLabel}>
          {options.map((option) => {
            const isSelected = option.label === selected.label;
            return (
              <button
                key={option.label}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedLabel(option.label)}
                className={`border rounded-lg px-3 py-2 text-sm transition-colors ${isSelected ? "border-cinnamon bg-cinnamon text-white" : "border-cinnamon/20 bg-white hover:border-cinnamon"}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-semibold text-chili">Rs. {selected.price}</span>
          {oldPrice && oldPrice > selected.price && selected.label === options[0]?.label ? <span className="line-through opacity-50">Rs. {oldPrice}</span> : null}
        </div>
      </div>
      <AddToCartButton
        product={{ ...product, name: `${product.name} (${selected.label})`, price: selected.price, variant: selected.label }}
        label={label}
        addedLabel={addedLabel}
        allowQuantity
      />
    </div>
  );
}