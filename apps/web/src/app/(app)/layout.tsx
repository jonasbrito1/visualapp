import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppNavbar } from "@/components/layout/app-navbar";
import { AppBottomNav } from "@/components/layout/app-bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNavbar user={session.user} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <AppBottomNav />
    </div>
  );
}
