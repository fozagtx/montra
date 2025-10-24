import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboardSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <SidebarProvider>
      <DashboardSidebar user={user} />
      <SidebarInset className="bg-gradient-to-b from-[#FFFFFF] to-[#F8FAFC] min-h-screen">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
