import { useId } from "react";
import { cn } from "@/lib/utils";

export const BRAND_NAME = "Magic Screenshots";

/**
 * The mark: a rounded "M" drawn as one stroke on a teal tile. A single bold
 * shape stays legible from a 16px favicon up to an app icon.
 */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  const id = useId();
  const tile = `${id}-tile`;
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-7 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={tile} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14B8A6" />
          <stop offset="1" stopColor="#0F766E" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${tile})`} />
      <path
        d="M7 24V10.5a2.5 2.5 0 0 1 4.6-1.4L16 15.6l4.4-6.5A2.5 2.5 0 0 1 25 10.5V24"
        stroke="#fff"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className, showName = true }: { className?: string; showName?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark />
      {showName && (
        <span className="text-[0.95rem] font-semibold tracking-[-0.01em]">{BRAND_NAME}</span>
      )}
    </span>
  );
}
