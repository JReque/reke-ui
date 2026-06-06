# Design: reke-table host-callback expand contract

## Technical Approach

Collapse the dual expand API to a single framework-agnostic host-callback. `reke-table` owns the host node identity per row key in a private `Map<RowKey, HTMLElement>`, mounts/cleans through a sibling `Map<RowKey, Cleanup>`, and diffs both maps every `updated()` cycle against the current expanded-key set. The expand `<td>` injects the cached host via Lit's `ref()` directive so node identity survives any unrelated re-render. The React bridge stops using `` html`${host}` `` everywhere (cells AND expand) and instead passes a real `expandedRowElement` callback that owns its own `createRoot`/`flushSync`/`unmount` lifecycle. State migrates from `Set<number>` to `Set<RowKey>`; the public API gains a key-based overload while keeping an index-based ergonomic entry point.

Maps to proposal Approach §1-§7 and spec Requirements 1-6.

## Architecture Decisions

### Decision: Host injection mechanism

| Option | Tradeoff | Decision |
|---|---|---|
| Direct node interpolation `${cachedHost}` | Lit treats node as a child part; safe in isolation but `_renderRow` returns a fresh `TemplateResult` per render and lit-html may re-insert the node into a fresh DOM position, breaking host identity guarantees under fast updates. | Reject |
| `ref()` directive bound to a stable callback stored per row key | Lit attaches/detaches via the ref API; the cached host is `appendChild`-ed once and survives template re-renders because we control the DOM mutation. | **Choose** |

**Rationale**: `ref()` gives us a deterministic mount point with a callback we own; we decide when to `appendChild(cachedHost)`. Direct interpolation works for one-shot inserts but is brittle under the spec's "parent re-render preserves host identity" requirement.

### Decision: Diff algorithm location

| Option | Tradeoff | Decision |
|---|---|---|
| Diff in `willUpdate(changed)` before render | Cleaner: render reads already-cleaned cache. But `willUpdate` is sync with render and forbids DOM ops. | Reject |
| Diff in `updated(changed)` after render | DOM committed; safe to detach orphan hosts and call cleanup. Risk: a one-frame lag where stale host is in the cache. Acceptable because render reads `expandedRows`, not the cache. | **Choose** |

**Rationale**: spec requires cleanup runs ON collapse and ON row removal. `updated()` is the only Lit hook where post-render DOM and cleanup side effects are legal. The render path only uses `expandedRows` membership; the cache lookup happens inside the `ref()` callback, which fires AFTER `updated()` has reconciled.

### Decision: Row-key API shape

| Option | Tradeoff | Decision |
|---|---|---|
| `getRowKey: (row, i) => RowKey` function only | Flexible; matches React/Vue conventions. Requires consumers to write a closure. | **Choose** |
| `rowKey: string` path + `getRowKey` function | Two ways to do the same thing; widens surface. | Reject |

**Rationale**: spec already locks the function form (`getRowKey(row, index) => string | number`). Default `String(index)` keeps existing consumers working.

### Decision: `toggleExpand` signature

| Option | Tradeoff | Decision |
|---|---|---|
| Break to `toggleExpand(key: RowKey)` only | Cleanest. Breaks every existing call site. | Reject |
| Overload: `toggleExpand(target: number \| RowKey)` — numbers treated as index, strings as key | Preserves ergonomic chevron click handlers internal to the component while exposing key-based API publicly. Ambiguity when keys are numeric. | **Choose** with rule: when `getRowKey` is set, callers SHOULD pass keys; the component resolves index→key internally. |

**Rationale**: chevron column knows the row index at render time, so passing `index` is natural. External consumers (event handlers, programmatic toggles) get the key-based path. Duplicate-key policy (last-wins) makes the resolution deterministic.

### Decision: Opt-in `expandOnRowClick`

| Option | Tradeoff | Decision |
|---|---|---|
| Make row-click toggle expand by default | Convenient, but breaking: every existing consumer that already wires a `reke-row-click` handler that calls `toggleExpand` would double-toggle and net to no change. | Reject |
| Add `expandOnRowClick: boolean` prop, default `false` | Non-breaking; consumers opt in. Pairs naturally with `expandable` for a11y. Carries a clear double-wiring caveat in JSDoc (use EITHER the prop OR a hand-rolled `reke-row-click` handler — not both). | **Choose** |
| Suppress `reke-row-click` when `expandOnRowClick=true` | Cleaner mental model but silently breaks consumers that listen for the event (e.g., analytics / nav). | Reject |

