import { AppShell } from "@/components/app-shell";

export function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string };
  children: React.ReactNode;
}) {
  return <AppShell user={user}>{children}</AppShell>;
}
