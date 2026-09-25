export type GrammageOption = { label: string; price: number };

export function parseGrammageOptions(value: string | null | undefined, fallbackLabel: string, fallbackPrice: number): GrammageOption[] {
  if (value) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        const options = parsed
          .filter((option) => option && typeof option.label === "string" && Number.isFinite(Number(option.price)))
          .map((option) => ({ label: option.label.trim(), price: Number(option.price) }))
          .filter((option) => option.label);
        if (options.length) return options;
      }
    } catch {
      // Existing products may still use comma-separated grammage labels.
    }

    const legacyOptions = value.split(",").map((label) => label.trim()).filter(Boolean);
    if (legacyOptions.length) return legacyOptions.map((label) => ({ label, price: fallbackPrice }));
  }

  return [{ label: fallbackLabel, price: fallbackPrice }];
}