# reke-ui — Component API Reference

> Per-component API reference (props, slots, events, types, examples). For everything else:

| You want… | Go to |
|---|---|
| Quick start, install, framework setup | [`README.md`](./README.md) |
| Live examples, interactive playground | [Storybook](https://jreque.github.io/reke-ui/storybook/) |
| Design tokens (full catalog + values) | [`src/tokens/reke-tokens.css`](src/tokens/reke-tokens.css) |
| 3-layer token system (Tailwind v4 + microfrontend scoping) | `reke-design-system` agent skill — `npx reke-ui install-skills` |
| React bridge contract for components with render props | `reke-ui-consumer` agent skill |
| How to write a new framework bridge (Vue / Svelte / Solid) | `reke-bridge` agent skill |
| Lit 3 patterns, component scaffolding, internal architecture | `.claude/skills/lit-expert`, `reke-component` (maintainer-only) |

---

## Components

### reke-button

A button with multiple variants, sizes, and loading state.

| Property | Type | Default | Attribute |
|----------|------|---------|-----------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'danger-outline' \| 'icon-only'` | `'primary'` | `variant` |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | `size` |
| `disabled` | `boolean` | `false` | `disabled` |
| `loading` | `boolean` | `false` | `loading` |

**Slots:** default (label), `prefix`, `suffix`
**Events:** `reke-click`
**Parts:** `button`

```html
<reke-button variant="primary" size="md">Save</reke-button>
<reke-button variant="primary" size="xs">save</reke-button>
<reke-button variant="danger" loading>Deleting...</reke-button>
<reke-button variant="icon-only" aria-label="Edit">&#9998;</reke-button>
```

---

### reke-input

Text input with label, sizes, error, and disabled states.

| Property | Type | Default | Attribute |
|----------|------|---------|-----------|
| `value` | `string` | `''` | `value` |
| `placeholder` | `string` | `''` | `placeholder` |
| `type` | `'text' \| 'password' \| 'email' \| 'number' \| 'search' \| 'url'` | `'text'` | `type` |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | `size` |
| `disabled` | `boolean` | `false` | `disabled` |
| `error` | `boolean` | `false` | `error` |
| `label` | `string` | `''` | `label` |
| `name` | `string` | `''` | `name` |
| `inputmode` | `'text' \| 'decimal' \| 'numeric' \| 'tel' \| 'search' \| 'email' \| 'url' \| 'none'` | `undefined` | `inputmode` |
| `min` | `string` | `undefined` | `min` |
| `max` | `string` | `undefined` | `max` |
| `step` | `string` | `undefined` | `step` |
| `maxlength` | `number` | `undefined` | `maxlength` |
| `autocomplete` | `string` | `undefined` | `autocomplete` |
| `required` | `boolean` | `false` | `required` |

**Slots:** `prefix`, `suffix` (adornments — unit, symbol, icon — rendered inside the field box)
**Events:** `reke-input` (`{ value }`), `reke-change` (`{ value }`)
**Parts:** `field` (the bordered box), `input` (the inner input element)
**Methods:** `focus(options?)` — delegates to the inner input (host also focuses via `delegatesFocus`).

```html
<reke-input label="Email" type="email" placeholder="you@example.com"></reke-input>
<reke-input size="xs" placeholder="nombre..." style="width: 90px;"></reke-input>

<!-- Adornment in a single box -->
<reke-input value="0.5" inputmode="decimal">
  <span slot="suffix">BTC</span>
</reke-input>

<!-- Mobile numeric keyboard + native constraints -->
<reke-input type="number" name="quantity" inputmode="decimal" min="0" step="0.01"></reke-input>
```

For dashed border styling, use `::part(field) { border-style: dashed; }`.

---

### reke-textarea

Textarea with rows control, label, sizes, error, and disabled states.

| Property | Type | Default | Attribute |
|----------|------|---------|-----------|
| `value` | `string` | `''` | `value` |
| `placeholder` | `string` | `''` | `placeholder` |
| `rows` | `number` | `4` | `rows` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | `size` |
| `disabled` | `boolean` | `false` | `disabled` |
| `error` | `boolean` | `false` | `error` |
| `label` | `string` | `''` | `label` |

**Events:** `reke-input` (`{ value }`), `reke-change` (`{ value }`)
**Parts:** `textarea`

```html
<reke-textarea label="Description" rows="6" placeholder="Enter text..."></reke-textarea>
```

---

### reke-checkbox

Checkbox with checked, indeterminate, and disabled states.

| Property | Type | Default | Attribute |
|----------|------|---------|-----------|
| `checked` | `boolean` | `false` | `checked` |
| `indeterminate` | `boolean` | `false` | `indeterminate` |
| `disabled` | `boolean` | `false` | `disabled` |
| `label` | `string` | `''` | `label` |

**Events:** `reke-change` (`{ checked }`)
**Parts:** `container`, `box`, `label`

```html
<reke-checkbox label="Accept terms" checked></reke-checkbox>
```

---

### reke-toggle

Toggle switch for boolean on/off states.

| Property | Type | Default | Attribute |
|----------|------|---------|-----------|
| `checked` | `boolean` | `false` | `checked` |
| `disabled` | `boolean` | `false` | `disabled` |
| `label` | `string` | `''` | `label` |

**Events:** `reke-change` (`{ checked }`)
**Parts:** `track`, `thumb`

```html
<reke-toggle label="Dark mode" checked></reke-toggle>
```

---

### reke-badge

Inline badge for labels, statuses, and counts.

| Property | Type | Default | Attribute |
|----------|------|---------|-----------|
| `variant` | `'default' \| 'primary' \| 'secondary' \| 'danger' \| 'warning' \| 'success'` | `'default'` | `variant` |
| `size` | `'sm' \| 'md'` | `'md'` | `size` |

**Slots:** default (text)
**Parts:** `badge`

```html
<reke-badge variant="success">Active</reke-badge>
<reke-badge variant="danger" size="sm">3</reke-badge>
```

---

### reke-card

Card container with optional header/footer slots.

| Property | Type | Default | Attribute |
|----------|------|---------|-----------|
| `variant` | `'default' \| 'elevated' \| 'outlined'` | `'default'` | `variant` |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | `padding` |

**Slots:** default (body), `header`, `footer`

```html
<reke-card variant="elevated">
  <div slot="header">Title</div>
  <p>Card body content</p>
  <div slot="footer"><reke-button>Action</reke-button></div>
</reke-card>
```

---

### reke-tooltip

Tooltip that displays on hover/focus with configurable position and delay.

| Property | Type | Default | Attribute |
|----------|------|---------|-----------|
| `text` | `string` | `''` | `text` |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | `position` |
| `delay` | `number` | `200` | `delay` |

**Slots:** default (trigger element)

```html
<reke-tooltip text="Copy to clipboard" position="top">
  <reke-button variant="icon-only">&#128203;</reke-button>
</reke-tooltip>
```

---

### reke-dialog

Modal and drawer dialog with backdrop, Escape key, and footer slot.

| Property | Type | Default | Attribute |
|----------|------|---------|-----------|
| `open` | `boolean` | `false` | `open` |
| `heading` | `string` | `''` | `heading` |
| `variant` | `'modal' \| 'drawer'` | `'modal'` | `variant` |
| `position` | `'right' \| 'left'` | `'right'` | `position` |

**Slots:** default (body), `footer`
**Events:** `reke-close`
**Methods:** `show()`, `close()`

```html
<!-- Modal -->
<reke-dialog heading="Confirm" open>
  <p>Are you sure?</p>
  <div slot="footer">
    <reke-button variant="ghost">Cancel</reke-button>
    <reke-button variant="primary">OK</reke-button>
  </div>
</reke-dialog>

<!-- Drawer -->
<reke-dialog heading="Settings" variant="drawer" position="right" open>
  <p>Drawer content</p>
</reke-dialog>
```

---

### reke-menu

Floating action menu (dropdown / context menu). Anchor it to `{x, y}` coordinates (right-click menus) or to an element via `anchor`. `position: fixed` so it escapes any ancestor `overflow: hidden`; flips/clamps to stay in the viewport. Closes on outside click, Escape, and scroll. Holds `reke-menu-item` children. **Not a tooltip** — this is interactive (`role="menu"`), triggered by click; `reke-tooltip` is informational hover text.

| Property | Type | Default | Attribute |
|----------|------|---------|-----------|
| `open` | `boolean` | `false` | `open` |
| `x` | `number` | `0` | `x` |
| `y` | `number` | `0` | `y` |
| `anchor` | `HTMLElement \| null` | `null` | JS only |
| `label` | `string` | `'Menu'` | `label` |

**Slots:** default (`reke-menu-item` elements)
**Events:** `reke-close` (outside click, Escape, scroll, or item selection — the consumer should set `open=false`)
**Parts:** `menu`
**Keyboard:** ArrowUp/Down + Home/End to move focus, Enter/Space to activate, Escape to close.

```html
<!-- Anchored to a trigger button -->
<reke-button id="trigger">Actions</reke-button>
<reke-menu open></reke-menu>

<!-- Context menu at cursor -->
<reke-menu x="120" y="80" open>
  <reke-menu-item>Rename</reke-menu-item>
  <reke-menu-item variant="danger">Delete</reke-menu-item>
</reke-menu>
```

```ts
// Anchor below a button; controlled open
const menu = document.querySelector('reke-menu');
menu.anchor = document.querySelector('#trigger');
menu.open = true;
menu.addEventListener('reke-close', () => (menu.open = false));

// Context menu at right-click coords
el.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  menu.x = e.clientX;
  menu.y = e.clientY;
  menu.open = true;
});
```

---

### reke-menu-item

A single actionable item inside a `reke-menu`. Renders a `<button role="menuitem">` (Enter/Space activation from the browser).

| Property | Type | Default | Attribute |
|----------|------|---------|-----------|
| `variant` | `'default' \| 'danger'` | `'default'` | `variant` |
| `disabled` | `boolean` | `false` | `disabled` |

**Types:** `MenuItemVariant = 'default' | 'danger'`
**Slots:** default (label), `prefix` (icon)
**Events:** `reke-select` (activated and not disabled)
**Parts:** `item`
**Methods:** `focus(options?)` — focuses the inner button.

```html
<reke-menu-item>Rename</reke-menu-item>
<reke-menu-item variant="danger">Delete</reke-menu-item>
<reke-menu-item disabled>Unavailable</reke-menu-item>
```

React:

```tsx
import { Menu, MenuItem } from 'reke-ui/react';

