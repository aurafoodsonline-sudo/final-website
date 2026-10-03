"use server";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { adminUsers, contentItems, messages, pages, settings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/uploads";
import { DICT } from "@/lib/constants";

// Admin actions for website content, messages and business settings. Same pattern as
// admin-actions.ts: login required, then back to the page with a green/red message.
function withParam(path: string, key: string, message: string) {
  return `${path}${path.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(message)}`;
}
function done(path: string, message: string): never {
  redirect(withParam(path, "ok", message));
}
function fail(path: string, message: string): never {
  redirect(withParam(path, "error", message));
}
function text(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}
function refreshSite() {
  revalidatePath("/", "layout");
}
async function upsertSetting(key: string, value: string) {
  await db.insert(settings).values({ key, value }).onConflictDoUpdate({ target: settings.key, set: { value } });
}

// ---------------------------------------------------------------------------
// MESSAGES (contact + support inbox)
// ---------------------------------------------------------------------------
export async function setMessageStatus(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const status = text(fd, "status");
  const back = text(fd, "back") || "/admin/messages";
  if (!["new", "read", "archived"].includes(status)) fail(back, "Unknown status.");
  await db.update(messages).set({ status }).where(eq(messages.id, id));
  revalidatePath("/admin", "layout");
  done(back, status === "archived" ? "Message archived." : status === "read" ? "Marked as read." : "Marked as new.");
}

export async function deleteMessage(fd: FormData) {
  await requireAdmin();
  const back = text(fd, "back") || "/admin/messages";
  await db.delete(messages).where(eq(messages.id, Number(fd.get("id"))));
  revalidatePath("/admin", "layout");
  done(back, "Message deleted.");
}

// ---------------------------------------------------------------------------
// CONTENT BLOCKS (FAQ, testimonials, why-choose-us, values, blog)
// ---------------------------------------------------------------------------
const KINDS = ["faq", "testimonial", "why", "value", "blog"];

export async function saveContentItem(fd: FormData) {
  await requireAdmin();
  const kind = text(fd, "kind");
  const back = `/admin/content?kind=${kind}`;
  if (!KINDS.includes(kind)) fail("/admin/content", "Unknown content type.");
  const id = Number(fd.get("id")) || null;
  const titleEn = text(fd, "titleEn");
  const bodyEn = text(fd, "bodyEn");
  if (!titleEn || !bodyEn) fail(back, "Please fill in at least the English heading and text.");

  let image: string | null = text(fd, "image") || null;
  try {
    const uploaded = await saveUploadedImage(fd.get("imageFile"), `content-${kind}`);
    if (uploaded) image = uploaded;
  } catch (error) {
    fail(back, error instanceof Error ? error.message : "Image upload failed.");
  }

  const values = {
    kind,
    titleEn, bodyEn,
    titleUr: text(fd, "titleUr"), bodyUr: text(fd, "bodyUr"),
    extraEn: text(fd, "extraEn") || null, extraUr: text(fd, "extraUr") || null,
    meta: text(fd, "meta") || null,
    image,
    sortOrder: Math.round(Number(fd.get("sortOrder")) || 0),
    isHidden: fd.get("isHidden") === "on" ? 1 : 0,
  };
  if (id) await db.update(contentItems).set(values).where(and(eq(contentItems.id, id), eq(contentItems.kind, kind)));
  else await db.insert(contentItems).values(values);
  refreshSite();
  done(back, id ? "Saved." : "Added.");
}

export async function deleteContentItem(fd: FormData) {
  await requireAdmin();
  const kind = text(fd, "kind");
  await db.delete(contentItems).where(eq(contentItems.id, Number(fd.get("id"))));
  refreshSite();
  done(`/admin/content?kind=${kind}`, "Deleted.");
}

// ---------------------------------------------------------------------------
// POLICY PAGES
// ---------------------------------------------------------------------------
export async function savePage(fd: FormData) {
  await requireAdmin();
  const slug = text(fd, "slug");
  const back = `/admin/pages?slug=${slug}`;
  const values = { titleEn: text(fd, "titleEn"), titleUr: text(fd, "titleUr"), bodyEn: text(fd, "bodyEn"), bodyUr: text(fd, "bodyUr") };
  if (!values.titleEn || !values.bodyEn) fail(back, "Please fill in the English title and text.");
  const [existing] = await db.select({ slug: pages.slug }).from(pages).where(eq(pages.slug, slug));
  if (!existing) fail("/admin/pages", "Page not found.");
  await db.update(pages).set(values).where(eq(pages.slug, slug));
  refreshSite();
  done(back, "Page saved.");
}

// ---------------------------------------------------------------------------
// WEBSITE TEXT (overrides for the built-in English/Urdu wording)
// ---------------------------------------------------------------------------
export async function saveTexts(fd: FormData) {
  await requireAdmin();
  const lang = text(fd, "lang") === "ur" ? "ur" : "en";
  const back = `/admin/texts?lang=${lang}`;
  const base = DICT[lang] as Record<string, string>;
  let changed = 0;
  for (const key of Object.keys(base)) {
    if (key === "dir" || !fd.has(`t_${key}`)) continue;
    const value = String(fd.get(`t_${key}`) ?? "").trim();
    const settingKey = `text.${lang}.${key}`;
    if (!value || value === base[key]) {
      await db.delete(settings).where(eq(settings.key, settingKey)); // back to the built-in wording
    } else {
      await upsertSetting(settingKey, value);
      changed++;
    }
  }
  refreshSite();
  done(back, `Website text saved (${changed} custom ${changed === 1 ? "change" : "changes"}).`);
}

// ---------------------------------------------------------------------------
// BUSINESS DETAILS & SOCIAL LINKS
// ---------------------------------------------------------------------------
const BUSINESS_KEYS = ["site_name", "tagline", "phone", "whatsapp", "email", "city", "address", "partner_farms", "facebook", "instagram", "tiktok", "youtube", "daraz"];
const URL_KEYS = ["facebook", "instagram", "tiktok", "youtube", "daraz"];

export async function updateBusinessSettings(fd: FormData) {
  await requireAdmin();
  const back = "/admin/settings";
  for (const key of BUSINESS_KEYS) {
    if (!fd.has(key)) continue;
    let value = text(fd, key);
    if (URL_KEYS.includes(key) && value && !/^https?:\/\//i.test(value)) value = `https://${value}`;
    if (key === "whatsapp") value = value.replace(/\D/g, "").replace(/^0/, "92");
    if (key === "partner_farms" && value && !/^\d+$/.test(value)) fail(back, "Partner farms must be a whole number.");
    if (key === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) fail(back, "Please enter a valid email address.");
    await upsertSetting(key, value);
  }
  refreshSite();
  done(back, "Business details and social links saved.");
}

// ---------------------------------------------------------------------------
// ADMIN PASSWORD
// ---------------------------------------------------------------------------
export async function changePassword(fd: FormData) {
  const session = await requireAdmin();
  const back = "/admin/settings";
  const current = String(fd.get("currentPassword") ?? "");
  const next = String(fd.get("newPassword") ?? "");
  const confirm = String(fd.get("confirmPassword") ?? "");
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, Number(session.adminId)));
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) fail(back, "Your current password is not correct.");
  if (next.length < 10) fail(back, "The new password must be at least 10 characters.");
  if (next !== confirm) fail(back, "The two new passwords do not match.");
  await db.update(adminUsers).set({ passwordHash: await bcrypt.hash(next, 10) }).where(eq(adminUsers.id, user.id));
  done(back, "Password changed.");
}
