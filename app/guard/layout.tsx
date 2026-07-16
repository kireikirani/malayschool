import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export default async function GuardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || (session.user.role !== "guard" && session.user.role !== "admin")) {
    redirect("/login");
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };

  return <AppShell user={user}>{children}</AppShell>;
}
