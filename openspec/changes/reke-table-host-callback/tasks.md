# Tasks: reke-table Host-Callback Expand Contract

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~720 total (Slice 1 ~340, Slice 2 ~140, Slice 3 ~240) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (core) → PR 2 (chevron+a11y) → PR 3 (bridge+docs) |
| Delivery strategy | ask-always |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Resolved
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain (tracker `feat/reke-table-host-callback`; PR 1 from `feat/reke-table-host-callback-core` → tracker)
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | reke-table core — host-callback contract, identity-keyed expand state, `getRowKey`, host cache via `ref()`, cleanup lifecycle, remove `expandedRowRender` | PR 1 | Base: `main`. Tests live with the component. Standalone — no bridge/docs yet. |
| 2 | Opt-in chevron column with ARIA + keyboard activation | PR 2 | Depends on PR 1. Base = stacked-to-main: `main`; feature-branch-chain: PR 1 branch. |
| 3 | React bridge rewrite, exports, CEM regen, README-DOC sync, vanilla-DOM conformance story/test | PR 3 | Depends on PR 1 (and PR 2 for docs of chevron). Base = stacked-to-main: `main`; feature-branch-chain: PR 2 branch. Downstream `pnl-track-frontend` migration depends on the entire release (post-PR 3). |

## Phase 1: Core — Host-Callback Contract (PR 1)

### 1.A Types and state migration

- [x] 1.1 In `src/components/reke-table/reke-table.ts`, add `RowKey = string | number`, `Cleanup = () => void`, `ExpandedRowElement`, `GetRowKey` type aliases (do NOT export yet — Slice 3 wires `src/index.ts`).
- [x] 1.2 Add `@property({ attribute: false }) getRowKey?: GetRowKey;` and private resolver `_resolveKey(row, index): RowKey` defaulting to `String(index)`.
- [x] 1.3 Switch `expandedRows` from `Set<number>` to `Set<RowKey>`. Update all internal reads/writes.
- [x] 1.4 Add private `_hostCache: Map<RowKey, HTMLElement>` and `_cleanupMap: Map<RowKey, Cleanup>`.
- [x] 1.5 Add dev-only `_warnedDupKeys: Set<RowKey>` for duplicate-key warning (persist for component lifetime).

### 1.B Public API surface

- [x] 1.6 Replace `expandedRowRender` property with `@property({ attribute: false }) expandedRowElement?: ExpandedRowElement;`. Remove the legacy property declaration entirely.
- [x] 1.7 Add dev-mode one-shot `console.error` in `willUpdate()` if the host element still has an `expandedRowRender` assigned (transient property check via `(this as any).expandedRowRender`).
- [x] 1.8 Overload `toggleExpand(target: number | RowKey)`: numbers → index lookup → key; strings → key direct. Update `isRowExpanded` to accept `RowKey`.
- [x] 1.9 Update `reke-row-expand` event detail to `{ row, index, key, expanded }` (host NOT included per design).

### 1.C Render path with `ref()`

- [x] 1.10 In the expanded-row `<td>` template, replace any `${cachedHost}` interpolation with Lit's `ref()` directive callback: callback appends cached host into the `<td>`, creating one if missing.
- [x] 1.11 Ensure the expanded `<td>` carries a stable `id` derived from the row key (used later by chevron `aria-controls` in Slice 2).

### 1.D Lifecycle: mount, cleanup, disconnect

- [x] 1.12 In `updated(changed)`, diff current expanded-key set against `_hostCache` and `_cleanupMap`:
  - keys newly expanded → call `expandedRowElement(host, row, key)`, store returned `Cleanup` (no-op if `void`).
  - keys newly collapsed or orphaned → invoke cleanup once, then delete from both maps.
- [x] 1.13 In `toggleExpand`, when collapsing-then-expanding the same key synchronously, run previous cleanup BEFORE registering new mount (sync ordering).
- [x] 1.14 Override `disconnectedCallback()`: invoke every cleanup once and clear both maps.
- [x] 1.15 Emit one-shot `console.warn` in dev when `getRowKey` returns the same value for two distinct rows in the current render; last-wins for bookkeeping.

### 1.E Tests (live with the code — `reke-table.test.ts`)

