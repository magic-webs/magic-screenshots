import { generateText, Output } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { z } from "zod";

const MODEL = "anthropic/claude-haiku-5.5";

const requestSchema = z.object({
  appName: z.string().trim().min(1).max(80),
  description: z.string().max(500).default(""),
  tone: z.string().max(40).optional(),
  screenshots: z
    .array(z.object({ id: z.string().min(1), url: z.url() }))
    .min(1)
    .max(10),
});

const copySchema = z.object({
  items: z.array(
    z.object({
      index: z.number().int().describe("0-based index of the screenshot"),
      headline: z
        .string()
        .describe("Benefit-led headline, 2-5 words, max 32 characters, no trailing period"),
      subheadline: z
        .string()
        .describe("Supporting line, max 60 characters, plain language"),
    }),
  ),
});

/** Only allow image URLs served by this project's Convex deployment. */
function isAllowedImageUrl(raw: string) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return false;
  try {
    const url = new URL(raw);
    const allowed = new URL(convexUrl);
    return url.protocol === "https:" && url.host === allowed.host;
  } catch {
    return false;
  }
}

/** True when the request carries a Convex Auth token for a live session. */
async function isSignedIn(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!token || !convexUrl) return false;
  try {
    const client = new ConvexHttpClient(convexUrl);
    client.setAuth(token);
    return await client.query(api.auth.isAuthenticated, {});
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!(await isSignedIn(req))) {
    return Response.json({ error: "Sign in to generate captions" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const { appName, description, tone, screenshots } = parsed.data;

  if (!screenshots.every((s) => isAllowedImageUrl(s.url))) {
    return Response.json({ error: "Unsupported image URL" }, { status: 400 });
  }

  try {
    const { output } = await generateText({
      model: MODEL,
      output: Output.object({ schema: copySchema }),
      system:
        "You are an expert App Store Optimization copywriter. You write short, " +
        "punchy marketing captions that sit above app screenshots on the Apple " +
        "App Store and Google Play. Lead with user benefits, not features. Each " +
        "caption must be unique and describe what is actually visible in its " +
        "screenshot. Never invent features you cannot see or infer. Avoid " +
        "emojis, hashtags, superlatives like 'best' or '#1', and pricing claims.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `App name: ${appName}\n` +
                `App description: ${description || "(not provided)"}\n` +
                `Tone: ${tone || "confident and friendly"}\n\n` +
                `Below are ${screenshots.length} screenshots in store order. ` +
                "Write one headline and one subheadline for each, returning one item per screenshot with its 0-based index. " +
                "The first screenshot should communicate the core value of the app.",
            },
            ...screenshots.flatMap((s, i) => [
              { type: "text" as const, text: `Screenshot ${i}:` },
              { type: "file" as const, data: new URL(s.url), mediaType: "image" },
            ]),
          ],
        },
      ],
    });

    const items = screenshots.map((s, i) => {
      const match = output.items.find((item) => item.index === i) ?? output.items[i];
      return {
        id: s.id,
        headline: (match?.headline ?? "").slice(0, 80),
        subheadline: (match?.subheadline ?? "").slice(0, 140),
      };
    });

    return Response.json({ items });
  } catch (error) {
    console.error("generate-copy failed", error);
    return Response.json(
      { error: "AI copy generation failed. Check AI_GATEWAY_API_KEY and try again." },
      { status: 502 },
    );
  }
}
