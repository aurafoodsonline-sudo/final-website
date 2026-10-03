"use client";

import { useState } from "react";

type Product = { id: number; nameEn: string };
type Row = { productId: number; quantity: number };

// Rows of "product + quantity" for a bundle. Empty rows are ignored when saving.
export default function BundleProductFields({ products, initial }: { products: Product[]; initial?: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial?.length ? initial : [{ productId: 0, quantity: 1 }, { productId: 0, quantity: 1 }]);

  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium">Products in this bundle *</p>
      {rows.map((row, index) => (
        <div key={index} className="flex gap-2">
          <select name="productId" value={row.productId} onChange={(e) => setRows((r) => r.map((x, i) => i === index ? { ...x, productId: Number(e.target.value) } : x))} className="border rounded-lg px-2 py-2 flex-1 min-w-0" aria-label={`Product ${index + 1}`}>
            <option value={0}>— Choose product —</option>
            {products.map((product) => <option key={product.id} value={product.id}>{product.nameEn}</option>)}
          </select>
          <input name="quantity" type="number" min="1" value={row.quantity} onChange={(e) => setRows((r) => r.map((x, i) => i === index ? { ...x, quantity: Number(e.target.value) } : x))} className="border rounded-lg px-2 py-2 w-16" aria-label="Quantity" />
          {rows.length > 1 ? <button type="button" onClick={() => setRows((r) => r.filter((_, i) => i !== index))} className="text-sm text-chili px-2" aria-label={`Remove product ${index + 1}`}>✕</button> : null}
        </div>
      ))}
      <button type="button" onClick={() => setRows((r) => [...r, { productId: 0, quantity: 1 }])} className="text-sm underline w-fit">+ Add another product</button>
    </div>
  );
}
