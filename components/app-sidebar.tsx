"use client";

import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavGroup } from "@/components/nav-group";
import { footerNavLinks, navGroups, teacherNavGroups, guardNavGroups } from "@/components/app-shared";
import { SchoolLogo } from "@/components/public/school-logo";
import { SCHOOL_SHORT_NAME } from "@/lib/brand";

export function AppSidebar({ role }: { role?: string }) {
  const pathname = usePathname();

  const activeGroups =
    role === "teacher"
      ? teacherNavGroups
      : role === "guard"
      ? guardNavGroups
      : navGroups;

  const groupsWithActive = activeGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      isActive: !!item.path && (pathname === item.path || pathname.startsWith(`${item.path}/`)),
      subItems: item.subItems?.map((sub) => ({
        ...sub,
        isActive: !!sub.path && (pathname === sub.path || pathname.startsWith(`${sub.path}/`)),
      })),
    })),
  }));

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="h-14 justify-center">
        <SidebarMenuButton asChild className="gap-2.5">
          <a href={role === "teacher" ? "/teacher" : role === "guard" ? "/guard" : "/admin/dashboard"}>
            <SchoolLogo className="size-5 shrink-0" />
            <span className="font-semibold truncate">{SCHOOL_SHORT_NAME}</span>
          </a>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        {groupsWithActive.map((group, index) => (
          <NavGroup key={`sidebar-group-${index}`} {...group} />
        ))}
      </SidebarContent>
      {role !== "teacher" && (
        <SidebarFooter>
          <SidebarMenu>
            {footerNavLinks.map((item) => {
              const isActive = !!item.path && (pathname === item.path || pathname.startsWith(`${item.path}/`));
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="text-muted-foreground"
                    isActive={isActive}
                    size="sm"
                  >
                    <a href={item.path}>
                      {item.icon}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
