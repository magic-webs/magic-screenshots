"use client";

import { useConvexAuth } from "convex/react";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SignInCard } from "@/components/auth/sign-in-card";

/** Renders children only for signed-in users; otherwise shows the sign-in card. */
export function AuthGate({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: ReactNode;
}) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  if (isLoading) return fallback;
  if (isAuthenticated) return children;
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <SignInCard />
        </div>
      </main>
    </>
  );
}
