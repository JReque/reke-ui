# reke-ui

A Web Component library built with [Lit 3](https://lit.dev). Ships with dark and light themes. Framework-agnostic — works with Vue, React, Angular, Svelte, or vanilla JS.

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
