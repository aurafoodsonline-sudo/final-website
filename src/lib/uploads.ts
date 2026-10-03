import path from "node:path";
import { readdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";

// Images uploaded from the admin panel are stored in the database (table "media") and served
// at /uploads/<name>, so they survive every redeploy.
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// Saves an uploaded image and returns its public URL, or null when no file was chosen.
// Throws a readable message when the file is not an acceptable image.
export async function saveUploadedImage(file: FormDataEntryValue | null, prefix: string): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  const extension = TYPES[file.type];
  if (!extension) throw new Error("Please upload a JPG, PNG or WEBP image.");
  if (file.size > MAX_BYTES) throw new Error("The image is too large. Please upload an image smaller than 5 MB.");
  const safePrefix = prefix.replace(/[^\w-]/g, "") || "image";
  const name = `${safePrefix}-${randomUUID()}.${extension}`;
  const data = Buffer.from(await file.arrayBuffer());
  await db.insert(media).values({ name, mimeType: file.type, size: data.length, data, createdAt: new Date().toISOString() });
  return `/uploads/${name}`;
}

export async function getUploadedImage(name: string) {
  const [row] = await db.select().from(media).where(eq(media.name, name));
  return row ?? null;
}

// Every image the admin can pick from: the built-in product photos plus everything uploaded.
export async function listSelectableImages(): Promise<string[]> {
  const isImage = (n: string) => /\.(jpe?g|png|webp)$/i.test(n);
  const builtIn = await readdir(path.join(process.cwd(), "public", "images", "products")).catch(() => [] as string[]);
  const uploaded = await db.select({ name: media.name }).from(media).orderBy(desc(media.id));
  return [
    ...uploaded.map((u) => `/uploads/${u.name}`),
    ...builtIn.filter(isImage).map((n) => `/images/products/${n}`),
  ];
}
