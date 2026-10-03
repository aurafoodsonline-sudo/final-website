import "../globals.css";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="bg-cream text-cinnamon font-sans">{children}</body>
    </html>
  );
}