<Menu anchor={triggerEl} open={open} onRekeClose={() => setOpen(false)}>
  <MenuItem onRekeSelect={() => rename()}>Rename</MenuItem>
  <MenuItem variant="danger" onRekeSelect={() => remove()}>Delete</MenuItem>
</Menu>
```

---

### reke-select

Dropdown select with options, sizes, label, error, and disabled states.

| Property | Type | Default | Attribute |
|----------|------|---------|-----------|
| `value` | `string` | `''` | `value` |
| `placeholder` | `string` | `'Select...'` | `placeholder` |
| `options` | `SelectOption[]` | `[]` | JS only |
| `disabled` | `boolean` | `false` | `disabled` |
| `error` | `boolean` | `false` | `error` |
| `label` | `string` | `''` | `label` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | `size` |

**Types:** `SelectOption = { value: string; label: string }`
**Events:** `reke-change` (`{ value }`)
**Parts:** `trigger`, `dropdown`

```ts
const select = document.querySelector('reke-select');
select.options = [
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'rs', label: 'Rust' },
];
```

---

### reke-combobox

Searchable select. Type to filter options, navigate with the keyboard. Unlike `reke-select`, it exposes a text query and is meant for long option lists. The dropdown is `position: fixed` so it escapes any ancestor `overflow: hidden` (cards, table cells).

| Property | Type | Default | Attribute |
|----------|------|---------|-----------|
| `value` | `string` | `''` | `value` |
| `placeholder` | `string` | `'Buscar...'` | `placeholder` |
| `options` | `ComboboxOption[]` | `[]` | JS only |
| `optionRender` | `ComboboxOptionRender \| null` | `null` | JS only |
| `multiple` | `boolean` | `false` | `multiple` |
| `tags` | `boolean` | `false` | `tags` |
| `values` | `string[]` | `[]` | JS only |
| `disabled` | `boolean` | `false` | `disabled` |
| `error` | `boolean` | `false` | `error` |
| `label` | `string` | `''` | `label` |
| `emptyText` | `string` | `'Sin resultados'` | `empty-text` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | `size` |

**Types:** `ComboboxOption = { value: string; label: string; image?: string }`, `ComboboxOptionRender = (option: ComboboxOption, index: number) => TemplateResult | string | HTMLElement | Node`, `ComboboxSize = 'sm' | 'md' | 'lg'`
**Custom option render:** `optionRender` fills the inside of each dropdown `<li>`, replacing the default image/label/check content. The `<li>` itself stays component-owned (`id`, `role="option"`, `aria-selected`, `part="option"`, click/hover handlers), so selection, keyboard nav and `aria-activedescendant` keep working. Display only — `label` is still required and still drives filtering, the input value and the multi-select summary. Applies to dropdown options only, not chips or the selected summary.
**Events:** `reke-change` (single: `{ value }`, multiple: `{ values }`), `reke-search` (`{ query }` — for remote filtering)
**Parts:** `input`, `dropdown`, `option`, `empty`, `chip`, `chip-prefix`
**Keyboard:** ArrowUp/Down to move, Enter to select, Escape to close. In tags mode, Backspace with an empty query removes the last chip.
**Multiple mode (no tags):** selected labels render as inline selected text overlaid on the input (normal text color), shown only while the query is empty — never as placeholder.
**Tags mode:** `tags` requires `multiple`. Renders selected values as dismissible `reke-chip`s inside the control (with scale-in animation); selected options are hidden from the dropdown. Chips with `option.image` render it in the chip's `prefix` slot.

```ts
const combobox = document.querySelector('reke-combobox');
combobox.options = [
  { value: 'btc', label: 'Bitcoin', image: '/coins/btc.png' },
  { value: 'eth', label: 'Ethereum', image: '/coins/eth.png' },
];
combobox.addEventListener('reke-search', (e) => fetchRemote(e.detail.query));

