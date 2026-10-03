"use client";
import { useState } from "react";

// Pick an existing photo or upload a new one, with a live preview.
export default function AdminImagePicker({ images, defaultValue, label = "Image" }: { images: string[]; defaultValue?: string | null; label?: string }) {
  const [selected, setSelected] = useState(defaultValue ?? "");
  const [preview, setPreview] = useState<string | null>(null);
  const shown = preview ?? (selected || "/images/logo.jpg");
  const options = selected && !images.includes(selected) ? [selected, ...images] : images;

  return (
    <div className="flex flex-wrap items-start gap-4 md:col-span-2">
      <img src={shown} alt="" className="h-28 w-28 rounded-lg border object-cover bg-cream" />
      <div className="grid gap-2 flex-1 min-w-56 text-sm">
        <label className="grid gap-1">{label}: choose an existing photo
          <select name="image" value={selected} onChange={(e) => { setSelected(e.target.value); setPreview(null); }} className="border rounded-lg px-2 py-1.5">
            <option value="">No photo (show logo)</option>
            {options.map((image) => <option key={image} value={image}>{image.split("/").pop()}</option>)}
          </select>
        </label>
        <label className="grid gap-1">…or upload a new photo (JPG/PNG/WEBP, max 5 MB)
          <input type="file" name="imageFile" accept="image/jpeg,image/png,image/webp" className="text-xs"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : null);
            }} />
        </label>
        {preview && <p className="text-xs text-cardamom">New photo will be used when you save.</p>}
      </div>
    </div>
  );
}
