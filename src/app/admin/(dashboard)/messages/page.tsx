import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { setMessageStatus, deleteMessage } from "@/lib/content-actions";

const TABS = ["new", "read", "archived", "all"] as const;

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { show } = await searchParams;
  const tab = (TABS as readonly string[]).includes(show ?? "") ? show! : "new";
  const all = await db.select().from(messages).orderBy(desc(messages.id));
  const list = tab === "all" ? all : all.filter((m) => m.status === tab);
  const back = `/admin/messages?show=${tab}`;

  const action = (id: number, status: string, label: string) => (
    <form action={setMessageStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="back" value={back} />
      <button className="border border-cinnamon/30 bg-white px-3 py-1 rounded-full hover:bg-cream">{label}</button>
    </form>
  );

  return (
    <div className="max-w-4xl">
      <h1 className="font-heritage text-2xl mb-1">Messages</h1>
      <p className="text-sm opacity-70 mb-4">Everything sent from the website&apos;s Contact and Support forms.</p>
      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        {TABS.map((t) => {
          const count = t === "all" ? all.length : all.filter((m) => m.status === t).length;
          return <Link key={t} href={`/admin/messages?show=${t}`} className={`px-3 py-1 rounded-full border capitalize ${tab === t ? "bg-chili text-white border-chili" : "bg-white"}`}>{t} ({count})</Link>;
        })}
      </div>
      {list.length === 0 ? <p className="text-sm opacity-60 bg-white rounded-xl p-6">No messages here.</p> : null}
      <div className="space-y-3">
        {list.map((m) => {
          const waNumber = (m.phone ?? "").replace(/\D/g, "").replace(/^0/, "92");
          return (
            <article key={m.id} className={`bg-white rounded-xl p-4 shadow-sm ${m.status === "new" ? "border-l-4 border-chili" : ""}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <p className="font-medium">
                  {m.name}{" "}
                  <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${m.kind === "support" ? "bg-turmeric/30" : "bg-cardamom/30"}`}>{m.kind === "support" ? "Support ticket" : "Contact form"}</span>
                </p>
                <time className="text-xs opacity-60">{new Date(m.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" })}</time>
              </div>
              <p className="text-xs opacity-70 mb-2 break-words">
                {[m.phone, m.email, m.category, m.orderNumber ? `Order ${m.orderNumber}` : null].filter(Boolean).join(" · ")}
              </p>
              {m.subject ? <p className="text-sm font-semibold mb-1">{m.subject}</p> : null}
              <p className="text-sm whitespace-pre-line mb-3">{m.message}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {m.email ? <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject ?? "your message to Aura Foods"}`)}`} className="bg-chili text-white px-3 py-1 rounded-full">Reply by email</a> : null}
                {waNumber ? <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="bg-cardamom text-white px-3 py-1 rounded-full">WhatsApp</a> : null}
                {m.status !== "read" ? action(m.id, "read", "Mark as read") : action(m.id, "new", "Mark as new")}
                {m.status !== "archived" ? action(m.id, "archived", "Archive") : null}
                <form action={deleteMessage}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="back" value={back} />
                  <button className="text-chili px-3 py-1 rounded-full hover:underline">Delete</button>
                </form>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
