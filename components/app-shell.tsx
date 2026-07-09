import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role?: string };
}) {
  return (
    <TooltipProvider>
      <SidebarProvider className="h-screen overflow-hidden">
        <AppSidebar role={user.role} />
        <SidebarInset className="flex h-screen flex-col overflow-hidden">
          <div className="shrink-0 border-b px-4 py-3">
            <AppHeader user={user} />
          </div>
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
