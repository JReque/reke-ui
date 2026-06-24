# Delta for reke-table

## Scope Note

Encodes the framework-agnostic expand contract for `reke-table`. Out of scope: Vue bridge (deferred; agnosticism proven via vanilla-DOM scenario), and pnl-track-frontend consumer migration (downstream). All scenarios are verifiable under Vitest browser mode + axe.

## ADDED Requirements

### Requirement: Framework-Agnostic Expand Contract

The system SHALL expose `expandedRowElement(host, row, key) => Cleanup | void` as the SOLE expand API. `Cleanup = () => void`. The signature MUST NOT reference any Lit type. A consumer mounting raw DOM (no Lit, no React) MUST be a valid implementation.

#### Scenario: Vanilla DOM mount and cleanup

- GIVEN a `reke-table` with `expandedRowElement = (host) => { const n = document.createElement('div'); n.textContent = 'raw'; host.appendChild(n); return () => n.remove(); }`
- WHEN a row is expanded
- THEN `host` is a real `HTMLElement` attached under the row and contains the `<div>raw</div>`
- AND WHEN the row is collapsed
- THEN the returned cleanup runs exactly once and the node is removed

#### Scenario: No Lit types in public surface

- GIVEN the exported types from `src/index.ts`
- WHEN inspecting `ExpandedRowElement` and `RowKey`
- THEN neither references `TemplateResult` nor any `lit*` module

### Requirement: Identity-Keyed Expand State

The system SHALL key expand state, host cache, and cleanup map by row identity, NOT array index. A `getRowKey(row, index) => string | number` prop MUST be supported. When `getRowKey` is omitted, the system SHALL fall back to `String(index)` and document this as identity-equivalent only when rows are stable.

#### Scenario: Expanded row follows identity after sort

- GIVEN rows `[A,B,C]` with `getRowKey = r => r.id` and row `B` expanded
- WHEN the data is reordered to `[C,B,A]`
- THEN `B` remains expanded and `A`, `C` remain collapsed
- AND the host element previously associated with `B` is reused (no new host created)

#### Scenario: Duplicate row-key policy

- GIVEN `getRowKey` returns the same value for two distinct rows
- WHEN the table renders in development mode (`import.meta.env.DEV`)
- THEN a one-shot `console.warn` is emitted naming the duplicate key
- AND the LAST row with that key wins for expand bookkeeping (documented precedence)

### Requirement: Stable Host Caching

The system SHALL cache the host element for each expanded row by stable row key in a private `Map<RowKey, HTMLElement>` that survives re-renders. The system MUST NOT recreate the host, MUST NOT call cleanup, and MUST NOT remount the consumer framework root when the parent re-renders for unrelated reasons.

#### Scenario: Parent re-render preserves host identity

- GIVEN row `B` is expanded with host `h1` and a consumer-mounted React root inside `h1`
- WHEN the parent triggers a re-render that does NOT change `B`'s key
- THEN the host element for `B` remains `===` `h1`
- AND the cleanup for `B` has NOT been invoked
- AND the React root has NOT been unmounted

#### Scenario: Orphan host cleanup on key removal

- GIVEN row `B` is expanded
- WHEN the data updates such that `B`'s key is no longer present
- THEN `B`'s cleanup runs exactly once
- AND `B`'s entries are removed from the host cache and cleanup map

### Requirement: Cleanup Lifecycle and Ordering

The system SHALL invoke each row's cleanup exactly once on: collapse, row removal, and table `disconnectedCallback`. For rapid expand → collapse → expand of the same key, the previous cleanup MUST run synchronously BEFORE the next mount.

#### Scenario: Cleanup fires once on collapse

- GIVEN row `B` is expanded with a mocked cleanup `fn`
- WHEN the row is collapsed via `toggleExpand(key)`
- THEN `fn` has been called exactly once

#### Scenario: Synchronous cleanup before remount

- GIVEN row `B` is expanded with cleanup `fn1`
- WHEN `toggleExpand(key)` is called to collapse and again to re-expand within the same task
- THEN `fn1` runs before `expandedRowElement` is invoked for the new mount
- AND a new cleanup `fn2` is registered

#### Scenario: Cleanup on disconnect

- GIVEN rows `A` and `B` are expanded
- WHEN the `<reke-table>` element is removed from the DOM
- THEN cleanup for both `A` and `B` is invoked exactly once each

### Requirement: Opt-In Chevron Column

The system SHALL accept an opt-in `expandable: boolean` prop (default `false`). When `true`, `reke-table` MUST prepend a leading toggle column with: a button that invokes `toggleExpand(key)`, `aria-expanded` reflecting expand state, `aria-controls` pointing to the host element id, and keyboard activation via `Enter` and `Space`. When `false`, the system MUST NOT render any chevron and existing consumers with hand-built toggles MUST remain unaffected.

#### Scenario: Chevron ON renders accessible toggle

- GIVEN `<reke-table expandable .columns=${cols} .data=${rows}>` with `expandable=true`
- WHEN the table renders
- THEN each row has a leading `<button>` with `aria-expanded="false"` and `aria-controls` set to the host id
- AND axe-core reports zero violations
- AND pressing `Enter` or `Space` on the button toggles expand state and updates `aria-expanded`

#### Scenario: Chevron OFF leaves rows unchanged

- GIVEN `<reke-table>` without `expandable` set
- WHEN the table renders
- THEN no extra leading column is added
- AND no chevron button is rendered

### Requirement: Row-Key Surfaced in Events and API

The system SHALL surface the row key through `toggleExpand(key)`, `isRowExpanded(key)`, and the `reke-row-expand` event detail (`{ key, row, expanded }`). Public APIs MUST accept the same `RowKey` type returned by `getRowKey`.

#### Scenario: Event payload includes row key

- GIVEN row `B` with `getRowKey(B) === 'b-1'`
- WHEN `B` is expanded via the chevron column
- THEN a `reke-row-expand` event fires with `detail.key === 'b-1'` and `detail.expanded === true`

## REMOVED Requirements

### Requirement: Lit TemplateResult Expand API (`expandedRowRender`)

(Reason: dual expand APIs forced framework bridges to translate between Lit templates and framework trees, and the `TemplateResult` brand check crashes with `[object Object]` whenever two `lit` instances coexist in the consumer realm — symlink, `bun link`, or micro-frontend duplication. Consolidating to a single host-callback eliminates the failure mode and removes Lit from the public expand surface.)

(Migration: replace `expandedRowRender={(row, i) => html`...`}` with `expandedRowElement={(host, row, key) => { /* mount, return cleanup */ }}`. React consumers use the bridge's `wrappedExpandedElement` (`createRoot(host)` + `flushSync` + `() => root.unmount()`). Add `getRowKey` if rows have a stable identity (recommended). The export `ExpandedRowRenderer` is removed; use `ExpandedRowElement` and `RowKey`.)

## Verification Notes

- All scenarios above MUST be covered under Vitest browser mode (`npm run test:run`) across RENDERING, BEHAVIOR, and ACCESSIBILITY sections of `reke-table.test.ts`.
- ACCESSIBILITY scenarios MUST be validated via `runAxe()` from `src/test-utils/a11y.ts`.
- The CEM (`custom-elements.json`) MUST be regenerated via `npm run analyze` after the API change and committed.
