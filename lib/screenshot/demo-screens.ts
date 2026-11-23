/**
 * Draws a few believable, minimal app screens for the landing-page showcase,
 * so the store screenshots we render there have real content inside the frame.
 * Real words only where the eye lands; quiet bars everywhere else.
 */

type Ctx = CanvasRenderingContext2D;

export type DemoScreenKind = "rings" | "finance" | "calm" | "tasks" | "travel";

const W = 600;
const H = 1300;

function bar(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fill();
}

function card(ctx: Ctx, x: number, y: number, w: number, h: number, color: string, r = 28) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function text(ctx: Ctx, value: string, x: number, y: number, size: number, weight: number, color: string, font: string) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.fillText(value, x, y);
}

function header(ctx: Ctx, title: string, font: string, fg: string, muted: string) {
  bar(ctx, 40, 130, 120, 14, muted);
  text(ctx, title, 40, 220, 58, 800, fg, font);
}

function drawRings(ctx: Ctx, font: string) {
  ctx.fillStyle = "#0b0b12";
  ctx.fillRect(0, 0, W, H);
  header(ctx, "Today", font, "#ffffff", "#2a2a36");
  const cx = W / 2;
  const cy = 520;
  const rings = [
    { r: 190, color: "#2dd4bf", p: 0.82 },
    { r: 140, color: "#38bdf8", p: 0.64 },
    { r: 90, color: "#a3e635", p: 0.93 },
  ];
  ctx.lineCap = "round";
  ctx.lineWidth = 38;
  for (const ring of rings) {
    ctx.strokeStyle = "#1c1c26";
    ctx.beginPath();
    ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = ring.color;
    ctx.beginPath();
    ctx.arc(cx, cy, ring.r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring.p);
    ctx.stroke();
  }
  const stats = [
    { label: "Move", value: "612", color: "#2dd4bf" },
    { label: "Steps", value: "8,204", color: "#38bdf8" },
  ];
  stats.forEach((s, i) => {
    const x = 40 + i * 270;
    card(ctx, x, 790, 250, 190, "#16161f");
    text(ctx, s.label, x + 28, 850, 28, 600, s.color, font);
    text(ctx, s.value, x + 28, 925, 52, 800, "#ffffff", font);
  });
  card(ctx, 40, 1010, 520, 150, "#16161f");
  for (let i = 0; i < 12; i++) {
    const h = 30 + ((i * 37) % 70);
    bar(ctx, 76 + i * 38, 1130 - h, 18, h, i === 8 ? "#2dd4bf" : "#2a2a36");
  }
}

