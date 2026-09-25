"use client";

import { useState } from "react";
import { GrammageOption, parseGrammageOptions } from "@/lib/grammage";

// Lets the admin list every pack size with its own price, e.g. 100g = Rs. 190, 200g = Rs. 350.
// The first row is the main size shown on product cards.
export default function GrammagePriceEditor({ initialValue, fallbackLabel, fallbackPrice }: {
  initialValue?: string | null;
  fallbackLabel: string;
  fallbackPrice: number;
}) {
  const [options, setOptions] = useState<GrammageOption[]>(() =>
    initialValue || fallbackLabel ? parseGrammageOptions(initialValue, fallbackLabel, fallbackPrice) : [{ label: "", price: 0 }]);

  function updateOption(index: number, field: keyof GrammageOption, value: string) {
    setOptions((current) => current.map((option, optionIndex) => optionIndex === index
      ? { ...option, [field]: field === "price" ? (value === "" ? 0 : Number(value)) : value }
      : option));
  }
  function move(index: number, direction: -1 | 1) {
    setOptions((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  const cleaned = options.filter((o) => o.label.trim());
  return (
    <div className="grid gap-2 md:col-span-2">
      <p className="text-sm font-medium">Sizes and prices *</p>
      <p className="text-xs opacity-60">Add one row per pack size. The first row is the main size shown on product cards.</p>
      <input type="hidden" name="grammageOptions" value={JSON.stringify(cleaned)} />
      <input type="hidden" name="weightLabel" value={cleaned[0]?.label ?? ""} />
      <input type="hidden" name="price" value={cleaned[0]?.price ?? 0} />
      {options.map((option, index) => (
        <div key={index} className="flex flex-wrap gap-2 items-center">
          <input value={option.label} onChange={(event) => updateOption(index, "label", event.target.value)} placeholder="Size, e.g. 100g" aria-label="Size" className="border rounded-lg px-2 py-1.5 flex-1 min-w-32" />
          <label className="flex items-center gap-1 text-sm">Rs.
            <input value={option.price || ""} onChange={(event) => updateOption(index, "price", event.target.value)} type="number" min="0" step="1" placeholder="Price" aria-label="Price" className="border rounded-lg px-2 py-1.5 w-28" />
          </label>
          {index > 0 && <button type="button" onClick={() => move(index, -1)} className="text-sm px-1" aria-label="Move up">↑</button>}
          {options.length > 1 && <button type="button" onClick={() => setOptions((current) => current.filter((_, optionIndex) => optionIndex !== index))} className="text-sm text-chili underline">Remove</button>}
        </div>
      ))}
      <button type="button" onClick={() => setOptions((current) => [...current, { label: "", price: 0 }])} className="text-sm underline w-fit">+ Add another size</button>
    </div>
  );
}
