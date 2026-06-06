# Proposal: reke-table host-callback expand contract

## Intent

`reke-table` has two parallel expand APIs (`expandedRowRender` returning a Lit `TemplateResult`, and `expandedRowElement` returning a host-callback). The React bridge wraps every framework render in `` html`${entry.host}` ``, which crashes with `[object Object]` whenever a consumer ends up with two `lit` instances (symlink, `bun link`, micro-frontend duplication) because the `TemplateResult` brand check fails across realms. The dual API also forces every new framework bridge to translate between Lit templates and framework trees.

Consolidate to ONE framework-agnostic expand contract — a host-callback that hands the consumer a real DOM node to mount into and returns a cleanup. This is the only contract immune to Lit duplication, virtualization-friendly, and trivially provable framework-agnostic.

## Scope

### In Scope
- Remove `expandedRowRender` (Lit `TemplateResult` API) from `reke-table.ts`, types, tests, stories, and exports.
- Make `expandedRowElement` the sole expand contract: `(host, row, key) => (() => void) | void`.
- Move expand state from index-keyed (`Set<number>`) to identity-keyed (`Set<RowKey>`) via a new `getRowKey` / `rowKey` concept on `reke-table` itself.
- Cache the expand host element by stable row key so in-window re-renders (virtualization, sort) do NOT remount the framework root.
- Add an opt-in built-in chevron/expand column (`expandable` prop, default OFF). Existing consumers with hand-built toggles are unaffected.
- Rewrite `react-bridge/table.ts` to route through `expandedRowElement` — create the React root inside the host that `reke-table` provides, return cleanup. No `` html`${host}` `` wrapping anywhere.
- Fix the JSDoc chevron mismatch (R1 from sdd-init).
- Prove framework-agnosticism with a vanilla DOM mount story + test.

### Out of Scope
- Vue bridge implementation (deferred — see Open Questions). The contract MUST be proven framework-agnostic via vanilla DOM, but no Vue subpath ships in this change.
- Downstream migration of `pnl-track-frontend/src/modules/trading/components/PnlTable.tsx` (different repo, different edit root — tracked as downstream impact).
- Backward-compat shim for `expandedRowRender`. Breaking change is accepted; first real consumer adopts the new contract now.
- Focus management on expand, ARIA wiring beyond what the chevron column needs, custom-row-virtualization helpers.

## Capabilities

### New Capabilities
- None. This change reshapes an existing capability.

### Modified Capabilities
- `reke-table`: the expand contract collapses from two APIs to one host-callback; expand state moves from index keying to row-identity keying; an opt-in chevron column is added; JSDoc is realigned with actual behavior.

## Approach

Single host-callback contract, identity-keyed state, host caching, opt-in chevron, bridge rewrite — done as one consolidated breaking change.

