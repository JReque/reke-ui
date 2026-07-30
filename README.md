# reke-ui

A Web Component library built with [Lit 3](https://lit.dev). Ships with dark and light themes. Framework-agnostic — works with Vue, React, Angular, Svelte, or vanilla JS.

**[Documentation](https://jreque.github.io/reke-ui/)** · **[Storybook](https://jreque.github.io/reke-ui/storybook/)**

## Components

| Component | Tag | Description |
|-----------|-----|-------------|
| Button | `<reke-button>` | Buttons with variants: primary, secondary, danger, ghost, outline |
| Input | `<reke-input>` | Text input with label, helper text, and validation |
| Textarea | `<reke-textarea>` | Multi-line text input |
| Checkbox | `<reke-checkbox>` | Checkbox with label |
| Toggle | `<reke-toggle>` | On/off toggle switch |
| Select | `<reke-select>` | Dropdown select |
| Date Range | `<reke-date-range>` | Date range picker with presets |
| File Upload | `<reke-file-upload>` | Drag & drop file upload |
| Table | `<reke-table>` | Data table with sorting and expandable rows |
| Dialog | `<reke-dialog>` | Modal dialog |
| Card | `<reke-card>` | Content card container |
| Badge | `<reke-badge>` | Status badge |
| Chip | `<reke-chip>` | Dismissible chip/tag |
| Tooltip | `<reke-tooltip>` | Tooltip on hover |
| Alert | `<reke-alert>` | Inline alert message |
| Toast | `<reke-toast>` | Toast notification |

## Quick Start

### Install

```bash
npm install reke-ui
```

### Import tokens (optional but recommended)

```css
@import 'reke-ui/tokens/css';
```

### Use a component

```html
<script type="module">
  import 'reke-ui/button';
</script>

<reke-button variant="primary">Click me</reke-button>
```

Or import everything:

```ts
import 'reke-ui';
```

## Framework Usage

### Vue

Vue supports Web Components natively. Just import and use:

```vue
<script setup>
import 'reke-ui/button';
import 'reke-ui/input';
</script>

<template>
  <reke-button variant="primary" @reke-click="handleClick">
    Submit
  </reke-button>
  <reke-input label="Name" @reke-change="handleChange" />
</template>
```

> **Vue config:** Tell Vue to skip resolving `reke-*` tags as Vue components:
> ```ts
> // vite.config.ts
> vue({
>   template: {
>     compilerOptions: {
>       isCustomElement: (tag) => tag.startsWith('reke-'),
>     },
>   },
> })
> ```

### React

React needs wrappers for proper event handling. Use the built-in React bindings:

```tsx
import { Button, Input } from 'reke-ui/react';

function App() {
  return (
    <>
      <Button variant="primary" onRekeClick={() => console.log('clicked')}>
        Submit
      </Button>
      <Input label="Name" onRekeChange={(e) => console.log(e.detail.value)} />
    </>
  );
}
```

> **Components with render props** (e.g. `Table` with `expandedRowRender` or `columns[].render`) use a React-native bridge: return `ReactNode` (JSX), pass `getRowKey` for stable keying, and never `import { html } from 'lit'` in app code. See `README-DOC.md` → reke-table → React usage, or install the agent skills below for the full contract.

> **`<reke-table>` virtualizes on request.** Set `virtualized` with a `row-height` and a `max-height` and only the rows on screen are rendered, expandable rows included. It is opt-in rather than automatic because windowing needs a bounded-height scroll container — it changes the layout contract, so it is never turned on behind your back. Measured on 10.000 rows: mount drops from 422ms to 3ms and the DOM stays flat at ~190 nodes.
>
> ```html
> <reke-table virtualized row-height="41" max-height="600px"></reke-table>
> ```

### Vanilla JS

```html
<link rel="stylesheet" href="node_modules/reke-ui/dist/tokens/reke-tokens.css" />
<script type="module" src="node_modules/reke-ui/dist/reke-ui.js"></script>

<reke-button variant="primary">Click me</reke-button>

<script>
  document.querySelector('reke-button')
    .addEventListener('reke-click', () => console.log('clicked'));
</script>
```

## Theming

reke-ui ships with **dark** (default) and **light** themes, plus an **auto** mode that follows OS preference.

```html
<html>                          <!-- Dark (default) -->
<html data-reke-theme="dark">   <!-- Dark (explicit) -->
<html data-reke-theme="light">  <!-- Light -->
<html data-reke-theme="auto">   <!-- Follows OS preference -->
```

### Customizing tokens

Override any CSS custom property to match your brand:

```css
:root {
  --reke-color-primary: #8B5CF6;
  --reke-color-secondary: #EC4899;
  --reke-radius: 8px;
  --reke-font-mono: 'Fira Code', monospace;
}
```

See all available tokens in [`src/tokens/reke-tokens.css`](src/tokens/reke-tokens.css).

## Agent skills

reke-ui ships **LLM-first skills** that teach AI coding agents how to consume the library correctly (3-layer token system, component APIs, React bridge contract for components with render props).

```bash
npm install reke-ui
npx reke-ui install-skills
```

This copies three consumer skills into your project's `.claude/skills/` directory:

- `reke-ui-consumer` — install, imports, framework integration, full component reference, React bridge contract
- `reke-design-system` — 3-layer token architecture for Tailwind v4 projects (microfrontend-safe scoping)
- `reke-bridge` — when and how to bridge web components to your framework (React today; pattern documented for Vue/Svelte)

After install, ask your agent to refresh its skill index: **"update skill registry"** (or **"actualizá las skills"**). The agent will then know how to use reke-ui idiomatically — no more guessing or copy-pasted anti-patterns.

Options: `--force` reinstalls even if versions match, `--dry-run` previews without writing files.

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start Storybook on port 6006
npm run test:run     # Run all tests
npm run build        # Build for production
npm run lint         # Type-check
```

## License

MIT
