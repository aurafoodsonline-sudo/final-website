export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center bg-cinnamon">
      <form action="/api/admin/login" method="post" className="bg-cream rounded-2xl p-8 w-full max-w-sm">
        <img src="/images/logo.jpg" alt="Aura Foods" className="w-16 h-16 rounded-full mx-auto mb-4" />
        <h1 className="font-heritage text-2xl text-center mb-6 text-cinnamon">Aura Foods Admin</h1>
        {error && <p className="text-chili text-sm text-center mb-3">Invalid username or password.</p>}
        <input name="username" placeholder="Username" required className="border rounded-lg px-3 py-2 w-full mb-3" />
        <input name="password" type="password" placeholder="Password" required className="border rounded-lg px-3 py-2 w-full mb-4" />
        <button className="bg-chili text-white w-full py-2.5 rounded-full font-medium">Log In</button>
      </form>
    </main>
  );
}
