# Magicwebs Screenshots

Upload raw app screenshots and export store-ready **App Store** and **Google Play** images with iPhone/Android device frames, 5 templates and AI-written captions.

## Stack

- **Next.js 16** (App Router, Cache Components)
- **shadcn/ui** (base-ui) for all platform UI
- **Convex** for the database and file storage
- **Vercel AI SDK v7 + AI Gateway** with `anthropic/claude-haiku-5.5` for captions

## Features

- Projects scoped to the visitor's browser (anonymous owner key)
- Upload up to 10 screenshots (PNG/JPG/WebP, ≤ 10 MB) to Convex storage
- 5 templates: **Classic, Bold, Minimal, Spotlight, Split**
- Device frames drawn on canvas: **iPhone** (Dynamic Island) and **Android** (punch-hole)
- Brand colors with presets, live previews, reorder, per-image PNG download
- **AI captions**: Claude Haiku looks at each screenshot and writes a headline and subheadline
- **Export ZIP** at store sizes:
  - `app-store/iphone-6.9/` 1320×2868
  - `app-store/iphone-6.5/` 1242×2688
  - `google-play/phone/` 1080×1920

## Setup

```bash
bun install
cp .env.example .env.local   # fill in values
npx convex dev               # pushes Convex functions, writes CONVEX_* env vars
bun run dev
```

Set `AI_GATEWAY_API_KEY` in `.env.local` (create one in the Vercel dashboard → AI Gateway). On Vercel with OIDC enabled, no key is needed.

## Project layout

```
app/
  page.tsx                    Home: create and list projects
  projects/[id]/page.tsx      Editor route
  api/generate-copy/route.ts  AI caption generation (AI Gateway)
components/
  editor/                     Editor, design panel, cards, upload zone
  screenshot-preview.tsx      Canvas preview
lib/screenshot/
  config.ts                   Templates, export sizes
  devices.ts                  iPhone / Android frame drawing
  render.ts                   Template layouts
  client.ts                   Image loading, PNG / ZIP export
convex/
  schema.ts, projects.ts, screenshots.ts
```

## Contributing

See [AGENTS.md](AGENTS.md) for commit rules: one commit per logical change, conventional messages, and no AI co-author trailers.
