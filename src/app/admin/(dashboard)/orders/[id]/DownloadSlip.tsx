"use client";

import { useState } from "react";

type Slip = {
  number: string;
  fields: [string, string][];
  items: { name: string; quantity: number; unitPrice: number; delivery: number }[];
  totals: [string, string][];
};

export default function DownloadSlip({ slip }: { slip: Slip }) {
  const [error, setError] = useState("");

  async function download() {
    setError("");
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas unavailable");
      const ctx = context;

      const width = 1050;
      const left = 56;
      const right = width - left;
      const showDelivery = slip.items.some((item) => item.delivery > 0);
      const deliveryX = right;
      const priceX = showDelivery ? 820 : right;
      const qtyX = 665;
      let y = 0;
      const commands: (() => void)[] = [];
      const addText = (value: string, x: number, baseline: number, size = 23, bold = false, align: CanvasTextAlign = "left", maxWidth?: number) => {
        commands.push(() => {
          ctx.font = (bold ? "bold " : "") + size + "px Arial, sans-serif";
          ctx.textAlign = align;
          ctx.fillStyle = "#352218";
          if (maxWidth) ctx.fillText(value, x, baseline, maxWidth);
          else ctx.fillText(value, x, baseline);
        });
      };
      function wrap(value: string, maxWidth: number) {
        ctx.font = "23px Arial, sans-serif";
        const lines: string[] = [];
        let line = "";
        for (const character of value) {
          if (character === "\n" || (line && ctx.measureText(line + character).width > maxWidth)) {
            const space = character === "\n" ? -1 : line.lastIndexOf(" ");
            if (space > 0) {
              lines.push(line.slice(0, space));
              line = line.slice(space + 1);
            } else {
              lines.push(line);
              line = "";
            }
          }
          if (character !== "\n") line += character;
        }
        return [...lines, line];
      }
      function rule(at: number) {
        commands.push(() => {
          ctx.fillStyle = "#eaded4";
          ctx.fillRect(left, at, right - left, 1);
        });
      }

      addText("Aura Foods", left, 78, 42, true);
      addText("Order slip", right, 78, 27, true, "right");
      rule(102);
      y = 145;
      for (const [label, value] of slip.fields) {
        addText(label, left, y, 23, true);
        for (const line of wrap(value, right - left - 150)) {
          addText(line, left + 150, y);
          y += 30;
        }
        y += 5;
      }
      y += 25;
      addText("Product", left, y, 23, true);
      addText("Qty × Unit Price", qtyX, y, 23, true, "right");
      addText("Price", priceX, y, 23, true, "right");
      if (showDelivery) addText("Delivery", deliveryX, y, 23, true, "right");
      rule(y + 12);
      y += 44;

      for (const item of slip.items) {
        addText(item.quantity + " × Rs. " + item.unitPrice, qtyX, y, 23, false, "right", 170);
        addText("Rs. " + item.unitPrice * item.quantity, priceX, y, 23, false, "right", 140);
        if (showDelivery) addText("Rs. " + item.delivery, deliveryX, y, 23, false, "right", 158);
        for (const line of wrap(item.name, 420)) {
          addText(line, left, y);
          y += 30;
        }
        rule(y - 13);
        y += 15;
      }
      y += 24;
      for (const [label, value] of slip.totals) {
        const bold = label === "Total";
        addText(label, qtyX, y, 23, bold);
        addText(value, right, y, 23, bold, "right");
        y += 38;
      }

      const height = y + 25;
      const scale = Math.min(1, 16000 / height);
      canvas.width = Math.ceil(width * scale);
      canvas.height = Math.ceil(height * scale);
      ctx.scale(scale, scale);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      commands.forEach((draw) => draw());
      const jpg = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => blob?.type === "image/jpeg" ? resolve(blob) : reject(new Error("JPG encoding failed")), "image/jpeg", 0.94);
      });
      const url = URL.createObjectURL(jpg);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Aura-Foods-" + slip.number.replace(/[^a-z0-9_-]/gi, "_") + ".jpg";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("Couldn’t create the JPG. Try again.");
    }
  }

  return (
    <div>
      <button type="button" onClick={download} className="bg-chili text-white px-4 py-2 rounded-full text-sm print:hidden">
        Download Slip JPG
      </button>
      {error && <p className="mt-1 text-xs text-chili" role="alert">{error}</p>}
    </div>
  );
}