// Rich options: label + secondary description line
combobox.optionRender = (opt) => html`
  <div style="display:flex;flex-direction:column;gap:2px">
    <span>${opt.label}</span>
    <small style="opacity:.6">${opt.value}</small>
  </div>
`;
```

**React usage:** import `Combobox` from `reke-ui/react` (a bridge, not a bare `createComponent`) and return JSX from `optionRender` — never `import { html } from 'lit'`. The bridge mounts React into a `display: contents` host and hands Lit the raw DOM node, keying roots by `option.value` so filtering does not remount them.

```tsx
import { Combobox, type ComboboxOption } from 'reke-ui/react';

<Combobox
  options={coins}
  value={value}
  placeholder="Search coin..."
  onRekeChange={(e) => setValue(e.detail.value!)}
  onRekeSearch={(e) => fetchRemote(e.detail.query)}
  optionRender={(opt) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <img src={opt.image} alt="" width={20} height={20} />
      <span style={{ display: 'flex', flexDirection: 'column' }}>
        <span>{opt.label}</span>
        <small style={{ opacity: 0.6 }}>{opt.value.toUpperCase()}</small>
      </span>
    </span>
  )}
/>;
```

```html
<!-- Tags mode: selected values as dismissible chips -->
<reke-combobox multiple tags placeholder="Add coins..."></reke-combobox>
```

```ts
const tagsBox = document.querySelector('reke-combobox[tags]');
tagsBox.options = [
  { value: 'btc', label: 'Bitcoin', image: '/coins/btc.png' },
  { value: 'eth', label: 'Ethereum', image: '/coins/eth.png' },
];
tagsBox.values = ['btc'];
tagsBox.addEventListener('reke-change', (e) => console.log(e.detail.values));
```

---

### reke-table

Data table with custom cell rendering, framework-agnostic expandable rows, an opt-in chevron column, sorting, toolbar/footer slots.

**Expand architecture (host-callback contract):** Expansion is driven by a single framework-agnostic callback, `expandedRowElement(host, row, key) => Cleanup | void`. The component owns the host `HTMLElement` per row key and invokes the callback once per expand; the callback mounts ANY framework (vanilla DOM, Lit, React, Vue) into that host and returns a cleanup that runs on collapse, row removal, or table disconnect.

The chevron column is opt-in via `expandable=true` (accessible `<button>` with `aria-expanded`, `aria-controls`, Enter/Space activation, focus-visible outline). Row-click expansion is opt-in via `expandOnRowClick=true`.

**Expand row lifecycle:** the expand `<tr>` exists ONLY while a row is open or animating shut — there is no permanent hidden expand row per data row. Collapse teardown is driven by `Element.getAnimations()` (plus a frame guard and a 400ms fallback), never by `transitionend`, so cleanup is guaranteed under reduced motion, `display: none`, backgrounded tabs, and cancelled transitions. Teardown is idempotent and detaches the host element itself, so the shadow tree returns to its exact baseline node count after any number of expand/collapse cycles. Re-expanding a row mid-collapse cancels the pending teardown and reuses the mounted host — the consumer's cleanup does not run and the content is never remounted.

**Rendering model:** each row is wrapped in Lit's `guard` directive, so toggling one row re-invokes `column.render` for that row only, not for the whole table. `column.render` is re-invoked when the row object, its index, the `rows` array identity, the `columns` array identity, or that row's expand state changes. If you mutate a row object in place, reassign `rows` (`table.rows = [...table.rows]`) to force a re-render — the same rule as before, now enforced.

**Virtualization: opt-in, off by default.** Set `virtualized` and only the rows intersecting the viewport are rendered; spacer rows carry the scroll height of everything else, so the scrollbar still reports the real dataset size.

```html
<reke-table virtualized row-height="41" max-height="600px" overscan="4"></reke-table>
```

`rowHeight` and `maxHeight` are REQUIRED when `virtualized` is on (dev error otherwise). It is a prop rather than an automatic row-count threshold on purpose: windowing needs a bounded-height scroll container, so it changes the layout contract. A table that silently grew a scroll region because its dataset crossed some boundary would be worse than a slow one.

What it does for you:
- `table-layout: fixed` is applied, so column widths resolve from the header instead of from whichever rows happen to be rendered (otherwise columns shift while scrolling).
- The header becomes sticky, and the scroll container is keyboard focusable.
- `aria-rowcount` on the table and `aria-rowindex` on each row report the real dataset position of rows that are not in the DOM.
- Rows carry their absolute index, so striping, `reke-row-click` and key resolution are unaffected by which window is rendered.

**Expandable rows work while virtualized.** A collapsed row's height is declared; an expanded row's cannot be, since the consumer mounts arbitrary content. So expanded rows are measured with a `ResizeObserver` and folded into the offsets — `offset(i) = i * rowHeight + sum(measured heights of expanded rows above i)`. That is affordable because the set of open rows is tiny by nature. The observer fires during the open animation too, so offsets track the transition rather than jumping at the end, and a height change ABOVE the window compensates `scrollTop` so the viewport stays anchored.

Rows are never recycled across keys. An expanded row scrolled out of the window leaves the DOM, but its host element and cleanup stay cached against its key, so scrolling back reattaches the SAME host with no remount and no cleanup call.

**Keyboard and screen reader behavior.** Scrolling replaces the rendered rows, and Lit reuses their DOM positionally — so a focused chevron is usually not destroyed, it is rebound to a different record. Left alone, that silently moves a keyboard user from row 5 to row 505 with nothing announced. When the window moves off the record that had focus, focus is parked on the scroll container instead, which is a position the user can reason about. Unrelated re-renders and normal Tab-away never trigger it.

Known limits, all inherent to windowing rather than to this implementation:
- `rowHeight` is a contract you must honor. Content taller than it will overlap, and the resulting drift in scroll height is bounded by the size of the rendered window — it does not accumulate across the dataset.
- Browser find-in-page (Ctrl+F) cannot reach rows that are not rendered. If your users rely on it, do not virtualize; paginate instead.
- Only the rendered rows are in the tab order. `aria-rowcount`/`aria-rowindex` tell assistive tech the real size and position, but reaching row 8.000 still requires scrolling to it.

Measured cost (Chromium, 5 columns, 600px viewport):

| rows | mount | sort | toggle | idle nodes |
|------|-------|------|--------|------------|
| 1.000 unwindowed | 39ms | 22ms | 21ms | 9.019 |
| 1.000 windowed | 2ms | 0.4ms | 12ms | 192 |
| 10.000 unwindowed | 422ms | 204ms | 241ms | 90.019 |
| 10.000 windowed | 3ms | 1.3ms | 10ms | 192 |

Reproduce with `npm run bench:table`. Rule of thumb: unwindowed is comfortable to ~1.000 rows, borderline at 2.000, and broken from 5.000 up.

| Property | Type | Default | Attribute |
|----------|------|---------|-----------|
| `columns` | `TableColumn[]` | `[]` | JS only |
| `rows` | `TableRow[]` | `[]` | JS only |
| `striped` | `boolean` | `false` | `striped` |
| `dense` | `boolean` | `false` | `dense` |
| `hoverable` | `boolean` | `false` | `hoverable` |
| `bordered` | `boolean` | `false` | `bordered` |
| `borderless` | `boolean` | `false` | `borderless` |
| `expandable` | `boolean` | `false` | `expandable` |
| `expandOnRowClick` | `boolean` | `false` | `expand-on-row-click` |
| `virtualized` | `boolean` | `false` | `virtualized` |
| `rowHeight` | `number` | `0` | `row-height` |
| `maxHeight` | `string` | `''` | `max-height` |
| `overscan` | `number` | `4` | `overscan` |
| `sortKey` | `string` | `''` | `sort-key` |
| `sortDirection` | `'asc' \| 'desc'` | `'asc'` | `sort-direction` |
| `expandedRowElement` | `ExpandedRowElement \| null` | `null` | JS only |
| `getRowKey` | `GetRowKey \| undefined` | `undefined` | JS only |
| `expandedRows` | `Set<RowKey>` | `new Set()` | JS only |

**Types:**

```ts
interface TableColumn {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;  // default true, set false to disable sort
  render?: (value: unknown, row: TableRow, index: number) => TemplateResult | string | HTMLElement | Node;
}
type TableRow = Record<string, unknown>;

