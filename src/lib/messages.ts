import { db } from "@/db";
import { messages } from "@/db/schema";

const clip = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max) || null;

// Saves a Contact or Support form submission so it appears in Admin → Messages.
// Returns false when required fields are missing.
export async function saveMessage(kind: "contact" | "support", fd: FormData) {
  if (String(fd.get("website") ?? "")) return true; // hidden spam-trap field filled in by bots: pretend success
  const name = clip(fd.get("name"), 120);
  const message = clip(fd.get("message"), 5000);
  if (!name || !message) return false;
  await db.insert(messages).values({
    kind,
    name,
    email: clip(fd.get("email"), 200),
    phone: clip(fd.get("phone"), 40),
    category: clip(fd.get("category"), 60),
    subject: clip(fd.get("subject"), 200),
    orderNumber: clip(fd.get("orderNumber"), 40),
    message,
    status: "new",
    createdAt: new Date().toISOString(),
  });
  return true;
}
