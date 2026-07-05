import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Newspaper,
  GraduationCap,
  Megaphone,
  Images,
  FolderOpen,
  FileSpreadsheet,
  Settings,
  BedDouble,
  Bell,
  FolderArchive,
  Layers3,
  PanelsTopLeft,
  Users,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export type SidebarNavItem = {
  title: string;
  path?: string;
  icon?: ReactNode;
  isActive?: boolean;
  subItems?: SidebarNavItem[];
};

export type SidebarNavGroup = {
  label: string;
  items: SidebarNavItem[];
};

export const navGroups: SidebarNavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard className="size-4" /> },
    ],
  },
  {
    label: "Public Content",
    items: [
      { title: "Public Content", path: "/admin/content", icon: <PanelsTopLeft className="size-4" /> },
      { title: "Pengumuman", path: "/admin/pengumuman", icon: <Bell className="size-4" /> },
      { title: "Berita", path: "/admin/news", icon: <Newspaper className="size-4" /> },
      { title: "Galeri", path: "/admin/gallery", icon: <Images className="size-4" /> },
      { title: "Iklan", path: "/admin/advertisements", icon: <Megaphone className="size-4" /> },
    ],
  },
  {
    label: "Media & Files",
    items: [
      { title: "Media", path: "/admin/media", icon: <FolderOpen className="size-4" /> },
      { title: "Dokumen Sekolah", path: "/admin/documents", icon: <FileSpreadsheet className="size-4" /> },
      { title: "Dokumen Unit", path: "/admin/unit-dokumen", icon: <FolderArchive className="size-4" /> },
    ],
  },
  {
    label: "Units",
    items: [
      { title: "Unit Sections", path: "/admin/units", icon: <Layers3 className="size-4" /> },
      { title: "Guru", path: "/admin/teachers", icon: <GraduationCap className="size-4" /> },
    ],
  },
  {
    label: "Asrama",
    items: [
      { title: "Pelajar Asrama", path: "/admin/asrama-pelajar", icon: <BedDouble className="size-4" /> },
      { title: "Warden Asrama", path: "/admin/asrama-warden", icon: <ShieldCheck className="size-4" /> },
      { title: "Fasiliti Asrama", path: "/admin/asrama-fasiliti", icon: <Sparkles className="size-4" /> },
    ],
  },
  {
    label: "Jawatankuasa",
    items: [
      { title: "Ahli JK", path: "/admin/unit-jk", icon: <Users className="size-4" /> },
    ],
  },
];

export const footerNavLinks: SidebarNavItem[] = [
  { title: "Tetapan Laman", path: "/admin/settings", icon: <Settings className="size-4" /> },
];

export const navLinks: SidebarNavItem[] = [
  ...navGroups.flatMap((group) =>
    group.items.flatMap((item) =>
      item.subItems?.length ? [item, ...item.subItems] : [item]
    )
  ),
  ...footerNavLinks,
];
