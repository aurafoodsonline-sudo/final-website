import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminNav from "./AdminNav";
import FlashMessage from "./FlashMessage";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen md:flex">
      <AdminNav />
      <main className="flex-1 min-w-0 p-4 md:p-6 overflow-x-auto">
        <Suspense fallback={null}>
          <FlashMessage />
        </Suspense>
        {children}
      </main>
    </div>
  );
}
