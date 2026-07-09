"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOutIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function NavUser({ user }: { user: { name: string; email: string; role?: string } }) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-8 cursor-pointer">
          <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem className="flex items-center justify-start gap-2 pointer-events-none">
          <DropdownMenuLabel className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium text-foreground">{user.name}</span>
              <br />
              <div className="max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-muted-foreground text-xs">
                {user.email}
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                {user.role === "admin" ? "Administrator" : user.role === "teacher" ? "Guru" : "Pengunjung"}
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="w-full cursor-pointer"
            variant="destructive"
            onClick={handleSignOut}
          >
            <LogOutIcon />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
