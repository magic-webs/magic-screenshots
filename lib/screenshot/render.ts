import type { DesignColors, Platform, TemplateId } from "./config";
import { deviceHeight, drawDevice } from "./devices";

type Ctx = CanvasRenderingContext2D;

export type RenderInput = {
  width: number;
  height: number;
  platform: Platform;
  template: TemplateId;
  colors: DesignColors;
  headline: string;
  subheadline: string;
  image: HTMLImageElement | ImageBitmap | null;
  fontFamily: string;
};

// ---------- color helpers ----------

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function mix(hexA: string, hexB: string, t: number) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${c(a.r, b.r)},${c(a.g, b.g)},${c(a.b, b.b)})`;
}

// ---------- text helpers ----------

function wrapLines(ctx: Ctx, text: string, maxWidth: number, maxLines: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth || !line) {
      line = test;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    kept[maxLines - 1] = `${last.trimEnd()}…`;
    return kept;
  }
  return lines;
}

type TextOpts = {
  x: number;
  y: number;
  maxWidth: number;
  size: number;
  weight: number;
  color: string;
  align: CanvasTextAlign;
  lineHeight: number;
  maxLines: number;
  font: string;
  letterSpacing?: number;
};

/** Draws wrapped text from the top `y`. Returns the y below the last line. */
function drawText(ctx: Ctx, text: string, o: TextOpts) {
  if (!text.trim()) return o.y;
  ctx.save();
  ctx.font = `${o.weight} ${o.size}px ${o.font}`;
  ctx.fillStyle = o.color;
  ctx.textAlign = o.align;
  ctx.textBaseline = "top";
  if ("letterSpacing" in ctx && o.letterSpacing !== undefined) {
    (ctx as Ctx & { letterSpacing: string }).letterSpacing = `${o.letterSpacing}px`;
  }
  const lines = wrapLines(ctx, text, o.maxWidth, o.maxLines);
  const step = o.size * o.lineHeight;
  lines.forEach((l, i) => ctx.fillText(l, o.x, o.y + i * step));
  ctx.restore();
  return o.y + lines.length * step;
}

// ---------- templates ----------

type Layout = (ctx: Ctx, input: RenderInput) => void;

function headlineBlock(
  ctx: Ctx,
  input: RenderInput,
  opts: {
    top: number;
    align: CanvasTextAlign;
    x: number;
    maxWidth: number;
    headlineSize: number;
    headlineColor: string;
    subColor: string;
    weight?: number;
    headlineLines?: number;
  },
) {
  const { width: W } = input;
  let y = drawText(ctx, input.headline, {
    x: opts.x,
    y: opts.top,
    maxWidth: opts.maxWidth,
    size: opts.headlineSize,
    weight: opts.weight ?? 800,
    color: opts.headlineColor,
    align: opts.align,
    lineHeight: 1.1,
    maxLines: opts.headlineLines ?? 2,
    font: input.fontFamily,
    letterSpacing: -opts.headlineSize * 0.02,
  });
  y += W * 0.025;
  y = drawText(ctx, input.subheadline, {
    x: opts.x,
    y,
    maxWidth: opts.maxWidth,
    size: W * 0.042,
    weight: 500,
    color: opts.subColor,
    align: opts.align,
    lineHeight: 1.35,
    maxLines: 2,
    font: input.fontFamily,
  });
  return y;
}

const classic: Layout = (ctx, input) => {
  const { width: W, height: H, colors } = input;
  const bg = ctx.createLinearGradient(0, 0, W * 0.4, H);
  bg.addColorStop(0, colors.primary);
  bg.addColorStop(1, colors.secondary);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const textBottom = headlineBlock(ctx, input, {
    top: H * 0.065,
    align: "center",
    x: W / 2,
    maxWidth: W * 0.84,
    headlineSize: W * 0.082,
    headlineColor: colors.text,
    subColor: rgba(colorToHex(colors.text), 0.85),
  });

  const regionTop = Math.max(textBottom + H * 0.04, H * 0.27);
  const place = placeDevice(input, { regionTop, regionBottom: H * 0.97, maxWidth: W * 0.82 });
  drawDevice(ctx, { platform: input.platform, cx: W / 2, ...place, image: input.image });
};

/** Vertical extent of a device of width `w`, including any rotation. */
function deviceExtent(input: RenderInput, w: number, rotation = 0) {
  const rad = (Math.abs(rotation) * Math.PI) / 180;
  const h = deviceHeight(input.platform, w);
  return h * Math.cos(rad) + w * Math.sin(rad);
}

/**
 * Sizes and positions a device so its whole frame fits between `regionTop`
 * and `regionBottom`. Returns the `top`/`width` to pass to `drawDevice`.
 */
function placeDevice(
  input: RenderInput,
  opts: { regionTop: number; regionBottom: number; maxWidth: number; rotation?: number; anchor?: "top" | "bottom" },
) {
  const { regionTop, regionBottom, maxWidth, rotation = 0, anchor = "top" } = opts;
  const perWidth = deviceExtent(input, 1, rotation);
  const width = Math.min(maxWidth, Math.max(0, regionBottom - regionTop) / perWidth);
  const extent = width * perWidth;
  const center = anchor === "top" ? regionTop + extent / 2 : regionBottom - extent / 2;
  return { width, top: center - deviceHeight(input.platform, width) / 2 };
}

const bold: Layout = (ctx, input) => {
  const { width: W, height: H, colors } = input;
  ctx.fillStyle = colors.primary;
  ctx.fillRect(0, 0, W, H);

  // Big decorative circles.
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.arc(W * 1.05, H * 0.62, W * 0.72, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(colorToHex(colors.text), 0.08);
  ctx.beginPath();
  ctx.arc(-W * 0.1, H * 0.02, W * 0.38, 0, Math.PI * 2);
  ctx.fill();

  const textBottom = headlineBlock(ctx, input, {
    top: H * 0.07,
    align: "left",
    x: W * 0.08,
    maxWidth: W * 0.84,
    headlineSize: W * 0.11,
    headlineColor: colors.text,
    subColor: rgba(colorToHex(colors.text), 0.85),
    weight: 900,
    headlineLines: 3,
  });

  const regionTop = Math.max(textBottom + H * 0.05, H * 0.3);
  const place = placeDevice(input, { regionTop, regionBottom: H * 0.97, maxWidth: W * 0.7, rotation: 7 });
  drawDevice(ctx, {
    platform: input.platform,
    cx: W * 0.56,
    ...place,
    image: input.image,
    rotation: 7,
  });
};

const minimal: Layout = (ctx, input) => {
  const { width: W, height: H, colors } = input;
  ctx.fillStyle = mix(colors.primary, "#ffffff", 0.93);
  ctx.fillRect(0, 0, W, H);

  // Accent bar.
  const barW = W * 0.12;
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.roundRect(W / 2 - barW / 2, H * 0.06, barW, W * 0.014, W * 0.007);
  ctx.fill();

  const textBottom = headlineBlock(ctx, input, {
    top: H * 0.06 + W * 0.05,
    align: "center",
    x: W / 2,
    maxWidth: W * 0.84,
    headlineSize: W * 0.078,
    headlineColor: "#0f172a",
    subColor: "#475569",
  });

  const regionTop = Math.max(textBottom + H * 0.04, H * 0.27);
  const place = placeDevice(input, { regionTop, regionBottom: H * 0.97, maxWidth: W * 0.8 });
  drawDevice(ctx, { platform: input.platform, cx: W / 2, ...place, image: input.image });
};

const spotlight: Layout = (ctx, input) => {
  const { width: W, height: H, colors } = input;
  ctx.fillStyle = "#07070c";
  ctx.fillRect(0, 0, W, H);

  const glowY = H * 0.62;
  const glow = ctx.createRadialGradient(W / 2, glowY, 0, W / 2, glowY, W * 0.85);
  glow.addColorStop(0, rgba(colors.primary, 0.75));
  glow.addColorStop(0.5, rgba(colors.primary, 0.2));
  glow.addColorStop(1, rgba(colors.primary, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const glow2 = ctx.createRadialGradient(W * 0.9, H, 0, W * 0.9, H, W * 0.7);
  glow2.addColorStop(0, rgba(colors.secondary, 0.55));
  glow2.addColorStop(1, rgba(colors.secondary, 0));
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  const textBottom = headlineBlock(ctx, input, {
    top: H * 0.065,
    align: "center",
    x: W / 2,
    maxWidth: W * 0.84,
    headlineSize: W * 0.082,
    headlineColor: "#ffffff",
    subColor: mix(colors.secondary, "#ffffff", 0.35),
  });

  const regionTop = Math.max(textBottom + H * 0.045, H * 0.28);
  const place = placeDevice(input, { regionTop, regionBottom: H * 0.97, maxWidth: W * 0.78 });
  drawDevice(ctx, { platform: input.platform, cx: W / 2, ...place, image: input.image });
};

const split: Layout = (ctx, input) => {
  const { width: W, height: H, colors } = input;
  const bg = ctx.createLinearGradient(W, 0, 0, H);
  bg.addColorStop(0, colors.secondary);
  bg.addColorStop(1, colors.primary);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Soft wave behind the copy.
  ctx.fillStyle = rgba("#000000", 0.12);
  ctx.beginPath();
  ctx.moveTo(0, H * 0.7);
  ctx.quadraticCurveTo(W * 0.5, H * 0.64, W, H * 0.7);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  const place = placeDevice(input, { regionTop: H * 0.03, regionBottom: H * 0.68, maxWidth: W * 0.74, anchor: "bottom" });
  drawDevice(ctx, { platform: input.platform, cx: W / 2, ...place, image: input.image });

  headlineBlock(ctx, input, {
    top: H * 0.74,
    align: "center",
    x: W / 2,
    maxWidth: W * 0.84,
    headlineSize: W * 0.08,
    headlineColor: colors.text,
    subColor: rgba(colorToHex(colors.text), 0.85),
  });
};

function colorToHex(color: string) {
  return /^#[0-9a-f]{6}$/i.test(color) ? color : "#ffffff";
}

const LAYOUTS: Record<TemplateId, Layout> = { classic, bold, minimal, spotlight, split };

/**
 * Renders a store screenshot. `scale` lets previews draw at a fraction of the
 * export size while keeping every layout measurement in export pixels.
 */
export function renderScreenshot(canvas: HTMLCanvasElement, input: RenderInput, scale = 1) {
  canvas.width = Math.round(input.width * scale);
  canvas.height = Math.round(input.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.imageSmoothingQuality = "high";
  LAYOUTS[input.template](ctx, input);
}
