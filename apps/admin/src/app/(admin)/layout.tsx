import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar user={session.user} />
      <main className="flex-1 ml-0 lg:ml-64 p-6">{children}</main>
    </div>
  );
}