- [x] 1.16 RENDERING: vanilla-DOM `expandedRowElement` mounts a `<div>raw</div>` into the host (covers spec scenario "Vanilla DOM mount and cleanup" mount half).
- [x] 1.17 BEHAVIOR: collapse runs returned cleanup exactly once (spec "Cleanup fires once on collapse").
- [x] 1.18 BEHAVIOR: rapid expand→collapse→expand of same key runs old cleanup BEFORE new mount (spec "Synchronous cleanup before remount").
- [x] 1.19 BEHAVIOR: removing the `<reke-table>` element from DOM invokes cleanup for every expanded row exactly once (spec "Cleanup on disconnect").
- [x] 1.20 BEHAVIOR: `getRowKey` keeps row B expanded across `[A,B,C] → [C,B,A]` reorder; host element reference is reused (spec "Expanded row follows identity after sort").
- [x] 1.21 BEHAVIOR: parent re-render that does NOT change keys preserves host identity (`===`) and does NOT invoke cleanup (spec "Parent re-render preserves host identity").
- [x] 1.22 BEHAVIOR: removing row B from data invokes B's cleanup once and clears its cache entries (spec "Orphan host cleanup on key removal").
- [x] 1.23 BEHAVIOR: duplicate `getRowKey` emits one-shot dev `console.warn`; last row wins (spec "Duplicate row-key policy").
- [x] 1.24 BEHAVIOR: `reke-row-expand` detail includes `{ row, index, key, expanded }` (event-payload portion of spec "Event payload includes row key" — chevron trigger comes in Slice 2).

### 1.F Verify Slice 1

- [x] 1.25 `npm run test:run` — all tests green (includes the new component tests).
- [x] 1.26 `npm run lint` — `tsc --noEmit` clean.
- [x] 1.27 `npm run build` — production build succeeds.

## Phase 2: Chevron Column + A11y (PR 2)

- [x] 2.1 Add `@property({ type: Boolean, reflect: true }) expandable = false;` to `reke-table.ts`.
- [x] 2.2 When `expandable === true`, prepend a leading toggle column in the header and each row; do NOT mutate the consumer-provided `columns` array.
- [x] 2.3 Render chevron cell with `<button class="expand-toggle-button" part="expand-toggle-button" aria-expanded=${expanded} aria-controls=${hostId} @click=${...} @keydown=${enterSpaceHandler}>`. Expose `expand-toggle-cell` CSS part on the `<td>`.
- [x] 2.4 Keyboard handler activates on `Enter` and `Space` (preventDefault on Space to avoid page scroll).
- [x] 2.5 In `reke-table.styles.ts`, add `.expand-toggle-cell`, `.expand-toggle-button`, and `:focus-visible` styling using existing `--reke-*` tokens with fallbacks (no new tokens needed; reuse `--reke-color-primary`, `--reke-color-text`, `--reke-radius`).
- [x] 2.6 Fix JSDoc on the class header — remove any claim that chevron is auto-rendered; document `expandable` prop, `expand-toggle-cell`/`expand-toggle-button` CSS parts, and Enter/Space activation (R1 from sdd-init).
- [x] 2.7 ACCESSIBILITY test: `expandable=true` renders a leading `<button>` per row with `aria-expanded="false"` and `aria-controls` pointing to the host id; `runAxe()` zero violations (spec "Chevron ON renders accessible toggle" + axe portion).
- [x] 2.8 ACCESSIBILITY test: pressing `Enter` toggles expand and flips `aria-expanded` to `"true"`; pressing `Space` same (spec "Chevron ON renders accessible toggle" — keyboard portion).
- [x] 2.9 RENDERING test: without `expandable`, no leading column and no chevron button render (spec "Chevron OFF leaves rows unchanged").
- [x] 2.10 BEHAVIOR test: chevron click fires `reke-row-expand` with correct `detail.key` (completes spec "Event payload includes row key" started in 1.24).
- [x] 2.11 ACCESSIBILITY test: `runAxe()` passes on disabled/empty table with `expandable=true`.
- [x] 2.12 `npm run test:run`, `npm run lint`, `npm run build` — all green.

## Phase 3: React Bridge + Exports + Docs + Vanilla Story (PR 3)

### 3.A React bridge rewrite (`src/react-bridge/table.ts`)

