"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";
import { api } from "@/convex/_generated/api";
import { ClaimAnonymousProjects } from "@/components/auth/claim-anonymous-projects";
import { Toaster } from "@/components/ui/toast";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const authApi = {
  refreshSession: api.auth.refreshSession,
  signOut: api.auth.signOut,
  isAuthenticated: api.auth.isAuthenticated,
};

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthProvider client={convex} api={authApi}>
      <Toaster>
        <ClaimAnonymousProjects />
        {children}
      </Toaster>
    </ConvexAuthProvider>
  );
}