// Framework-agnostic — NO Lit types anywhere in this signature.
type RowKey = string | number;
type Cleanup = () => void;
type ExpandedRowElement = (host: HTMLElement, row: TableRow, key: RowKey) => Cleanup | void;
type GetRowKey = (row: TableRow, index: number) => RowKey;
```

**Slots:** `toolbar`, `footer`, `empty`
**Events:** `reke-row-click` (`{ row, index }`), `reke-sort` (`{ key, direction }`), `reke-row-expand` (`{ row, index, key, expanded }`)
**Methods:** `toggleExpand(target: number | RowKey)` — toggles expand state and emits `reke-row-expand`. `isRowExpanded(key: RowKey): boolean`.
**Parts:** `table`, `header`, `body`, `row`, `cell`, `header-cell`, `toolbar`, `footer`, `expand-row`, `expand-content`, `expand-toggle-cell`, `expand-toggle-button`

```ts
// Simple table with rich cells
table.columns = [
  { key: 'name', header: 'Name' },
  { key: 'status', header: 'Status', render: (val) => html`<reke-badge>${val}</reke-badge>` },
  { key: 'actions', header: '', sortable: false, render: () => html`<button>Edit</button>` },
];
table.rows = [{ name: 'Alice', status: 'Active' }];

// Expandable table — opt in to the built-in chevron column for a11y wins
table.expandable = true;
table.getRowKey = (row) => row.ticker;          // stable identity across sort
table.columns = [
  { key: 'ticker', header: 'ticker', width: '200px', render: (_, row) => html`
    <div><strong>${row.pair}</strong><br/><small>${row.dateRange}</small></div>
  `},
  // ...more rich columns; no need to hand-roll a chevron column anymore.
];