- [ ] 3.1 Delete `wrappedExpanded` (the `expandedRowRender` wrapper that returned `` html`${entry.host}` ``).
- [ ] 3.2 Implement `wrappedExpandedElement: ExpandedRowElement` — on mount, `createRoot(host)` (cache by `key`), `flushSync(() => root.render(<userElement>))` with try/catch fallback to plain `root.render` (per `reke-bridge` skill).
- [ ] 3.3 Return cleanup `() => root.unmount()` from `wrappedExpandedElement`; drop the root from the bridge's host map.
- [ ] 3.4 Update cell renderers: when consumer's `column.render(row, i)` returns a React element, mount via cached root and return the raw host DOM `Node` (NOT `` html`${host}` ``). Pass through string/number/`TemplateResult` untouched.
- [ ] 3.5 Forward `getRowKey` from the React wrapper prop to the underlying `reke-table` element (assign via property, not attribute).
- [ ] 3.6 GC bridge-side host map after each render: unmount roots whose keys are no longer present.
- [ ] 3.7 On bridge unmount (React effect cleanup), unmount every cached root.

### 3.B Bridge tests (`src/react-bridge/table.test.tsx` — create or update)

- [ ] 3.8 BEHAVIOR: `expandedRowElement` consumer returning a React node mounts via `createRoot` and renders to the host (verify by querying the rendered React output inside the host).
- [ ] 3.9 BEHAVIOR: collapsing the row calls `root.unmount` (assert host children removed; spy on unmount if practical).
- [ ] 3.10 BEHAVIOR: sort that preserves keys does NOT remount React roots (spy on `createRoot` call count — should be 1 per key across reorder).
- [ ] 3.11 BEHAVIOR: `getRowKey` prop is forwarded and used by the bridge wrapper.
- [ ] 3.12 BEHAVIOR: cell `render` returning JSX is mounted via cached root; returning a string passes through.

### 3.C Exports and CEM

- [ ] 3.13 In `src/index.ts`, remove `ExpandedRowRenderer` export. Add `ExpandedRowElement`, `RowKey`, `GetRowKey`, `Cleanup` type exports.
- [ ] 3.14 Run `npm run analyze`. Verify `custom-elements.json` no longer references `expandedRowRender` and reflects `expandedRowElement`, `expandable`, `getRowKey`, and the updated `reke-row-expand` event payload. Commit the regenerated file.

### 3.D Vanilla-DOM conformance story + test (proves framework-agnosticism)

- [ ] 3.15 In `reke-table.stories.ts`, remove any TemplateResult expand story. Add a `VanillaDomExpand` story that uses `expandedRowElement = (host) => { const n = document.createElement('div'); n.textContent = 'raw'; host.appendChild(n); return () => n.remove(); }` (no Lit, no React imports).
- [ ] 3.16 Add `SortIdentity` story demonstrating `getRowKey` keeping the expanded row across sort, plus `ChevronToggle` story with `expandable=true`.
- [ ] 3.17 RENDERING+BEHAVIOR test in `reke-table.test.ts`: vanilla-DOM `expandedRowElement` cleanup removes the appended node on collapse (completes spec "Vanilla DOM mount and cleanup" cleanup half).
- [ ] 3.18 TYPE test (or `tsc --noEmit` check via a `.ts` file in `src/__type-checks__/`): `ExpandedRowElement` and `RowKey` from `reke-ui` do NOT reference `TemplateResult` or any `lit*` module (spec "No Lit types in public surface").

### 3.E Docs and changelog

- [ ] 3.19 Rewrite the Expand section of `README-DOC.md`: remove `expandedRowRender`, document `expandedRowElement(host, row, key) => Cleanup | void`, `getRowKey`, `expandable`, updated event payload, and migration snippet (per spec REMOVED requirement).
- [ ] 3.20 Add CHANGELOG `BREAKING` entry for the removal of `expandedRowRender` and `ExpandedRowRenderer` export; link the downstream `pnl-track-frontend` migration ticket.

### 3.F Verify Slice 3

- [ ] 3.21 `npm run test:run` — green (component + bridge + vanilla-DOM tests).
- [ ] 3.22 `npm run lint` — `tsc --noEmit` clean (includes type-only check from 3.18).
- [ ] 3.23 `npm run build` — production build succeeds.
- [ ] 3.24 `npm run analyze` — CEM regeneration is idempotent on a clean tree.

## Post-Release Follow-Up (NOT in these edit roots)

- [ ] 4.1 Downstream: migrate `pnl-track-frontend/src/modules/trading/components/PnlTable.tsx` to `expandedRowElement` + `getRowKey={row => row._raw.ticker}`. Tracked in a separate change; depends on the entire reke-ui release (PR 1 + PR 2 + PR 3 merged and published).