**Rationale**: a11y stance — we do NOT add `role="button"` or `tabindex` to the `<tr>`. Row-click is a POINTER convenience only; the accessible keyboard / screen-reader path remains the chevron `<button>` rendered when `expandable=true`. JSDoc documents the recommended pairing with `expandable` and the double-wiring caveat. The chevron button calls `stopPropagation()`, so it does NOT double-toggle through the row handler — verified by a dedicated test.

### Decision: Chevron column position

| Option | Tradeoff | Decision |
|---|---|---|
| Always leading | Simple; matches industry default. | **Choose** |
| `expandableColumnPosition: 'start' \| 'end'` prop | More flexible; YAGNI for v1. | Reject — defer until a real consumer needs it. |

Exposed as CSS part `expand-toggle-cell` and `expand-toggle-button` for styling. Fixed width via internal class; consumer overrides via `::part(expand-toggle-cell) { width: ... }`.

### Decision: Bridge cell-render path

| Option | Tradeoff | Decision |
|---|---|---|
| Keep `` html`${entry.host}` `` for cells | Asymmetric with expand path; same dual-lit failure mode applies. | Reject |
| Return the raw host DOM node from `column.render` | Lit `render` already supports `HTMLElement \| Node` return type; no `TemplateResult` involved. Symmetric with expand fix. Backward-compat: string/Node passthrough stays. | **Choose** |

**Rationale**: the original failure (`[object Object]` from cross-realm `TemplateResult` brand check) applies equally to cells. Returning raw nodes eliminates Lit from the bridge's hot path entirely.

## Data Flow

```
    Consumer (React)                    reke-table (Lit)
    ────────────────                    ────────────────
    expandedRowElement   ──prop──→     this.expandedRowElement
    getRowKey            ──prop──→     this.getRowKey
                                                │
    toggleExpand(key) ←─event/method─  user interaction
                                                │
                                                ▼
                                       updated(changed)
                                                │
                              ┌─────────────────┼─────────────────┐
                              ▼                 ▼                 ▼
                       diff expandedKeys   for new keys:    for orphan keys:
                       vs _hostCache       create host,     run cleanup,
                                           ref() callback   delete entries
                                           → appendChild
                                                │
                                                ▼
                                       expandedRowElement(
                                         host, row, key
                                       ) → cleanup
                                                │
                                                ▼
                                       _cleanupMap.set(key, cleanup)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/components/reke-table/reke-table.ts` | Modify | Remove `expandedRowRender` prop + `ExpandedRowRenderer` type. Add `getRowKey`, `expandable`, `_hostCache`, `_cleanupMap`. Switch `expandedRows` to `Set<RowKey>`. Add diff logic to `updated()`. Add chevron column render. Replace `_renderExpandedElement` with `ref()`-based mount. Emit dev warning if legacy `expandedRowRender` is still set on the element. Rewrite JSDoc. |
| `src/components/reke-table/reke-table.styles.ts` | Modify | Add `.expand-toggle-cell` + `.expand-toggle-button` styles (width, chevron rotation, focus-visible outline). Add `[part="expand-toggle-cell"]` / `[part="expand-toggle-button"]`. |
| `src/components/reke-table/reke-table.test.ts` | Modify | Drop `expandedRowRender` tests. Add RENDERING tests for chevron column, BEHAVIOR tests for identity keying across sort + duplicate-key warning + sync cleanup-before-remount + disconnect cleanup + parent re-render preserves host identity, ACCESSIBILITY tests for `aria-expanded`/`aria-controls`/`Enter`/`Space` and `runAxe()` clean. |
| `src/components/reke-table/reke-table.stories.ts` | Modify | Remove `TemplateResult` expand story. Add: vanilla DOM host-callback story (framework-agnostic proof), chevron column story (`expandable=true`), identity-keyed sort story. |
| `src/react-bridge/table.ts` | Modify | Delete `wrappedExpanded` and `` html`${entry.host}` `` path. Replace with `wrappedExpandedElement: (host, row, key) => Cleanup` that creates a per-key `Root`, runs `flushSync(() => root.render(...))`, returns `() => root.unmount()`. Apply same raw-node return in cell wrapping (no `html\`${host}\``). Forward `getRowKey` to the web component. Keep `string \| TemplateResult \| Node` passthrough for cells. Drop the post-render GC effect (cleanup now happens inside reke-table via `updated()` diff + the cleanup function it received). |
| `src/index.ts` | Modify | Remove `ExpandedRowRenderer` export. Add `export type { ExpandedRowElement, RowKey, GetRowKey } from './components/reke-table/reke-table.js'`. |
| `custom-elements.json` | Regen | `npm run analyze` after API changes. |
| `README-DOC.md` | Modify | Rewrite expand section: single host-callback, identity keying, `expandable` opt-in. Remove all `expandedRowRender` examples. |

