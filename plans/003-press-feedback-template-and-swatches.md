# 003 — Press feedback and smooth selection on template tiles and colour swatches

- **Status**: DONE (2026-11-23, mechanical checks passed; feel check pending)
- **Commit**: 53681a3 (plus uncommitted landing-page work in the tree; this plan depends on the `--ease-ui` token described below)
- **Severity**: MEDIUM
- **Category**: Physicality & origin
- **Estimated scope**: 1 file, 2 class edits

## Problem

In the editor's design panel, users click the template tiles and the colour-preset swatches many times per session. Neither responds to a press, and the selected state snaps on:

```tsx
// components/editor/design-panel.tsx:67-69 — current (template tile)
className={cn(
  "group relative flex flex-col gap-1 rounded-lg p-1 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
  active ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-muted",
```

```tsx
// components/editor/design-panel.tsx:106 — current (colour swatch)
className="size-8 rounded-full ring-offset-2 ring-offset-background outline-none hover:ring-2 hover:ring-ring focus-visible:ring-2 focus-visible:ring-ring"
```

There's no `transition` and no `:active` state. On touch, the user gets no confirmation until the canvas redraws. Every other pressable element in the app now shrinks slightly on press (see Repo conventions), so these two look inconsistent.

## Target

- **Press**: `transform: scale(0.98)` on `:active` for the tile and `scale(0.95)` for the 32px swatch (small targets need slightly more travel to read). Transform transition is **160ms** on `cubic-bezier(0.23, 1, 0.32, 1)` (the repo token `--ease-ui`).
- **Selection and hover**: `background-color` and `box-shadow` (Tailwind rings are box-shadows) transition over **150ms `ease`**, because they're colour changes.
- Hover styles stay on Tailwind's `hover:` variant. In Tailwind v4 it already compiles to `@media (hover: hover)`, so touch devices don't get stuck hover states.
- No reduced-motion branch is needed. A 2–5% press scale is feedback, not movement through space, and stays.

## Repo conventions to follow

- The easing token lives in `app/globals.css` inside `@theme inline`: `--ease-ui: cubic-bezier(0.23, 1, 0.32, 1);`, which gives the Tailwind utility `ease-ui` and the CSS variable `var(--ease-ui)`. **Check that it exists before starting.** If it's missing (the landing-page work wasn't committed), STOP and report.
- Exemplar of press feedback: `components/ui/button.tsx` (`active:not-aria-[haspopup]:scale-[0.97]` with `duration-150 ease-ui`) and the project cards in `components/home-view.tsx` (`transition-[border-color,transform] duration-150 ease-ui ... active:scale-[0.98]`).
- When properties need different timings, use one arbitrary `[transition:...]` value. Exemplar: `components/ui/toast.tsx:40` (`[transition:transform_500ms_...,opacity_500ms,height_150ms]`).

## Steps

1. `components/editor/design-panel.tsx:68`: in the base class string of the template `<button>`, append:

   ```
   [transition:background-color_150ms_ease,box-shadow_150ms_ease,transform_160ms_var(--ease-ui)] active:scale-[0.98]
   ```

   Resulting line:

   ```tsx
   "group relative flex flex-col gap-1 rounded-lg p-1 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [transition:background-color_150ms_ease,box-shadow_150ms_ease,transform_160ms_var(--ease-ui)] active:scale-[0.98]",
   ```

   Leave line 69 (the `active ? ... : ...` branch) unchanged.

2. `components/editor/design-panel.tsx:106`: append to the swatch className:

   ```
   [transition:box-shadow_150ms_ease,transform_160ms_var(--ease-ui)] active:scale-[0.95]
   ```

## Boundaries

- Do NOT change the tile's layout, the `ScreenshotPreview` inside it, or the colour inputs further down the panel.
- Do NOT use `transition-all`.
- Do NOT add dependencies.
- If the excerpts above don't match the file, STOP and report.

## Verification

- **Mechanical**: `bunx tsc --noEmit` exits 0. `bunx eslint components/editor/design-panel.tsx` reports no errors.
- **Feel check**:
  - `bun run dev`, open a project. Press and hold a template tile: it shrinks slightly at once (no delay before it moves) and springs back quickly on release. The new tile's ring and tint fade in over about 150ms rather than snapping.
  - Press a colour swatch: it visibly dips and returns. The hover ring fades in with a mouse.
  - Click two tiles quickly in a row. The press scale must retarget smoothly and never restart from zero or flicker (transitions, not keyframes).
  - In the DevTools Animations panel at 10% speed, confirm `transform` uses the strong ease-out (fast start, long settle) and `box-shadow` uses `ease`.
  - On a real phone, tap a tile. You should see the press immediately and no stuck hover tint afterwards.
- **Done when**: both elements shrink on `:active` with a 160ms `--ease-ui` transform transition, the selection ring and background fade over 150ms `ease`, and nothing else in the panel changed.