// VANILLA-DOM expand (no Lit, no React) — proves the framework-agnostic contract
table.expandedRowElement = (host, row, key) => {
  const panel = document.createElement('div');
  panel.textContent = `details for ${row.pair} (${key})`;
  host.appendChild(panel);
  return () => panel.remove();   // cleanup runs on collapse / removal / disconnect
};

// LIT expand — render a template into the host and return a cleanup
import { render, html } from 'lit';
table.expandedRowElement = (host, row) => {
  render(
    html`<reke-table borderless dense .columns=${subCols} .rows=${row.trades}></reke-table>`,
    host,
  );
  return () => render(html``, host);   // tear down the Lit render
};
```

#### React usage

React consumers import from `reke-ui/react`. The wrapper accepts React-native render output — return `ReactNode`, NEVER `import { html } from 'lit'` in app code. The bridge mounts React directly into the host node provided by the core callback (no `TemplateResult` ever travels through the bridge — this is the definitive fix for the dual-`lit` `[object Object]` rendering bug).

```tsx
import { Table, type ReactTableColumn, type RekeTable } from 'reke-ui/react';

<Table<Position>
  columns={columns}
  rows={rows}
  expandable                                          // opt-in chevron with a11y
  getRowKey={(r) => r.ticker}                         // stable, no remount on sort
  expandedRowRender={(row, key) => <DetailsPanel data={row} keyHint={key} />}
