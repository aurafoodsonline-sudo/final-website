import Link from "next/link";

export default function NotFound() {
  return (
    <main className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="font-heritage text-4xl mb-3 text-chili">404</h1>
      <p className="mb-6">Page Not Found — The page you're looking for doesn't exist or has been moved.</p>
      <Link href="/en" className="bg-chili text-white px-6 py-3 rounded-full">Back to Home</Link>
    </main>
  );
}
