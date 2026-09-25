import path from "node:path";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

export const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const MAX_BYTES = 5 * 1024 * 1024;

// Saves an uploaded image and returns its public URL, or null when no file was chosen.
// Throws a readable message when the file is not an acceptable image.
export async function saveUploadedImage(file: FormDataEntryValue | null, prefix: string): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Please upload a JPG, PNG or WEBP image.");
  if (file.size > MAX_BYTES) throw new Error("The image is too large. Please upload an image smaller than 5 MB.");
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const fileName = `${prefix}-${randomUUID()}.${extension}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, fileName), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${fileName}`;
}

// Every image the admin can pick from: the built-in product photos plus anything uploaded.
export async function listSelectableImages(): Promise<string[]> {
  const isImage = (name: string) => /\.(jpe?g|png|webp)$/i.test(name);
  const builtIn = await readdir(path.join(process.cwd(), "public", "images", "products")).catch(() => [] as string[]);
  const uploaded = await readdir(UPLOAD_DIR).catch(() => [] as string[]);
  return [
    ...builtIn.filter(isImage).map((n) => `/images/products/${n}`),
    ...uploaded.filter(isImage).map((n) => `/uploads/${n}`),
  ];
}
