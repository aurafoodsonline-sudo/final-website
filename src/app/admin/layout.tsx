import "../globals.css";

export const metadata = { robots: { index: false, follow: false } };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="bg-cream text-cinnamon font-sans">{children}</body>
    </html>
  );
}
