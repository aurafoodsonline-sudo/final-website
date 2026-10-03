import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getSession()) redirect("/admin");
  const { error } = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center bg-cinnamon px-4">
      <form action="/api/admin/login" method="post" className="bg-cream rounded-2xl p-8 w-full max-w-sm">
        <img src="/images/logo.jpg" alt="Aura Foods" className="w-16 h-16 rounded-full mx-auto mb-4" />
        <h1 className="font-heritage text-2xl text-center mb-6 text-cinnamon">Aura Foods Admin</h1>
        {error && <p role="alert" className="text-chili text-sm text-center mb-3 bg-chili/10 rounded-lg py-2">Wrong username or password. Please try again.</p>}
        <label className="block text-sm mb-3">Username
          <input name="username" autoComplete="username" autoCapitalize="none" required autoFocus className="border rounded-lg px-3 py-2 w-full mt-1" />
        </label>
        <label className="block text-sm mb-4">Password
          <input name="password" type="password" autoComplete="current-password" required className="border rounded-lg px-3 py-2 w-full mt-1" />
        </label>
        <button className="bg-chili text-white w-full py-2.5 rounded-full font-medium">Log In</button>
        <a href="/en" className="block text-center text-xs underline mt-4 opacity-70">← Back to website</a>
      </form>
    </main>
  );
}