1. **Contract**: `expandedRowElement: (host: HTMLElement, row: TableRow, key: RowKey) => Cleanup | void`. `Cleanup = () => void`. No Lit types in the public surface.
2. **Row identity**: add `getRowKey?: (row, index) => string | number` (default = `String(index)`). All expand bookkeeping (`expandedRows`, host cache, cleanup map) is keyed by this value. `toggleExpand`, `isRowExpanded`, and the `reke-row-expand` event payload accept and surface the row key.
3. **Host caching**: a private `Map<RowKey, HTMLElement>` survives re-renders. On expand: reuse existing host or create one, call `expandedRowElement(host, row, key)`, store returned cleanup in `Map<RowKey, Cleanup>`. On collapse / row removal / disconnect: run cleanup, delete entries.
4. **Chevron column**: new `expandable: boolean` prop (default `false`). When true, `reke-table` prepends a leading column with a chevron button that calls `toggleExpand(key)` and carries `aria-expanded` / `aria-controls`. JSDoc is rewritten so docs no longer claim auto-chevron unless `expandable` is set.
5. **React bridge**: `wrappedExpanded` becomes `wrappedExpandedElement` — a `(host, row, key) => Cleanup` function. The bridge calls `createRoot(host)`, renders user JSX via `flushSync` (with the existing try/catch fallback), returns `() => root.unmount()`. The root and host live on the bridge side, keyed by row key; reke-table caches the host node and never wraps it in `` html`${...}` ``.
6. **Verify framework-agnosticism**: ship a Storybook story + Vitest test that mounts pure DOM (no Lit, no React) into the host and asserts cleanup runs on collapse.
7. **Docs + CEM**: regenerate `custom-elements.json` via `npm run analyze`; update `README-DOC.md` expand section.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/components/reke-table/reke-table.ts` | Modified | Remove `expandedRowRender` + type. Make `expandedRowElement` the sole expand prop. Add `getRowKey`. Switch `expandedRows` to `Set<RowKey>`. Add `expandable` chevron column. Host cache + identity-keyed cleanup map. Rewrite JSDoc. |
| `src/components/reke-table/reke-table.test.ts` | Modified | Drop `expandedRowRender` tests. Add RENDERING / BEHAVIOR / ACCESSIBILITY coverage for host-callback, row-identity keying across sort, host caching, opt-in chevron column (incl. `aria-expanded`), and vanilla DOM mount/cleanup. |
| `src/components/reke-table/reke-table.stories.ts` | Modified | Remove Lit `TemplateResult` expand story. Add: (a) vanilla DOM host-callback story (framework-agnostic proof), (b) chevron column story. |
| `src/react-bridge/table.ts` | Modified | Remove `wrappedExpanded` / `` html`${entry.host}` `` path. Add `wrappedExpandedElement` host-callback that uses `createRoot` + `flushSync` + cleanup, keyed by `getRowKey`. GC unused roots per render. |
| `src/index.ts` | Modified | Drop `ExpandedRowRenderer` export. Export new `ExpandedRowElement` and `RowKey` types. |
| `custom-elements.json` | Modified | Regenerate via `npm run analyze` after API change. |
| `README-DOC.md` | Modified | Update expand section: single host-callback contract, identity keying, `expandable` opt-in chevron. Remove `expandedRowRender` references. |

### Downstream (NOT edited in this change)
- `pnl-track-frontend/src/modules/trading/components/PnlTable.tsx`: drop bridge `expandedRowRender` usage, adopt new contract, pass `getRowKey={row => row._raw.ticker}`. Tracked as a separate downstream task in `pnl-track-frontend`.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Breaking change blast radius (every existing `expandedRowRender` caller breaks) | High | Accepted by product. CHANGELOG marks BREAKING; downstream migration ticket filed for pnl-track-frontend before reke-ui release. |
| Cleanup ordering on rapid expand→collapse→expand | Med | Cleanup runs synchronously in `toggleExpand` before the new mount; covered by BEHAVIOR test. |
| Row-key instability under sort / data swap (host cached against a key that no longer exists) | Med | `updated()` lifecycle diffs the current row-key set against the host cache, runs cleanup for orphaned keys. Test required. |
| Two `lit` instances regression resurfacing | Low | Bridge no longer references `lit` for expand; expand path has zero `TemplateResult` involvement. Documented as the explicit reason for the contract. |
| CEM drift (`custom-elements.json` not regenerated) | Med | Verification task runs `npm run analyze`; CI check optional follow-up. |
| Framework-agnosticism unproven without Vue | Low | Vanilla DOM story + test covers the contract. Vue bridge tracked as deferred follow-up. |

## Rollback Plan

- Revert the change commit (or chained PR series). No persistent state, no migrations, no data writes.
- If a consumer is mid-migration and reke-ui must be temporarily un-broken: republish the previous reke-ui minor version under a `legacy-expand` tag. Consumers pin to that tag while they finish the migration.
- Downstream `pnl-track-frontend` pins the previous reke-ui version until its migration task lands.

## Dependencies

- None new. Lit 3, `@lit/react`, React 19, Vitest browser mode already installed.
- Soft dependency: downstream `pnl-track-frontend` migration ticket must be scheduled before reke-ui releases this version.

## Success Criteria

- [ ] `expandedRowRender` is fully removed from source, tests, stories, exports, CEM, and docs.
- [ ] `expandedRowElement` is the sole expand contract and contains zero Lit-specific types in its signature.
- [ ] Expand state is keyed by row identity via `getRowKey`; sort + reorder do not remount the framework root for unchanged rows (covered by test).
- [ ] React bridge mounts via `createRoot(host)` and returns cleanup — no `` html`${...}` `` wrapping anywhere in the expand path.
- [ ] Vanilla DOM story + test pass, proving framework-agnosticism without React.
- [ ] Opt-in chevron column renders when `expandable` is true, with `aria-expanded` / `aria-controls`; default OFF leaves existing consumers untouched.
- [ ] JSDoc no longer claims auto-chevron behavior that does not exist when `expandable` is false.
- [ ] `custom-elements.json` regenerated and committed.
- [ ] `npm run test:run`, `npm run build`, `npm run lint` all green.
- [ ] CHANGELOG entry marks BREAKING; downstream migration ticket linked.

## Open Questions (carry into spec/design)

1. Exact name and shape of the row-key prop: `getRowKey` (function) vs `rowKey` (string path) vs both. Spec must pin one.
2. Should the `reke-row-expand` event payload include the cached host element (useful for focus management) — yes/no.
3. Chevron column position: always leading, or `expandableColumnPosition: 'start' | 'end'`?
4. Cleanup ordering guarantee on rapid toggle: do we promise synchronous cleanup-before-mount in the public contract, or document as best-effort?
5. Behavior when `getRowKey` returns duplicates: throw in dev, warn in prod, silently last-wins?
6. **Deferred (out of scope here, must be tracked)**: Vue bridge. Confirm the host-callback contract works against a real Vue mount before publishing a Vue subpath. Open follow-up issue in reke-ui.
7. Should `expandable` (chevron column) also handle keyboard activation (`Enter` / `Space`) by default, or leave to consumers?
8. Backward-compat console warning if a consumer still passes `expandedRowRender` — emit a one-shot dev-mode error so the migration is loud?

## Review Workload Forecast

This change will almost certainly exceed the 400-line PR budget once tests, stories, bridge rewrite, and docs are counted. The orchestrator must plan **chained PRs** at the tasks phase. Suggested slicing:

- **PR 1**: `reke-table` core — remove `expandedRowRender`, add `getRowKey`, identity-keyed state, host cache, cleanup ordering. Tests + story for host-callback only.
- **PR 2**: Chevron column (`expandable` prop) + a11y wiring + tests + story + JSDoc fix.
- **PR 3**: React bridge rewrite + bridge tests + CEM regen + README-DOC update + CHANGELOG.
