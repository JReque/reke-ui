# reke-ui — Component Library

## Stack

- **Components:** Lit 3 (Web Components with Shadow DOM)
- **Language:** TypeScript strict
- **Styles:** CSS Custom Properties (design tokens) — NO Tailwind inside components
- **Docs/Playground:** Storybook 10 (`@storybook/web-components-vite`)
- **Tests:** Vitest browser mode + Playwright (real DOM, no jsdom)
- **Accessibility:** axe-core integrated in every test + addon-a11y in Storybook
- **Build:** `tsc` direct (pure ESM, no bundling)

## Architecture Rules

1. **Always extend `RekeElement`** — never `LitElement` directly. `RekeElement` is in `src/shared/base-element.ts`.
2. **Shadow DOM always ON** — never disable it. Shadow DOM encapsulates styles.
3. **CSS Custom Properties for theming** — no Tailwind inside components. Every `var(--reke-*)` must have a fallback value.
4. **Prefix `reke-`** — all custom element tag names must start with `reke-`.
5. **Events use `composed: true`** — use `this.emit()` from `RekeElement`. Event names start with `reke-`.
6. **4 co-located files per component** — `.ts`, `.styles.ts`, `.test.ts`, `.stories.ts`.

## Component Creation Checklist

1. Create folder `src/components/reke-{name}/`
2. Create `reke-{name}.ts` extending `RekeElement` with JSDoc tags (`@tag`, `@summary`, `@slot`, `@fires`, `@csspart`, `@cssprop`)
3. Create `reke-{name}.styles.ts` using `css` tagged template with token fallbacks
4. Create `reke-{name}.test.ts` with 3 sections: RENDERING, BEHAVIOR, ACCESSIBILITY
5. Create `reke-{name}.stories.ts` with `tags: ['autodocs']`
6. Add re-export in `src/index.ts`
7. Add subpath export in `package.json` exports field
8. Run `npm run test:run` and verify all pass

## Token Convention

- All tokens defined in `src/tokens/reke-tokens.css`
- Naming: `--reke-{category}-{name}` (e.g., `--reke-color-primary`, `--reke-space-md`)
- Inside components, always use fallbacks: `var(--reke-color-primary, #22C55E)`

## Test Convention

- Test file mirrors component file: `reke-button.ts` → `reke-button.test.ts`
- Three mandatory sections: RENDERING, BEHAVIOR, ACCESSIBILITY
- A11y test uses `runAxe()` from `src/test-utils/a11y.ts`
- Tests run in real browser (Vitest browser mode + Playwright Chromium)

## JSDoc Tags (for Custom Elements Manifest)

Required on every component class:
```
@tag reke-{name}
@summary Brief description
@slot - Default slot description
@fires reke-{event} - Event description
@csspart {name} - Part description
@cssprop [--reke-{token}=default] - Token description
```

## Commands

```bash
npm run dev          # Start Storybook dev server (port 6006)
npm run test:run     # Run all tests once
npm test             # Run tests in watch mode
npm run build        # Build with tsc (output to dist/)
npm run lint         # Type-check without emitting
npm run analyze      # Generate custom-elements.json
```

## File Patterns

- Components: `src/components/reke-*/reke-*.ts`
- Styles: `src/components/reke-*/reke-*.styles.ts`
- Tests: `src/components/reke-*/reke-*.test.ts`
- Stories: `src/components/reke-*/reke-*.stories.ts`
- Tokens: `src/tokens/reke-tokens.css`
- Shared: `src/shared/`
- Test utils: `src/test-utils/`
