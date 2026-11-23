"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { DesignColors, ExportTarget, TemplateId } from "@/lib/screenshot/config";
import { getFontFamily, loadImage } from "@/lib/screenshot/client";
import { renderScreenshot } from "@/lib/screenshot/render";

type Props = {
  target: ExportTarget;
  template: TemplateId;
  colors: DesignColors;
  headline: string;
  subheadline: string;
  imageUrl: string | null;
  /** Rendered pixel width of the backing canvas. */
  pixelWidth?: number;
  className?: string;
  /** Called after each completed draw. */
  onRendered?: () => void;
};

export function ScreenshotPreview({
  target,
  template,
  colors,
  headline,
  subheadline,
  imageUrl,
  pixelWidth = 480,
  className,
  onRendered,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Kept in a ref so an inline callback doesn't retrigger the draw effect.
  const onRenderedRef = useRef(onRendered);
  useEffect(() => {
    onRenderedRef.current = onRendered;
  });

  useEffect(() => {
    let cancelled = false;
    const draw = async () => {
      const fontFamily = getFontFamily();
      let image: ImageBitmap | null = null;
      try {
        await Promise.all([
          document.fonts.load(`800 40px ${fontFamily}`),
          document.fonts.load(`500 40px ${fontFamily}`),
        ]);
      } catch {
        // Fall back to whatever font is available.
      }
      if (imageUrl) {
        try {
          image = await loadImage(imageUrl);
        } catch {
          image = null;
        }
      }
      const canvas = canvasRef.current;
      if (cancelled || !canvas) return;
      renderScreenshot(
        canvas,
        {
          width: target.width,
          height: target.height,
          platform: target.platform,
          template,
          colors,
          headline,
          subheadline,
          image,
          fontFamily,
        },
        pixelWidth / target.width,
      );
      onRenderedRef.current?.();
    };
    void draw();
    return () => {
      cancelled = true;
    };
  }, [target, template, colors, headline, subheadline, imageUrl, pixelWidth]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("block h-auto w-full bg-muted", className)}
      style={{ aspectRatio: `${target.width} / ${target.height}` }}
      aria-label={`${target.store} screenshot preview: ${headline}`}
      role="img"
    />
  );
}