/>
```

Full contract (props, anti-patterns, when to use `forwardRef` for imperative methods) lives in the `reke-ui-consumer` agent skill — install with `npx reke-ui install-skills`.

> **Migration from v0.1.x**: the legacy `expandedRowRender` (Lit `TemplateResult`-returning) API and the `ExpandedRowRenderer` type export are REMOVED. Migrate to `expandedRowElement(host, row, key) => Cleanup | void`. See the CHANGELOG entry for v0.2.0 and the breaking-change details below.

---

### reke-date-range

Date picker with custom calendar dropdown. Supports single date and range selection modes. Calendar navigation includes month arrows (`<` `>`) and year arrows (`<<` `>>`).

| Property | Type | Default | Attribute |
|----------|------|---------|-----------|
| `mode` | `'single' \| 'range'` | `'range'` | `mode` |
| `value` | `string` | `''` | `value` |
| `from` | `string` | `''` | `from` |
| `to` | `string` | `''` | `to` |
| `label` | `string` | `''` | `label` |
| `placeholder` | `string` | `''` | `placeholder` |
| `min` | `string` | `''` | `min` |
| `max` | `string` | `''` | `max` |
| `disabled` | `boolean` | `false` | `disabled` |
| `error` | `boolean` | `false` | `error` |

**Types:** `DatePickerMode = 'single' | 'range'`
**Events:** `reke-change` — single: `{ value }`, range: `{ from, to }`
**Parts:** `trigger`, `calendar`

**Range mode behavior:**
- First click selects `from`, second click selects `to` (auto-swaps if `to < from`).
- If the user clicks outside, presses Escape, or toggles the trigger closed **after selecting only `from`**, the component auto-completes by setting `to = from` (single-day range) and emits `reke-change`.
- "Hoy" button: if no selection yet, sets both `from` and `to` to today. If mid-range-select (`from` already picked), uses today as `to` (auto-swaps if today < `from`). "Limpiar" clears both and emits `reke-change` with empty strings.

```html
<!-- Single date -->
<reke-date-range mode="single" label="Date" value="2026-02-25"></reke-date-range>

<!-- Date range (default) -->
<reke-date-range label="Period" from="2026-01-01" to="2026-02-25"></reke-date-range>

<!-- With min/max constraints -->
<reke-date-range mode="single" min="2026-01-01" max="2026-12-31"></reke-date-range>
```

---

### reke-file-upload

Drag-and-drop file upload zone with click-to-browse.

| Property | Type | Default | Attribute |
|----------|------|---------|-----------|
| `accept` | `string` | `''` | `accept` |
| `hint` | `string` | `''` | `hint` |
| `disabled` | `boolean` | `false` | `disabled` |
| `error` | `boolean` | `false` | `error` |
| `errorMessage` | `string` | `''` | `error-message` |
| `compact` | `boolean` | `false` | `compact` |

**Events:** `reke-file-select` (`{ file: File }`), `reke-file-clear`
**Methods:** `clear()`
**Parts:** `dropzone`

```html
<reke-file-upload accept=".csv,.xlsx" hint="Max 10MB"></reke-file-upload>
<reke-file-upload compact accept="image/*"></reke-file-upload>
```

---

### reke-alert

Inline alert with color variants. Content entirely via slot (KISS approach).

| Property | Type | Default | Attribute |
|----------|------|---------|-----------|
| `variant` | `'success' \| 'error' \| 'warning' \| 'info'` | `'info'` | `variant` |
| `dismissible` | `boolean` | `false` | `dismissible` |

**Slots:** default (alert content — icons, text, anything)
**Events:** `reke-close` (on dismiss, also removes element from DOM)
**Parts:** `alert`

```html
<reke-alert variant="success" dismissible>
  Operation completed successfully.
</reke-alert>
```

---

### reke-toast

Compact notification toast with icon, optional action button, and auto-dismiss.

| Property | Type | Default | Attribute |
|----------|------|---------|-----------|
| `variant` | `'success' \| 'error' \| 'warning' \| 'info'` | `'success'` | `variant` |
| `message` | `string` | `''` | `message` |
| `action` | `string` | `''` | `action` |
| `duration` | `number` | `0` | `duration` |

**Events:** `reke-close` (on dismiss), `reke-action` (action button clicked)
**Methods:** `dismiss()`
**Parts:** `toast`

```html
<reke-toast variant="success" message="File saved" duration="3000"></reke-toast>
<reke-toast variant="error" message="Upload failed" action="Retry"></reke-toast>
```

---

### reke-chip

Toggleable chip/pill for filters, tags, and selections. Supports color themes, active state, and optional dismiss button.

| Property | Type | Default | Attribute |
|----------|------|---------|-----------|
| `color` | `'primary' \| 'secondary' \| 'danger' \| 'warning'` | `'primary'` | `color` |
| `active` | `boolean` | `false` | `active` |
| `dismissible` | `boolean` | `false` | `dismissible` |
| `dismissLabel` | `string` | `'Dismiss'` | `dismiss-label` |
| `disabled` | `boolean` | `false` | `disabled` |

**Types:** `ChipColor = 'primary' | 'secondary' | 'danger' | 'warning'`
**Slots:** default (label text), `prefix` (content before the label — e.g. `<img>`, `<svg>`)
**Events:** `reke-click` (chip body clicked), `reke-dismiss` (dismiss button clicked)
**Parts:** `chip`, `chip-prefix`, `dismiss`

```html
<!-- Filter chips (secondary/blue for exchange filters) -->
<reke-chip color="secondary" active>All</reke-chip>
<reke-chip color="secondary">Binance</reke-chip>
<reke-chip color="secondary">MEXC</reke-chip>

