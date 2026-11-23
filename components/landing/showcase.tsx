"use client";

import { useEffect, useRef, useState } from "react";
import { ScreenshotPreview } from "@/components/screenshot-preview";
import { getFontFamily } from "@/lib/screenshot/client";
import {
  PREVIEW_TARGET,
  TEMPLATES,
  type DesignColors,
  type TemplateId,
} from "@/lib/screenshot/config";
import { renderDemoScreens, type DemoScreenKind } from "@/lib/screenshot/demo-screens";
import { cn } from "@/lib/utils";

type Shot = {
  template: TemplateId;
  screen: DemoScreenKind;
  colors: DesignColors;
  headline: string;
  subheadline: string;
};

// Visual order, left to right. The middle one leads.
const SHOTS: Shot[] = [
  {
    template: "minimal",
    screen: "tasks",
    colors: { primary: "#7c3aed", secondary: "#ec4899", text: "#ffffff" },
    headline: "Plan less, do more",
    subheadline: "Your day, in one calm list",
  },
  {
    template: "spotlight",
    screen: "finance",
    colors: { primary: "#059669", secondary: "#84cc16", text: "#ffffff" },
    headline: "Know where it goes",
    subheadline: "Every account, one balance",
  },
  {
    template: "classic",
    screen: "rings",
    colors: { primary: "#0f766e", secondary: "#2dd4bf", text: "#ffffff" },
    headline: "Close every ring",
    subheadline: "Daily goals that stick",
  },
  {
    template: "bold",
    screen: "calm",
    colors: { primary: "#f43f5e", secondary: "#f59e0b", text: "#ffffff" },
    headline: "Calm in five minutes",
    subheadline: "Guided breathing, anywhere",
  },
  {
    template: "split",
    screen: "travel",
    colors: { primary: "#0f172a", secondary: "#3b82f6", text: "#ffffff" },
    headline: "Trips, sorted",
    subheadline: "Bookings and plans together",
  },
];

// Distance from the center decides size and entrance delay. Delays shrink as
// they travel outward so the group reads as one wave, not a queue.
const SIZE = ["w-[min(56vw,248px)]", "w-[min(44vw,204px)]", "w-[min(36vw,172px)]"];
const DELAY = [0, 90, 150];

export function Showcase() {
  const [screens, setScreens] = useState<string[] | null>(null);
  // The group rises only once every canvas has drawn, so no shot enters as an
  // empty gray box and pops its content in mid-flight.
  const [ready, setReady] = useState(false);
  const drawn = useRef(new Set<number>());

  useEffect(() => {
    if (!screens) return;
    // Never leave the shots invisible if a draw fails.
    const fallback = setTimeout(() => setReady(true), 1500);
    return () => clearTimeout(fallback);
  }, [screens]);

  function markDrawn(i: number) {
    drawn.current.add(i);
    if (drawn.current.size === SHOTS.length) setReady(true);
  }

  useEffect(() => {
    let cancelled = false;
    void renderDemoScreens(
      SHOTS.map((s) => s.screen),
      getFontFamily(),
    ).then((urls) => {
      if (!cancelled) setScreens(urls);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const center = Math.floor(SHOTS.length / 2);

  return (
    <section aria-label="Example store screenshots" className="mt-14 sm:mt-20">
      {/* Outer shots run off the edges on narrow screens; the crop is intentional. */}
      <div className="overflow-hidden pt-4 pb-16">
        {/* Reserve the tallest shot's height so nothing jumps when canvases mount. */}
        <div className="flex min-h-[calc(min(56vw,248px)*2.173+2rem)] items-end justify-center gap-2 px-4 sm:gap-4">
          {screens &&
            SHOTS.map((shot, i) => {
              const offset = i - center;
              const distance = Math.abs(offset);
              const template = TEMPLATES.find((t) => t.id === shot.template);
              return (
                <figure
                  key={shot.template}
                  className={cn(
                    "fan-item flex shrink-0 flex-col items-center gap-3",
                    ready ? "fan-in" : "opacity-0",
                    distance === 0 && "z-10",
                    SIZE[distance],
                  )}
                  style={
                    {
                      // Resting pose: a gentle arc. Side shots tilt outward and sit lower.
                      "--fan-r": `${Math.sign(offset) * [0, 4, 8][distance]}deg`,
                      "--fan-y": `${[0, 14, 40][distance]}px`,
                      "--rise-delay": `${DELAY[distance]}ms`,
                    } as React.CSSProperties
                  }
                >
                  <div className="relative overflow-hidden rounded-[clamp(14px,3vw,22px)] shadow-[0_1px_2px_rgb(0_0_0/0.06),0_18px_40px_-12px_rgb(0_0_0/0.28)] ring-1 ring-black/5">
                    <ScreenshotPreview
                      target={PREVIEW_TARGET.ios}
                      template={shot.template}
                      colors={shot.colors}
                      headline={shot.headline}
                      subheadline={shot.subheadline}
                      imageUrl={screens[i] || null}
                      pixelWidth={distance === 0 ? 560 : 440}
                      onRendered={() => markDrawn(i)}
                    />
                    {/* One gloss sweep across the lead shot once the fan has settled. */}
                    {distance === 0 && ready && <span aria-hidden className="fan-sheen" />}
                  </div>
                  <figcaption className="text-xs font-medium text-muted-foreground">
                    {template?.name ?? shot.template}
                  </figcaption>
                </figure>
              );
            })}
        </div>
      </div>
    </section>
  );
}
