import { NextRequest, NextResponse } from "next/server";
import { getUploadedImage } from "@/lib/uploads";

export const dynamic = "force-dynamic";

// Serves images uploaded from the admin panel, straight from the database.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[\w-]+\.(jpe?g|png|webp)$/i.test(name)) return new NextResponse("Not found", { status: 404 });
  const file = await getUploadedImage(name);
  if (!file) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(file.data), {
    headers: { "Content-Type": file.mimeType, "Content-Length": String(file.size), "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
