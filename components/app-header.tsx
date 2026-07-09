"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { CustomSidebarTrigger } from "@/components/custom-sidebar-trigger";
import { NavUser } from "@/components/nav-user";
import { navLinks } from "@/components/app-shared";

export function AppHeader({ user }: { user: { name: string; email: string; role?: string } }) {
  const pathname = usePathname();

  const activeItem = navLinks.find(
    (item) => item.path && (pathname === item.path || pathname.startsWith(`${item.path}/`))
  );

  return (
    <header className="mb-6 flex items-center justify-between gap-2 md:px-2">
      <div className="flex items-center gap-3">
        <CustomSidebarTrigger />
        <Separator
          className="mr-2 h-4 data-[orientation=vertical]:self-center"
          orientation="vertical"
        />
        <AppBreadcrumbs page={activeItem ?? null} />
      </div>
      <div className="flex items-center gap-3">
        <NavUser user={user} />
      </div>
    </header>
  );
}
