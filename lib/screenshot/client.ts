import JSZip from "jszip";
import {
  EXPORT_TARGETS,
  type DesignColors,
  type ExportTarget,
  type TemplateId,
} from "./config";
import { renderScreenshot } from "./render";

const imageCache = new Map<string, Promise<ImageBitmap>>();

/**
 * Loads an image as an ImageBitmap via fetch so the canvas stays untainted
 * and can be exported with toBlob().
 */
export function loadImage(url: string) {
  let cached = imageCache.get(url);
  if (!cached) {
    cached = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load image (${res.status})`);
        return res.blob();
      })
      .then((blob) => createImageBitmap(blob));
    cached.catch(() => imageCache.delete(url));
    imageCache.set(url, cached);
  }
  return cached;
}

export function getFontFamily() {
  if (typeof document === "undefined") return "sans-serif";
  return getComputedStyle(document.body).fontFamily || "sans-serif";
}

export type ExportShot = {
  url: string | null;
  headline: string;
  subheadline: string;
};

export type ExportDesign = {
  template: TemplateId;
  colors: DesignColors;
};

export async function renderToBlob(
  target: ExportTarget,
  design: ExportDesign,
  shot: ExportShot,
): Promise<Blob> {
  const image = shot.url ? await loadImage(shot.url) : null;
  const canvas = document.createElement("canvas");
  renderScreenshot(canvas, {
    width: target.width,
    height: target.height,
    platform: target.platform,
    template: design.template,
    colors: design.colors,
    headline: shot.headline,
    subheadline: shot.subheadline,
    image,
    fontFamily: getFontFamily(),
  });
  return await new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Export failed"))),
      "image/png",
    ),
  );
}

export function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "app"
  );
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportZip(
  appName: string,
  design: ExportDesign,
  shots: ExportShot[],
  targets: ExportTarget[] = EXPORT_TARGETS,
  onProgress?: (done: number, total: number) => void,
) {
  await document.fonts.ready;
  const zip = new JSZip();
  const total = targets.length * shots.length;
  let done = 0;
  for (const target of targets) {
    for (let i = 0; i < shots.length; i++) {
      const blob = await renderToBlob(target, design, shots[i]);
      const name = `${String(i + 1).padStart(2, "0")}_${target.width}x${target.height}.png`;
      zip.file(`${target.folder}/${name}`, blob);
      done++;
      onProgress?.(done, total);
    }
  }
  const out = await zip.generateAsync({ type: "blob" });
  downloadBlob(out, `${slugify(appName)}-store-screenshots.zip`);
}
