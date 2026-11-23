# 002 — Replace `transition-all` on tab triggers with named properties

- **Status**: DONE (2026-11-23, mechanical checks passed; feel check pending)
- **Commit**: 53681a3 (plus uncommitted landing-page work in the tree)
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 1 file, 1 class edit

## Problem

The editor's platform switch ("App Store · iPhone" / "Google Play · Android", `components/editor/editor.tsx:376-381`) uses `TabsTrigger`, which transitions **every** property:

```tsx
// components/ui/tabs.tsx:60 — current (excerpt of the className string)
"relative inline-flex h-[calc(100%-1px)] flex-1 ... text-foreground/60 transition-all group-data-vertical/tabs:w-full ..."
```

`transition-all` animates whatever changes, including layout properties (width and padding through `has-data-[icon=...]` and the responsive classes), which forces layout and paint on every frame. It also makes the active-state change drift over 150ms with Tailwind's default curve. What should change on this element is its color, background, border and shadow, which is a hover or colour change and should use `ease`.

## Target

```
transition-[color,background-color,border-color,box-shadow] duration-150 ease-[ease]
```

No other change. The `after:` underline indicator already uses `after:transition-opacity`. Leave it alone.

## Repo conventions to follow

- Tailwind v4 arbitrary transition properties are already used in this repo. Exemplar: `components/ui/button.tsx` base class `transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-150 ease-ui`.
- Use `ease` (Tailwind's `ease` utility isn't defined by default in v4, so write it as `ease-[ease]`) because this is a colour or hover change, not an entrance. Keep the strong `ease-ui` curve for movement only.

## Steps

1. `components/ui/tabs.tsx:60`: in the first className string of `TabsTrigger`, replace the single token `transition-all` with:

   ```
   transition-[color,background-color,border-color,box-shadow] duration-150 ease-[ease]
   ```

   Leave every other token in the string untouched.

## Boundaries

- Do NOT touch `TabsList`, `TabsContent`, or the `after:` indicator classes.
- Do NOT edit any other file.
- Do NOT add dependencies.
- If line 60 doesn't contain `transition-all`, STOP and report.

## Verification

- **Mechanical**: `bunx tsc --noEmit` exits 0. `bunx eslint components/ui/tabs.tsx` reports no errors. `grep -n "transition-all" components/ui/tabs.tsx` prints nothing.
- **Feel check**:
  - `bun run dev`, open a project, click between the two platform tabs. The active pill's background, shadow and text colour change over about 150ms. Nothing about the tab's size or position animates.
  - In the DevTools Animations panel, click a tab and confirm the recorded transitions list only `color`, `background-color`, `border-color` and `box-shadow`. You should not see `width`, `padding` or `all`.
  - Hover an inactive tab with a mouse. The text darkens smoothly, with no lag.
- **Done when**: `TabsTrigger` has no `transition-all`, and only the four named properties transition.