function drawFinance(ctx: Ctx, font: string) {
  ctx.fillStyle = "#f6f7f5";
  ctx.fillRect(0, 0, W, H);
  header(ctx, "Balance", font, "#0f172a", "#dfe3dc");
  card(ctx, 40, 270, 520, 300, "#059669", 36);
  text(ctx, "Available", 76, 340, 28, 600, "rgba(255,255,255,0.75)", font);
  text(ctx, "$12,480", 76, 430, 76, 800, "#ffffff", font);
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 6;
  ctx.lineJoin = "round";
  ctx.beginPath();
  const pts = [0, 30, 18, 46, 30, 22, 52, 40, 70];
  pts.forEach((p, i) => {
    const x = 76 + i * 56;
    const y = 540 - p;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  const rows = ["#84cc16", "#f59e0b", "#06b6d4", "#f43f5e", "#8b5cf6"];
  rows.forEach((c, i) => {
    const y = 620 + i * 120;
    card(ctx, 40, y, 520, 100, "#ffffff", 24);
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(96, y + 50, 26, 0, Math.PI * 2);
    ctx.fill();
    bar(ctx, 140, y + 32, 160 - i * 12, 14, "#d4d8d0");
    bar(ctx, 140, y + 58, 90, 12, "#e8ebe5");
    bar(ctx, 440, y + 42, 88, 16, "#cfd4cb");
  });
}

function drawCalm(ctx: Ctx, font: string) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#fff1e6");
  g.addColorStop(1, "#ffd9cc");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  header(ctx, "Breathe", font, "#3b1d14", "rgba(59,29,20,0.12)");
  const cx = W / 2;
  const cy = 560;
  [250, 200, 150].forEach((r, i) => {
    ctx.fillStyle = `rgba(244,63,94,${0.1 + i * 0.12})`;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.textAlign = "center";
  text(ctx, "5:00", cx, cy + 30, 92, 800, "#ffffff", font);
  ctx.textAlign = "left";
  card(ctx, cx - 70, 900, 140, 140, "#f43f5e", 70);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(cx - 18, 940);
  ctx.lineTo(cx + 32, 970);
  ctx.lineTo(cx - 18, 1000);
  ctx.closePath();
  ctx.fill();
  [0, 1, 2].forEach((i) => {
    card(ctx, 40 + i * 180, 1110, 160, 64, "rgba(255,255,255,0.6)", 32);
    bar(ctx, 76 + i * 180, 1136, 88, 12, "rgba(59,29,20,0.18)");
  });
}

function drawTasks(ctx: Ctx, font: string) {
  ctx.fillStyle = "#faf8ff";
  ctx.fillRect(0, 0, W, H);
  header(ctx, "Today", font, "#1e1033", "#e9e2f7");
  card(ctx, 40, 260, 520, 60, "#efe9fb", 30);
  card(ctx, 44, 264, 300, 52, "#7c3aed", 26);
  const tasks = [
    { label: "Design review", done: true },
    { label: "Ship v2.4", done: false },
    { label: null, done: true },
    { label: null, done: false },
    { label: null, done: false },
    { label: null, done: false },
  ];
  tasks.forEach((t, i) => {
    const y = 360 + i * 130;
    card(ctx, 40, y, 520, 110, "#ffffff", 26);
    ctx.lineWidth = 5;
    if (t.done) {
      card(ctx, 72, y + 33, 44, 44, "#ec4899", 14);
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(83, y + 56);
      ctx.lineTo(92, y + 65);
      ctx.lineTo(106, y + 46);
      ctx.stroke();
    } else {
      ctx.strokeStyle = "#d6cbea";
      ctx.beginPath();
      ctx.roundRect(74, y + 35, 40, 40, 12);
      ctx.stroke();
    }
    if (t.label) text(ctx, t.label, 140, y + 66, 32, 700, t.done ? "#a596bf" : "#1e1033", font);
    else bar(ctx, 140, y + 48, 200 + ((i * 53) % 120), 16, "#ebe5f5");
  });
}

function drawTravel(ctx: Ctx, font: string) {
  ctx.fillStyle = "#f4f6fa";
  ctx.fillRect(0, 0, W, H);
  header(ctx, "Trips", font, "#0f172a", "#dde3ee");
  const g = ctx.createLinearGradient(40, 270, 560, 700);
  g.addColorStop(0, "#3b82f6");
  g.addColorStop(1, "#0f172a");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(40, 270, 520, 430, 36);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.beginPath();
  ctx.moveTo(40, 620);
  ctx.lineTo(220, 470);
  ctx.lineTo(330, 560);
  ctx.lineTo(430, 480);
  ctx.lineTo(560, 600);
  ctx.lineTo(560, 700);
  ctx.lineTo(40, 700);
  ctx.closePath();
  ctx.fill();
  text(ctx, "Lisbon", 76, 640, 56, 800, "#ffffff", font);
  bar(ctx, 76, 662, 160, 14, "rgba(255,255,255,0.5)");
  [0, 1, 2].forEach((i) => {
    const y = 740 + i * 140;
    card(ctx, 40, y, 520, 120, "#ffffff", 26);
    card(ctx, 64, y + 20, 80, 80, ["#bfdbfe", "#fde68a", "#bbf7d0"][i], 18);
    bar(ctx, 168, y + 40, 200, 16, "#d5dbe6");
    bar(ctx, 168, y + 70, 120, 12, "#e6eaf1");
  });
}

const DRAW: Record<DemoScreenKind, (ctx: Ctx, font: string) => void> = {
  rings: drawRings,
  finance: drawFinance,
  calm: drawCalm,
  tasks: drawTasks,
  travel: drawTravel,
};

/** Renders each kind to a PNG data URL (fetchable by `loadImage`). */
export async function renderDemoScreens(kinds: DemoScreenKind[], fontFamily: string) {
  try {
    await Promise.all([
      document.fonts.load(`800 40px ${fontFamily}`),
      document.fonts.load(`600 40px ${fontFamily}`),
    ]);
  } catch {
    // Fall back to whatever font is available.
  }
  return kinds.map((kind) => {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    DRAW[kind](ctx, fontFamily);
    return canvas.toDataURL("image/png");
  });
}
