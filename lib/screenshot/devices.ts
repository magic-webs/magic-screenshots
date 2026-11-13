import type { Platform } from "./config";

type Ctx = CanvasRenderingContext2D;

type DeviceSpec = {
  /** body height / body width */
  aspect: number;
  /** outer corner radius, fraction of width */
  radius: number;
  /** bezel thickness (frame + black border), fraction of width */
  bezel: number;
  /** metal rim thickness, fraction of width */
  rim: number;
};

const SPECS: Record<Platform, DeviceSpec> = {
  ios: { aspect: 2.08, radius: 0.165, bezel: 0.042, rim: 0.012 },
  android: { aspect: 2.1, radius: 0.115, bezel: 0.034, rim: 0.01 },
};

export function deviceHeight(platform: Platform, width: number) {
  return width * SPECS[platform].aspect;
}

/** Draw `img` so it covers the rect, anchored to the top (status bar stays visible). */
function drawCover(ctx: Ctx, img: CanvasImageSource & { width: number; height: number }, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y, dw, dh);
}

function drawPlaceholder(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, "#e5e7eb");
  g.addColorStop(1, "#cbd5e1");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "rgba(15,23,42,0.45)";
  ctx.font = `600 ${w * 0.06}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Your screenshot", x + w / 2, y + h / 2);
}

function sideButton(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, w / 2);
  ctx.fill();
}

export type DrawDeviceOptions = {
  platform: Platform;
  /** center x of the device */
  cx: number;
  /** top y of the device (before rotation) */
  top: number;
  width: number;
  image: HTMLImageElement | ImageBitmap | null;
  /** rotation in degrees around the device center */
  rotation?: number;
  shadow?: boolean;
};

export function drawDevice(ctx: Ctx, opts: DrawDeviceOptions) {
  const { platform, cx, top, width: w, image, rotation = 0, shadow = true } = opts;
  const spec = SPECS[platform];
  const h = w * spec.aspect;
  const x = -w / 2;
  const y = -h / 2;
  const r = w * spec.radius;
  const rim = w * spec.rim;
  const bezel = w * spec.bezel;

  ctx.save();
  ctx.translate(cx, top + h / 2);
  ctx.rotate((rotation * Math.PI) / 180);

  const isIOS = platform === "ios";
  const metalDark = isIOS ? "#2c2c2e" : "#1f2124";
  const metalLight = isIOS ? "#8e8e93" : "#4a4d52";

  // Side buttons (drawn behind the body).
  const btnW = w * 0.014;
  if (isIOS) {
    sideButton(ctx, x - btnW * 0.7, y + h * 0.17, btnW, h * 0.035, metalDark);
    sideButton(ctx, x - btnW * 0.7, y + h * 0.23, btnW, h * 0.07, metalDark);
    sideButton(ctx, x - btnW * 0.7, y + h * 0.32, btnW, h * 0.07, metalDark);
    sideButton(ctx, x + w - btnW * 0.3, y + h * 0.25, btnW, h * 0.11, metalDark);
  } else {
    sideButton(ctx, x + w - btnW * 0.3, y + h * 0.2, btnW, h * 0.07, metalDark);
    sideButton(ctx, x + w - btnW * 0.3, y + h * 0.31, btnW, h * 0.12, metalDark);
  }

  // Body with metallic rim + drop shadow.
  ctx.save();
  if (shadow) {
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = w * 0.09;
    ctx.shadowOffsetY = w * 0.04;
  }
  const metal = ctx.createLinearGradient(x, y, x + w, y + h);
  metal.addColorStop(0, metalLight);
  metal.addColorStop(0.25, metalDark);
  metal.addColorStop(0.75, metalDark);
  metal.addColorStop(1, metalLight);
  ctx.fillStyle = metal;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
  ctx.restore();

  // Black bezel.
  ctx.fillStyle = "#050505";
  ctx.beginPath();
  ctx.roundRect(x + rim, y + rim, w - rim * 2, h - rim * 2, r - rim);
  ctx.fill();

  // Screen.
  const sx = x + bezel;
  const sy = y + bezel;
  const sw = w - bezel * 2;
  const sh = h - bezel * 2;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(sx, sy, sw, sh, Math.max(r - bezel, 0));
  ctx.clip();
  if (image) drawCover(ctx, image, sx, sy, sw, sh);
  else drawPlaceholder(ctx, sx, sy, sw, sh);
  ctx.restore();

  // Camera cut-outs.
  ctx.fillStyle = "#000";
  if (isIOS) {
    const iw = sw * 0.3;
    const ih = sw * 0.088;
    ctx.beginPath();
    ctx.roundRect(-iw / 2, sy + sw * 0.035, iw, ih, ih / 2);
    ctx.fill();
  } else {
    const cr = sw * 0.032;
    ctx.beginPath();
    ctx.arc(0, sy + sw * 0.06, cr, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(60,70,90,0.6)";
    ctx.beginPath();
    ctx.arc(0, sy + sw * 0.06, cr * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
  return { height: h };
}
