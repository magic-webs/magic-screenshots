# 001 — Respect reduced motion in the delete dialog and toasts

- **Status**: DONE (2026-11-23, mechanical checks passed; feel check pending)
- **Commit**: 53681a3 (plus uncommitted landing-page work in the tree; see Repo conventions)
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 2 files, ~6 class edits

## Problem

`prefers-reduced-motion` is honoured only on the landing page (`app/globals.css`, `.landing-rise` / `.message-in`). The two shared overlays the app actually renders still move for users who asked for less motion. The animation library in use, `tw-animate-css`, ships no reduced-motion handling of its own (verified: no `prefers-reduced-motion` in `node_modules/tw-animate-css/dist/*.css`).

1. **Alert dialog content zooms** (used by "Delete this project?" in `components/editor/editor.tsx:331`).

```tsx
// components/ui/alert-dialog.tsx:55 — current (excerpt of the className string)
"... duration-100 outline-none ... data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
```

The overlay at `components/ui/alert-dialog.tsx:33` is fade-only and is already correct. Leave it alone.

2. **Toasts slide in and out by 150% of their height** (used by 14 `toast.add` calls across the app).

```tsx
// components/ui/toast.tsx:43-44 — current
"data-limited:opacity-0 data-starting-style:[transform:translateY(150%)]",
"[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
```

Reduced motion means **fewer and gentler** animations, not zero: keep opacity, drop movement and scale.

## Target

- Dialog: under reduced motion it fades only, with no zoom on open or close.
- Toast: under reduced motion it fades in and fades out where it stands, with no 150% slide. **Swipe-to-dismiss exits stay as they are.** They follow the user's finger, so the user is driving that movement.
- Under normal motion, nothing changes visually.

Use Tailwind's built-in `motion-safe:` / `motion-reduce:` variants (they compile to `@media (prefers-reduced-motion: no-preference)` / `(... : reduce)`).

## Repo conventions to follow

- The shadcn components in `components/ui/` are styled entirely with Tailwind class strings inside `cn(...)`. Edit the class strings in place; don't add CSS files.
- Exemplar of the reduced-motion pattern already in the repo: `app/globals.css`, the `@media (prefers-reduced-motion: reduce)` block that swaps `.landing-rise` to the opacity-only `landing-fade` keyframe.

## Steps

1. `components/ui/alert-dialog.tsx:55`: in the content's className string, append these four classes right after `data-closed:zoom-out-95`:

   ```
   motion-reduce:data-open:zoom-in-100 motion-reduce:data-closed:zoom-out-100
   ```

   (`zoom-in-100` sets the enter scale to 100%, which means no zoom. The fade classes stay active.)

2. `components/ui/toast.tsx:43`: replace

   ```
   "data-limited:opacity-0 data-starting-style:[transform:translateY(150%)]",
   ```

   with

   ```
   "data-limited:opacity-0 motion-safe:data-starting-style:[transform:translateY(150%)] motion-reduce:data-starting-style:opacity-0",
   ```

3. `components/ui/toast.tsx:44`: replace

   ```
   "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
   ```

   with

   ```
   "motion-safe:[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)] motion-reduce:[&[data-ending-style]:not([data-swipe-direction])]:opacity-0",
   ```

4. Do not touch lines 45–52 of `components/ui/toast.tsx` (the swipe-direction exit rules).

## Boundaries

- Do NOT touch the alert dialog overlay (line 33), durations, or easing. Plan 002 (if written) owns dialog timing.
- Do NOT change `components/ui/skeleton.tsx`. Its `animate-pulse` is opacity-only and is acceptable under reduced motion.
- Do NOT edit any other `components/ui/*` file. Most are unused.
- Do NOT add dependencies or new CSS files.
- If the code at the cited lines doesn't match the excerpts above, STOP and report instead of improvising.

## Verification

- **Mechanical**: `bunx tsc --noEmit` exits 0. `bunx eslint components/ui/alert-dialog.tsx components/ui/toast.tsx` reports no errors. (A full `bun run lint` already fails on `components/ui/carousel.tsx` and `hooks/use-mobile.ts`, which this plan doesn't cover.)
- **Feel check**:
  - Run `bun run dev`, open a project, click the trash button so "Delete this project?" opens. With motion enabled it should still zoom in from 95% and fade, exactly as before.
  - In Chrome DevTools, go to Rendering and set "Emulate CSS media feature prefers-reduced-motion" to `reduce`. Reopen the dialog: it fades with no size change. Close it: it fades with no shrink.
  - Trigger a toast (for example, click "Generate captions with AI" with no `ANTHROPIC_API_KEY` set, or any action that errors). With reduce on, it appears where it rests with no slide-up. When it times out or is closed, it fades in place.
  - Still with reduce on, swipe a toast sideways or down. It should still follow the finger or pointer and leave in the swipe direction.
  - In the Animations panel at 10% speed, confirm the reduced dialog keeps its opacity fade and that `transform` doesn't change.
- **Done when**: with `prefers-reduced-motion: reduce`, neither the dialog nor a non-swiped toast changes `transform` during enter or exit, both still fade, and normal motion is unchanged.
