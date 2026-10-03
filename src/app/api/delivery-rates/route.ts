import { NextResponse } from "next/server";
import { getDeliveryRates } from "@/lib/data";

export const dynamic = "force-dynamic";

// Public, read-only: lets the cart and checkout pages show the delivery fee set in Admin → Settings.
export async function GET() {
  return NextResponse.json(await getDeliveryRates(), { headers: { "Cache-Control": "no-store" } });
}
