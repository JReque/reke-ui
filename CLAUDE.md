# reke-ui — Component Library

## Stack

- **Components:** Lit 3 (Web Components with Shadow DOM)
- **Language:** TypeScript strict
- **Styles:** Tailwind CSS (inside Shadow DOM via adopted stylesheet) + CSS Custom Properties (design tokens)
- **Docs/Playground:** Storybook 10 (`@storybook/web-components-vite`)
- **Tests:** Vitest browser mode + Playwright (real DOM, no jsdom)
- **Accessibility:** axe-core integrated in every test + addon-a11y in Storybook
- **Build:** Vite (JS bundling) + tsc (declarations only)

## Agent System

Three-layer architecture. CLAUDE.md is the orchestrator — always loaded, routes to the right skill.

### Layer 1: Rules (this file)
Architecture rules, conventions, commands. Always active.

### Layer 2: Skills (on-demand, deep knowledge)
Located in `.claude/skills/`. Invoke when needed:

| Skill | Trigger | What it does |
|-------|---------|--------------|
| `/lit-expert` | Creating/modifying components, debugging Lit issues | Lit 3 patterns, decorators, lifecycle, Tailwind+Shadow DOM, templates |
| `/reke-component` | "Create a component", "add reke-input" | Full scaffolding workflow: confirm API → create 4 files → register → test |
| `/test-runner` | Running tests, debugging failures | Commands, test patterns, common failures, coverage checklist |
| `/a11y-checker` | Accessibility audit, ARIA questions, axe violations | WCAG 2.1 AA checklist, ARIA patterns, keyboard navigation, axe debugging |
| `/update-docs` | After creating/modifying components, or on request | Sync README-DOC.md with current component APIs, counts, and tokens |

### Layer 3: Context7 MCP (real-time docs)
For live documentation lookups when skills don't cover something:
- Lit docs: `/lit/lit.dev`
- Tailwind docs: `/tailwindlabs/tailwindcss.com`

### Auto-routing

When the user asks to **create a component**: use `/reke-component` workflow.
When the user asks to **fix/modify a component**: use `/lit-expert` patterns.
When the user asks to **run tests or debug failures**: use `/test-runner`.
When the user asks about **accessibility or ARIA**: use `/a11y-checker`.
When you need **Lit or Tailwind API reference**: query Context7.
After **creating or modifying a component**: run `/update-docs` to sync README-DOC.md.
When the user asks to **update docs or sync documentation**: use `/update-docs`.
For everything else: follow the rules below.

## Architecture Rules

1. **Always extend `RekeElement`** — never `LitElement` directly. `RekeElement` is in `src/shared/base-element.ts`.
2. **Shadow DOM always ON** — never disable it. Shadow DOM encapsulates styles.
3. **Tailwind + CSS Custom Properties** — Components use `tailwindStyles` from `src/shared/tailwind-styles.ts` as the first entry in `static styles`. Tailwind utilities for layout/spacing. CSS custom properties for themeable values. Every `var(--reke-*)` must have a fallback value.
4. **Prefix `reke-`** — all custom element tag names must start with `reke-`.
5. **Events use `composed: true`** — use `this.emit()` from `RekeElement`. Event names start with `reke-`.
6. **4 co-located files per component** — `.ts`, `.styles.ts`, `.test.ts`, `.stories.ts`.

## Component Creation Checklist

1. Create folder `src/components/reke-{name}/`
2. Create `reke-{name}.ts` extending `RekeElement` with JSDoc tags (`@tag`, `@summary`, `@slot`, `@fires`, `@csspart`, `@cssprop`)
3. Create `reke-{name}.styles.ts` — array with `tailwindStyles` first, then `css` template with token fallbacks
4. Create `reke-{name}.test.ts` with 3 sections: RENDERING, BEHAVIOR, ACCESSIBILITY
5. Create `reke-{name}.stories.ts` with `tags: ['autodocs']`
6. Add re-export in `src/index.ts`
7. Add subpath export in `package.json` exports field
8. Run `npm run test:run` and verify all pass
9. Run `/update-docs` to sync README-DOC.md

## Token Convention

- All tokens defined in `src/tokens/reke-tokens.css`
- Naming: `--reke-{category}-{name}` (e.g., `--reke-color-primary`, `--reke-space-md`)
- Inside components, always use fallbacks: `var(--reke-color-primary, #22C55E)`
- Tailwind theme maps reke tokens in `src/shared/tailwind.css`

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
npm run build        # Build with Vite + tsc declarations (output to dist/)
npm run lint         # Type-check without emitting
npm run analyze      # Generate custom-elements.json
```

## Local Development (npm link)

To consume reke-ui in another local project:

```bash
# 1. In reke-ui: build + register global link
npm run build
npm link

# 2. In the other project: link it
cd ~/dev/jrequedev/my-other-project
npm link reke-ui
```

The other project can then import:
```ts
import 'reke-ui/button';              // registers <reke-button>
import { RekeButton } from 'reke-ui'; // class + types
```

Every change in reke-ui requires `npm run build` (the symlink reflects it automatically).
To unlink: `npm unlink reke-ui` in the consumer project.

## File Patterns

- Components: `src/components/reke-*/reke-*.ts`
- Styles: `src/components/reke-*/reke-*.styles.ts`
- Tests: `src/components/reke-*/reke-*.test.ts`
- Stories: `src/components/reke-*/reke-*.stories.ts`
- Tokens: `src/tokens/reke-tokens.css`
- Shared: `src/shared/` (base-element.ts, tailwind-styles.ts, tailwind.css)
- Test utils: `src/test-utils/`
- Skills: `.claude/skills/`
- AI Doc Reference: `README-DOC.md` (single source of truth for AI agents — keep in sync via `/update-docs`)