## Interfaces / Contracts

```typescript
// src/components/reke-table/reke-table.ts

export type RowKey = string | number;
export type Cleanup = () => void;
export type ExpandedRowElement = (
  host: HTMLElement,
  row: TableRow,
  key: RowKey,
) => Cleanup | void;
export type GetRowKey = (row: TableRow, index: number) => RowKey;

export class RekeTable extends RekeElement {
  @property({ attribute: false }) expandedRowElement: ExpandedRowElement | null = null;
  @property({ attribute: false }) getRowKey: GetRowKey | null = null;
  @property({ type: Boolean, reflect: true }) expandable = false;
  @property({ attribute: false }) expandedRows: Set<RowKey> = new Set();

  // private state
  private _hostCache = new Map<RowKey, HTMLElement>();
  private _cleanupMap = new Map<RowKey, Cleanup>();
  private _warnedDupKeys = new Set<RowKey>();
  private _legacyWarned = false;

  toggleExpand(target: number | RowKey): void;        // accepts index or key
  isRowExpanded(target: number | RowKey): boolean;
  private _resolveKey(row: TableRow, index: number): RowKey;
  private _ensureHost(key: RowKey, row: TableRow): HTMLElement;
  private _reconcileExpandedHosts(): void;            // called in updated()
}

// reke-row-expand event detail
interface RekeRowExpandDetail {
  row: TableRow;
  index: number;          // current array position, kept for backward-compat consumers
  key: RowKey;            // NEW — stable identity (spec req #6)
  expanded: boolean;
  // host: NOT included — caller already has access via getRowKey + DOM query if needed
}
```

```typescript
// src/react-bridge/table.ts — new expand shape

const wrappedExpandedElement: ExpandedRowElement = (host, row, key) => {
  // Per-key Root. Bridge keeps its own Map<RowKey, Root> for the cell path only.
  const root = createRoot(host);
  try { flushSync(() => root.render(userExpandedRow(row as TRow, key) as React.ReactElement)); }
  catch { root.render(userExpandedRow(row as TRow, key) as React.ReactElement); }
  return () => root.unmount();
};
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (Vitest browser) | Vanilla DOM mount/cleanup, identity-keyed expand survives sort, duplicate-key warning + last-wins, sync cleanup-before-remount, disconnect cleanup, host identity preserved across unrelated re-render, chevron renders only when `expandable=true`, event payload `{ key, row, expanded }` | `reke-table.test.ts` RENDERING + BEHAVIOR sections per `test-runner` skill |
| Accessibility | `aria-expanded` reflects state, `aria-controls` points to host `id`, Enter/Space toggle | `runAxe()` on chevron-on story + manual ARIA assertions |
| Integration (Storybook) | Vanilla DOM story (no Lit, no React) proves framework-agnosticism; chevron + sort story shows identity stability visually | `reke-table.stories.ts` |
| Bridge (Vitest) | React `createRoot` mounted into host, cleanup unmounts, sort does NOT remount root, `getRowKey` forwarded | New cases in existing bridge tests |

## Migration / Rollout

Breaking change, accepted by product (see proposal Risk row 1).
- CHANGELOG entry marked **BREAKING**.
- Dev-mode one-shot `console.error` if `expandedRowRender` is still set on `<reke-table>` after this version, naming the deprecated prop and the new contract.
- Downstream `pnl-track-frontend` migration ticket filed BEFORE reke-ui release tag.
- No data migration, no feature flag.

## Open Questions

- [ ] Should `_warnedDupKeys` reset when `rows` reference changes, or persist across renders? Lean: persist (warn-once per key per session); revisit if noisy.
- [ ] CSS part name for the chevron icon itself (`expand-chevron`) — confirm in styles PR.
