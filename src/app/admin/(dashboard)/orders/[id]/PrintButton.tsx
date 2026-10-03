"use client";
export default function PrintButton() {
  return <button onClick={() => window.print()} className="bg-cinnamon text-white px-4 py-2 rounded-full text-sm print:hidden">Print Invoice</button>;
}
