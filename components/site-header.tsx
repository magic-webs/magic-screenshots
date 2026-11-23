import Link from "next/link";
import type { ReactNode } from "react";
import { UserMenu } from "@/components/auth/user-menu";
import { BRAND_NAME, Logo } from "@/components/brand/logo";

export function SiteHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-[max(1rem,env(safe-area-inset-left))]">
        <Link href="/" aria-label={`${BRAND_NAME} home`} className="rounded-md">
          <Logo className="[&>span:last-child]:hidden sm:[&>span:last-child]:inline" />
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {children}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