<!-- Saved views (primary/green with dismiss) -->
<reke-chip color="primary" active dismissible>All trades</reke-chip>
<reke-chip color="primary" dismissible>Binance only</reke-chip>

<!-- With a prefix (image/icon sized via --reke-chip-prefix-size) -->
<reke-chip color="secondary" dismissible>
  <img slot="prefix" src="/coins/btc.png" alt="" />
  Bitcoin
</reke-chip>
```

---

### reke-pie-chart

Circular (pie / donut) chart rendered with ECharts, fully isolated in Shadow DOM. Framework-agnostic (works in React/Vue via the Web Component). Native ECharts animations and loading spinner; no custom skeleton.

| Property | Type | Default | Attribute |
|----------|------|---------|-----------|
| `data` | `PieChartDatum[]` | `[]` | JS only |
| `variant` | `'pie' \| 'donut'` | `'donut'` | `variant` |
| `label` | `string` | `'Pie chart'` | `label` |
| `size` | `number` | fills container | `size` |
| `showLegend` | `boolean` | `false` | `show-legend` |
| `loading` | `boolean` | `false` | `loading` |
| `palette` | `string[]` | `--reke-chart-*` tokens | JS only |

**Types:** `PieChartDatum = { name: string; value: number; color?: string }`, `PieChartVariant = 'pie' | 'donut'`, `PieChartSelectDetail = { name: string; value: number; percent: number }`
**Events:** `reke-pie-chart-select` (`{ name, value, percent }` — fired when a slice is clicked)
**Parts:** `chart`
**A11y:** `role="img"` + generated `aria-label`, a visually-hidden data list (canvas is opaque to screen readers), and ECharts `aria.enabled`.
**Colors:** defaults to the `--reke-chart-1..6` tokens (resolved at runtime, respects theme). Override the tokens, pass `palette`, or set `color` per datum.

```ts
const chart = document.querySelector('reke-pie-chart');
chart.data = [
  { name: 'Chrome', value: 62 },
  { name: 'Firefox', value: 18 },
  { name: 'Safari', value: 12 },
];
```

```html
<reke-pie-chart variant="donut" size="280" show-legend label="Browser share"></reke-pie-chart>
```

---

### reke-progress

A thin progress bar supporting single-value, multi-segment, and indeterminate modes.

| Property | Type | Default | Attribute |
|----------|------|---------|-----------|
| `value` | `number` | `0` | `value` |
| `color` | `string` | `''` | `color` |
| `segments` | `RekeProgressSegment[]` | `[]` | JS only |
| `indeterminate` | `boolean` | `false` | `indeterminate` |

**Types:** `RekeProgressSegment = { value: number; color: string }`
**Parts:** `track`, `segment`
**Tokens:** `--reke-progress-height` (4px), `--reke-progress-radius` (9999px), `--reke-progress-color` (defaults to `--reke-color-primary`), `--reke-progress-track-color` (themed per light/dark)
**A11y:** `role="progressbar"` on the track with `aria-valuemin/max/now`. A host-level `aria-label` is forwarded across the shadow boundary — consumers **should** set it, otherwise axe `aria-progressbar-name` fails.

**Behavior:**
- `value` is clamped to 0–100.
- `segments` takes precedence over `value`/`color`. Max 3 segments; each `value` is that segment's **width** in percent, widths accumulate and clamp at 100.
- `indeterminate` ignores `value` and `segments`, animates the bar, and omits `aria-valuenow` (per ARIA spec).

```html
<reke-progress value="72" aria-label="Upload progress"></reke-progress>
<reke-progress value="40" color="#F59E0B" aria-label="Storage used"></reke-progress>
<reke-progress indeterminate aria-label="Loading"></reke-progress>
```

```ts
const bar = document.querySelector('reke-progress');
// Widths, not cumulative stops: 50% + 30% + 10% = 90% filled.
bar.segments = [
  { value: 50, color: '#22C55E' },
  { value: 30, color: '#3B82F6' },
  { value: 10, color: '#EF4444' },
];
```

---

## Usage Patterns for trades-frontend

### Card as table wrapper

Card `variant="default"` with `padding="none"` already has `overflow: hidden` + same bg/border tokens as the raw divs:

```html
<reke-card variant="default" padding="none">
  <reke-table .columns=${columns} .rows=${rows}></reke-table>
</reke-card>
```

### Dialog for confirmations

Dialog adapts to content size — no compact mode needed:

```html
<reke-dialog heading="Delete view?">
  <p>Are you sure you want to delete "Binance only"?</p>
  <div slot="footer">
    <reke-button variant="ghost">Cancel</reke-button>
    <reke-button variant="danger">Delete</reke-button>
  </div>
</reke-dialog>
```

### Toast from React

```tsx
const [toasts, setToasts] = useState<{ id: number; message: string; variant: string }[]>([]);

