"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { LogOutIcon, UserIcon } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const { isAuthenticated } = useConvexAuth();
  const me = useQuery(api.users.me, isAuthenticated ? {} : "skip");
  const { signOut } = useAuthActions();
  if (!isAuthenticated) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
        <UserIcon className="size-4" />
        {me?.username ?? "Signed in"}
      </span>
      <Button variant="ghost" size="sm" onClick={() => void signOut()}>
        <LogOutIcon />
        Sign out
      </Button>
    </div>
  );
}
