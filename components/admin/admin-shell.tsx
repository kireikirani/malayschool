"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  GraduationCap,
  Megaphone,
  Images,
  FolderOpen,
  FileSpreadsheet,
  Settings,
  LogOut,
  BedDouble,
  Bell,
  FolderArchive,
  Layers3,
  PanelsTopLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Public Content",
    items: [
      { href: "/admin/content", label: "Public Content", icon: PanelsTopLeft },
      { href: "/admin/pengumuman", label: "Pengumuman", icon: Bell },
      { href: "/admin/news", label: "Berita", icon: Newspaper },
      { href: "/admin/gallery", label: "Galeri", icon: Images },
      { href: "/admin/advertisements", label: "Iklan", icon: Megaphone },
    ],
  },
  {
    label: "Media & Files",
    items: [
      { href: "/admin/media", label: "Media", icon: FolderOpen },
      { href: "/admin/documents", label: "Dokumen Sekolah", icon: FileSpreadsheet },
      { href: "/admin/unit-dokumen", label: "Dokumen Unit", icon: FolderArchive },
    ],
  },
  {
    label: "Units",
    items: [
      { href: "/admin/units", label: "Unit Sections", icon: Layers3 },
      { href: "/admin/teachers", label: "Guru", icon: GraduationCap },
    ],
  },
  {
    label: "School Data",
    items: [
      { href: "/admin/asrama-pelajar", label: "Pelajar Asrama", icon: BedDouble },
      { href: "/admin/settings", label: "Tetapan Laman", icon: Settings },
    ],
  },
] as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <span className="px-2 text-sm font-semibold">Sekolah CMS</span>
        </SidebarHeader>
        <SidebarContent>
          {NAV_GROUPS.map((group) => (
            <SidebarGroup key={group.label}>
              <div className="px-2 pb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {group.label}
              </div>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-sidebar-accent">
              <Avatar className="size-7">
                <AvatarFallback>{initials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
