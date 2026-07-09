import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "teacher") {
    redirect("/login");
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    role: "teacher",
  };

  return <AppShell user={user}>{children}</AppShell>;
}