const showToast = (message: string, variant: 'success' | 'error') => {
  setToasts(prev => [...prev, { id: Date.now(), message, variant }]);
};

// In JSX:
<div style={{ position: 'fixed', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
  {toasts.map(t => (
    <Toast key={t.id} message={t.message} variant={t.variant} duration={3000}
      onRekeClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
  ))}
</div>
```

### Tooltip inline in tables

`:host { display: inline-block }` works inside table cells:

```html
<reke-tooltip text="Profit and Loss"><span>PnL</span></reke-tooltip>
<reke-tooltip text="First In, First Out"><span>FIFO</span></reke-tooltip>
```

### Token migration (hex → CSS custom properties)

| Hardcoded | Token |
|-----------|-------|
| `#E5E5E5` | `var(--reke-color-text)` |
| `#525252` | `var(--reke-color-text-muted)` |
| `#737373` | `var(--reke-color-text-ghost)` |
| `#3B3B3B` | `var(--reke-color-text-disabled)` |
| `#1A1A1A` | `var(--reke-color-surface)` |
| `#151515` | `var(--reke-color-surface-elevated)` |
| `#252525` | `var(--reke-color-border)` |
| `#1F1F1F` | `var(--reke-color-border-subtle)` |
| `#22C55E` | `var(--reke-color-primary)` |
| `#3B82F6` | `var(--reke-color-secondary)` |
| `#EF4444` | `var(--reke-color-danger)` |
| `#F59E0B` | `var(--reke-color-warning)` |
| `#0A0A0B` | `var(--reke-color-bg)` |
| `#0F0F10` | `var(--reke-color-bg-section)` |

---

## Event Conventions

- All events prefixed with `reke-`
- All events use `composed: true, bubbles: true, cancelable: true`
- Emitted via `this.emit(name, detail)` from `RekeElement`
- Never emitted when `disabled`

## CSS Part Conventions

- Every component exposes at least one `::part()`
- Parts named after their semantic role (e.g., `button`, `input`, `trigger`, `row`, `cell`)

## Test Conventions

- Test file mirrors component: `reke-{name}.test.ts`
- Three sections: `// --- RENDERING ---`, `// --- BEHAVIOR ---`, `// --- ACCESSIBILITY ---`
- Helpers: `createElement(html)`, `waitForUpdate(el)`
- A11y: `runAxe(wrapper)` from `src/test-utils/a11y.ts`, filter `color-contrast`
- `vi.useFakeTimers()` does NOT work in browser mode — use real timers with short durations

## Commands

```bash
npm run dev          # Storybook on port 6006
npm run test:run     # Run all tests once
npm test             # Tests in watch mode
npm run build        # Vite build + tsc declarations
npm run lint         # Type-check (tsc --noEmit)
npm run analyze      # Generate custom-elements.json
```

---

## Component Inventory

| # | Tag | Category | Variants/Sizes | Tests | Stories |
|---|-----|----------|----------------|-------|---------|
| 1 | `reke-button` | Action | 6 variants, 4 sizes (xs/sm/md/lg) | 11 | 11 |
| 2 | `reke-input` | Form | 4 sizes (xs/sm/md/lg), prefix/suffix slots, native attrs | 12 | 5 |
| 3 | `reke-textarea` | Form | 3 sizes | 8 | 4 |
| 4 | `reke-checkbox` | Form | checked, indeterminate | 8 | 5 |
| 5 | `reke-toggle` | Form | checked | 7 | 4 |
| 6 | `reke-badge` | Display | 6 variants, 2 sizes | 5 | 5 |
| 7 | `reke-card` | Layout | 3 variants, 4 paddings | 4 | 5 |
| 8 | `reke-tooltip` | Overlay | 4 positions | 5 | 3 |
| 9 | `reke-dialog` | Overlay | modal, drawer | 9 | 5 |
| 10 | `reke-select` | Form | 3 sizes | 8 | 5 |
| 11 | `reke-table` | Data | striped, dense, hoverable, bordered, expandable | 64 | 11 |
| 12 | `reke-date-range` | Form | single, range | 23 | 9 |
| 13 | `reke-file-upload` | Form | default, compact | 10 | 4 |
| 14 | `reke-alert` | Feedback | 4 variants | 8 | 7 |
| 15 | `reke-toast` | Feedback | 4 variants | 11 | 4 |
| 16 | `reke-chip` | Selection | 4 colors, active, dismissible, prefix slot | 15 | 9 |
| 17 | `reke-combobox` | Form | 3 sizes, searchable, images, multiple/tags, optionRender | 37 | 12 |
| 18 | `reke-pie-chart` | Data | pie, donut, legend, loading | 6 | 4 |
| 19 | `reke-menu` | Overlay | coords or anchor, context menu, keyboard nav | 11 | 3 |
| 20 | `reke-menu-item` | Overlay | 2 variants (default/danger), disabled | 5 | 2 |
| 21 | `reke-progress` | Feedback | single value, up to 3 segments, indeterminate | 17 | 4 |

---

<!-- DOC_UPDATE_MARKER: Do not remove. Used by automation to detect stale docs. -->
<!-- Component count: 21 | Test count: 307 | Last sync: 2026-08-15 -->
