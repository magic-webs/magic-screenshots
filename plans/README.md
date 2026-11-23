# Animation plans

Written by the `improve-animations` audit on 2026-11-23 against commit `53681a3`. The working tree also had uncommitted landing-page work, which adds the `--ease-ui` token in `app/globals.css`.

| # | Plan | Severity | Status |
| --- | --- | --- | --- |
| 001 | [Respect reduced motion in the delete dialog and toasts](001-reduced-motion-dialog-and-toast.md) | MEDIUM | DONE, feel check pending |
| 002 | [Replace `transition-all` on tab triggers](002-tabs-name-transition-properties.md) | MEDIUM | DONE, feel check pending |
| 003 | [Press feedback on template tiles and colour swatches](003-press-feedback-template-and-swatches.md) | MEDIUM | DONE, feel check pending |

## Execution order

002, then 001, then 003. None blocks another. 002 is a single-token change, so it's the safest warm-up.

## Dependencies

- **003 needs the `--ease-ui` token** (`app/globals.css`, `@theme inline`). Commit the landing-page work first, or the plan will stop at its precondition check.
- 001 and 002 have no dependencies.

## Audit findings not planned (yet)

- Alert dialog opens in 100ms with the default curve: target 200ms open and 150ms close on `--ease-ui`.
- Toast slide is 500ms with a hand-typed `cubic-bezier(0.22,1,0.36,1)`: target 400ms on one shared curve.
- `transition-all` on `components/ui/badge.tsx:7`.
- Missed opportunities: new screenshot cards appear instantly in the editor; the Export button changes width while counting "Exporting n/m".
