"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface DashboardShellProps {
  children: React.ReactNode;
  user?: {
    email?: string | null;
  };
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <SidebarProvider>
      <AppSidebar user={user} onSignOut={handleSignOut} />
      <SidebarInset className="flex flex-col bg-background">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
