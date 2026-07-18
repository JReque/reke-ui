import { html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ref } from 'lit/directives/ref.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-table.styles.js';

export interface TableColumn {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  /** Set to false to disable sorting on this column. Default: true. */
  sortable?: boolean;
  /** Custom render function for cell content. Falls back to row[col.key] if omitted. */
  render?: (
    value: unknown,
    row: TableRow,
    index: number,
  ) => TemplateResult | string | HTMLElement | Node;
}

export type TableRow = Record<string, unknown>;

/** Stable identifier for a row. */
export type RowKey = string | number;

/** Cleanup callback returned by `expandedRowElement`. */
export type Cleanup = () => void;

/**
 * Framework-agnostic expand callback.
 * Receives the host element, the row data, and the resolved row key.
 * Mount any framework's content into the host and return a cleanup function
 * (called on collapse, row removal, or table disconnect), or `void`.
 */
export type ExpandedRowElement = (host: HTMLElement, row: TableRow, key: RowKey) => Cleanup | void;

/** Resolve a row to a stable identifier. Defaults to `String(index)`. */
export type GetRowKey = (row: TableRow, index: number) => RowKey;

/**
 * Detect dev mode without leaking bundler-specific types into the TS surface.
 * Supports Vite (`import.meta.env.DEV`/`MODE`) and Node (`process.env.NODE_ENV === 'development'`).
 * This is a RUNTIME check, NOT dead-code elimination: the warnings still ship in the bundle.
 * The final fallback defaults to `false` so that non-Vite / non-Module-Federation consumers
 * never leak dev `console.error`/`console.warn` into production.
 */
function _isDev(): boolean {
  try {
    // Access `import.meta.env` directly (not via an alias): Vite only substitutes the
    // literal `import.meta.env` token. The `as` cast is compile-time only and leaves the
    // token intact, so this resolves to Vite's real env object at runtime.
    const env = (import.meta as unknown as { env?: { DEV?: boolean; MODE?: string } }).env;
    if (env && typeof env.DEV === 'boolean') return env.DEV;
    if (env && typeof env.MODE === 'string') return env.MODE !== 'production';
  } catch {
    // ignore — fall through
  }
  try {
    const proc = (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }).process;
    if (proc?.env?.NODE_ENV) return proc.env.NODE_ENV === 'development';
  } catch {
    // ignore
  }
  // Default to false so dev warnings never leak into production for consumers
  // whose environment we cannot positively detect.
  return false;
}

/**
 * @tag reke-table
 * @summary A data table with custom cell rendering, framework-agnostic expandable rows, and toolbar/footer slots.
 *
 * @slot toolbar - Toolbar area above the table (search, filters, title).
 * @slot footer - Footer area below the table (pagination, record count).
 * @slot empty - Custom empty state content (replaces default "No data").
 *
 * @fires reke-row-click - Fired when a row is clicked. Detail: `{ row: TableRow, index: number }`.
 * @fires reke-sort - Fired when a sortable header is clicked. Detail: `{ key: string, direction: 'asc' | 'desc' }`.
 * @fires reke-row-expand - Fired when a row is expanded or collapsed. Detail: `{ row: TableRow, index: number, key: RowKey, expanded: boolean }`.
 *
 * @csspart table - The native table element.
 * @csspart header - The thead element.
 * @csspart body - The tbody element.
 * @csspart row - Each tbody data tr element.
 * @csspart cell - Each tbody td element.
 * @csspart header-cell - Each thead th element.
 * @csspart toolbar - The toolbar wrapper div.
 * @csspart footer - The footer wrapper div.
 * @csspart expand-row - The tr for expanded content.
 * @csspart expand-content - The td spanning all columns in the expanded row.
 * @csspart expand-toggle-cell - The leading `<td>` that contains the chevron button (only when `expandable`).
 * @csspart expand-toggle-button - The chevron `<button>` itself (only when `expandable`).
 *
 * @cssprop [--reke-color-surface=#1A1A1A] - Table background.
 * @cssprop [--reke-color-border=#252525] - Border and row divider color.
 * @cssprop [--reke-color-text=#E5E5E5] - Cell text color.
 * @cssprop [--reke-color-text-muted=#525252] - Header text color.
 * @cssprop [--reke-color-primary=#22C55E] - Chevron focus outline color.
 * @cssprop [--reke-radius=4px] - Chevron button corner radius.
 *
 * Props:
 * - `expandedRowElement`: Framework-agnostic expand render. Receives `(host, row, key)`. Mount any framework. Return cleanup or void.
 * - `getRowKey`: Optional `(row, index) => RowKey`. Defaults to `String(index)`. Use a stable domain id for identity-keyed expand state across sorts.
 * - `expandable`: Opt-in boolean (default `false`). When `true`, `reke-table` prepends a leading toggle column with an accessible chevron `<button>` per row: `aria-expanded` reflects the row's expand state, `aria-controls` points at the expand `<td>`, and `Enter`/`Space` activate the toggle. Consumers can also build their own toggles by leaving `expandable=false` (default) and calling `toggleExpand(key)` directly.
 * - `expandOnRowClick` (attribute `expand-on-row-click`): Opt-in boolean (default `false`). When `true`, clicking anywhere on a row calls `toggleExpand(key)` internally. `reke-row-click` is STILL emitted on every row click. The chevron button calls `stopPropagation()` so chevron clicks do NOT double-toggle. Consumers MUST use EITHER this prop OR their own `reke-row-click` → `toggleExpand` handler, not both. For keyboard / screen-reader users, pair with `expandable`.
 */
@customElement('reke-table')
export class RekeTable extends RekeElement {
  static override styles = styles;

  @property({ attribute: false })
  columns: TableColumn[] = [];

  @property({ attribute: false })
  rows: TableRow[] = [];

  @property({ type: Boolean, reflect: true })
  striped = false;

  @property({ type: Boolean, reflect: true })
  dense = false;

  @property({ type: Boolean, reflect: true })
  hoverable = false;

  @property({ type: Boolean, reflect: true })
  bordered = false;

  @property({ type: Boolean, reflect: true })
  borderless = false;

  /**
   * Opt-in: when `true`, the table prepends a leading toggle column whose
   * `<button>` calls `toggleExpand(key)`, exposes `aria-expanded` reflecting
   * the expand state, `aria-controls` pointing at the expand `<td>` id
   * (`reke-table-expand-<key>`), and accepts `Enter` / `Space` activation.
   *
   * Defaults to `false` so consumers that already wire their own toggles
   * (chips, links, custom buttons) are unaffected.
   */
  @property({ type: Boolean, reflect: true })
  expandable = false;

  /**
   * Opt-in: when `true`, clicking anywhere on a row (outside the chevron, if
   * present) calls `toggleExpand(key)` internally using the row's identity
   * key. The `reke-row-click` event is STILL emitted on every row click so
   * consumers can react in addition to the built-in toggle.
   *
   * Default is `false` to preserve non-breaking behavior: existing consumers
   * that wire their own `reke-row-click` → `toggleExpand` handlers are
   * unaffected.
   *
   * A11y note: row clicks are a pointer convenience only. The `<tr>` does NOT
   * receive `role="button"` or `tabindex` (that would be a clickable-row
   * a11y anti-pattern). For keyboard / screen-reader users, pair this prop
   * with `expandable` so the accessible chevron `<button>` is available.
   *
   * Double-wiring caveat: consumers MUST use EITHER `expandOnRowClick` OR
   * their own `reke-row-click` → `toggleExpand` handler — not both — or the
   * row will toggle twice and net to no change.
   *
   * Chevron interaction: the chevron `<button>` calls `stopPropagation()`, so
   * clicking the chevron does NOT trigger the row-click toggle (no double
   * toggle).
   */
  @property({ type: Boolean, reflect: true, attribute: 'expand-on-row-click' })
  expandOnRowClick = false;

  @property({ reflect: true, attribute: 'sort-key' })
  sortKey = '';

  @property({ reflect: true, attribute: 'sort-direction' })
  sortDirection: 'asc' | 'desc' = 'asc';

  /**
   * Framework-agnostic expand callback. Sole expand API.
   *
   * @example Vanilla DOM:
   *   expandedRowElement = (host, row, key) => {
   *     const node = document.createElement('div');
   *     node.textContent = String(row.name);
   *     host.appendChild(node);
   *     return () => node.remove();
   *   };
   *
   * @example React (via the bridge):
   *   expandedRowElement = (host, row, key) => {
   *     const root = createRoot(host);
   *     root.render(<MyContent data={row} />);
   *     return () => root.unmount();
   *   };
   */
  @property({ attribute: false })
  expandedRowElement: ExpandedRowElement | null = null;

  /**
   * Resolve a stable identifier for each row.
   * Defaults to `String(index)` — identity-equivalent only when rows are stable.
   * Provide a domain id (e.g. `row => row.id`) to keep expand state across sorts.
   */
  @property({ attribute: false })
  getRowKey?: GetRowKey;

  /** Set of row keys currently expanded. */
  @property({ attribute: false })
  expandedRows: Set<RowKey> = new Set();

  /** Host element cached per row key. Survives unrelated re-renders. */
  private _hostCache = new Map<RowKey, HTMLElement>();

  /** Cleanup cached per row key. Invoked exactly once on collapse / row removal / disconnect. */
  private _cleanupMap = new Map<RowKey, Cleanup>();

  /** Keys we have already warned about as duplicates (one-shot per component lifetime). */
  private _warnedDupKeys = new Set<RowKey>();

  /** One-shot guard for the numeric-target-with-getRowKey ambiguity warning. */
  private _warnedNumericTarget = false;

  /** Track which keys are currently mounted in the DOM, to honor the contract that mount happens after `updated()` reconciles. */
  private _mountedKeys = new Set<RowKey>();

  /** Keys currently animating their collapse. Cleanup is deferred until transitionend. */
  private _collapsingKeys = new Set<RowKey>();

  /**
   * Keys newly expanded this tick. They render collapsed (0fr) for the first
   * paint, then `updated()` clears them on the next frame so the CSS grid
   * transition animates open (0fr → 1fr). Without this, a freshly-mounted
   * expand row starts at 1fr and pops open with no animation.
   */
  private _enteringKeys = new Set<RowKey>();

  /** transitionend handlers keyed by row key, for cleanup on collapse animation end. */
  private _collapseEndHandlers = new Map<RowKey, (e: TransitionEvent) => void>();

  /** Latest resolved row map: key → row. Filled during render so callbacks can look up rows. */
  private _keyToRow = new Map<RowKey, TableRow>();

  /** Stable ref callback per row key. One closure per key, reused across renders. */
  private _refCallbacks = new Map<RowKey, (el: Element | undefined) => void>();

  @state() private _hasToolbar = false;
  @state() private _hasFooter = false;

  private _resolveKey(row: TableRow, index: number): RowKey {
    if (this.getRowKey) return this.getRowKey(row, index);
    return String(index);
  }

  private handleHeaderClick(column: TableColumn) {
    if (column.sortable === false) return;

    if (this.sortKey === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = column.key;
      this.sortDirection = 'asc';
    }
    this.emit('reke-sort', { key: this.sortKey, direction: this.sortDirection });
  }

  private handleRowClick(row: TableRow, index: number) {
    // Always emit the row-click event — even when `expandOnRowClick` is ON —
    // so consumers can react in addition to the built-in toggle. This is the
    // explicit non-breaking decision (see `expandOnRowClick` JSDoc).
    this.emit('reke-row-click', { row, index });

    // Opt-in pointer convenience: toggle expand using the row's identity key
    // (consistent with the rest of the expand state). The chevron button calls
    // `stopPropagation()`, so chevron clicks never reach this handler — no
    // double toggle.
    if (this.expandOnRowClick) {
      const key = this._resolveKey(row, index);
      this.toggleExpand(key);
    }
  }

  /**
   * Chevron button click handler. Stops propagation so it does NOT also fire
   * the row-level `reke-row-click` event, then toggles the row by key.
   */
  private _handleChevronClick(event: Event, key: RowKey): void {
    event.stopPropagation();
    this.toggleExpand(key);
  }

  /**
   * Chevron keyboard activation. The element is a native `<button>`, so Enter
   * already fires `click` natively. We still handle it here to keep the
   * keyboard contract explicit and testable across environments where the
   * `KeyboardEvent` is dispatched programmatically (Vitest browser mode tests
   * dispatch raw `keydown`s without the synthesized `click`).
   *
   * For Space we MUST call `preventDefault()` so the page does not scroll.
   */
  private _handleChevronKeydown(event: KeyboardEvent, key: RowKey): void {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      event.stopPropagation();
      this.toggleExpand(key);
    }
  }

  /**
   * Toggle expand state for a row.
   * Accepts either a numeric `index` into `rows` or a `RowKey` (the value returned by `getRowKey`).
   * When `getRowKey` is unset, indices and keys collapse onto `String(index)`.
   */
  toggleExpand(target: number | RowKey): void {
    let key: RowKey;
    let index: number;
    let row: TableRow | undefined;

    const interpretedAsIndex =
      typeof target === 'number' &&
      target === Math.trunc(target) &&
      target >= 0 &&
      target < this.rows.length;

    // Only warn when the numeric target is actually interpreted as an INDEX. An
    // out-of-range number falls through to the key branch where it IS used as a key,
    // so warning there would be inaccurate.
    if (interpretedAsIndex && this.getRowKey && !this._warnedNumericTarget && _isDev()) {
      this._warnedNumericTarget = true;
      // eslint-disable-next-line no-console
      console.warn(
        '[reke-table] toggleExpand received a numeric target while `getRowKey` is set; in-range numeric targets are interpreted as row INDICES, not keys. Pass the resolved key to target by identity.',
      );
    }

    if (interpretedAsIndex) {
      index = target as number;
      row = this.rows[index];
      key = this._resolveKey(row, index);
    } else {
      key = target as RowKey;
      index = this.rows.findIndex((r, i) => this._resolveKey(r, i) === key);
      row = index >= 0 ? this.rows[index] : undefined;
    }

    const newSet = new Set(this.expandedRows);
    const expanding = !newSet.has(key);

    if (expanding) {
      newSet.add(key);
      // Mark as entering so the first paint renders collapsed (0fr); `updated()`
      // clears it next frame to animate open.
      this._enteringKeys.add(key);
      if (this._collapsingKeys.delete(key)) {
        const handler = this._collapseEndHandlers.get(key);
        if (handler) {
          // host -> .expand-inner -> .expand-grid (where the listener lives)
          this._getOrCreateHost(key).parentElement?.parentElement?.removeEventListener(
            'transitionend',
            handler,
          );
          this._collapseEndHandlers.delete(key);
        }
      }
    } else {
      // Phase 1: mark as collapsing but KEEP the key in expandedRows so the
      // template renders the expanded state + collapse class. The browser will
      // paint this frame, then phase 2 (in updated) removes the key to trigger
      // the actual CSS transition.
      this._collapsingKeys.add(key);
    }

    this.expandedRows = newSet;
    this.emit('reke-row-expand', { row, index, key, expanded: expanding });
  }

  /** Check whether a row with the given key is currently expanded. */
  isRowExpanded(key: RowKey): boolean {
    return this.expandedRows.has(key);
  }

  private _onToolbarSlotChange(e: Event) {
    const el = e.target as HTMLSlotElement;
    this._hasToolbar = el.assignedNodes({ flatten: true }).length > 0;
  }

  private _onFooterSlotChange(e: Event) {
    const el = e.target as HTMLSlotElement;
    this._hasFooter = el.assignedNodes({ flatten: true }).length > 0;
  }

  private _getOrCreateHost(key: RowKey): HTMLElement {
    let host = this._hostCache.get(key);
    if (!host) {
      host = document.createElement('div');
      host.style.cssText = 'display: contents;';
      this._hostCache.set(key, host);
    }
    return host;
  }

  /**
   * Return a STABLE ref callback for a given row key. Lit's `ref()` directive accepts a
   * callback `(el: Element | undefined) => void` directly, so no cast is needed. The callback
   * is memoized per key to avoid churning Lit's ref directive on every render.
   */
  private _expandTdRef(key: RowKey): (el: Element | undefined) => void {
    let refCallback = this._refCallbacks.get(key);
    if (!refCallback) {
      refCallback = (element: Element | undefined) => {
        if (!element) return;
        const inner = element as HTMLElement;
        const host = this._getOrCreateHost(key);
        if (host.parentElement !== inner) {
          inner.appendChild(host);
        }
        // The animated track lives on the parent .expand-grid; transitionend
        // fires there (it bubbles up, not down to .expand-inner), so listen on
        // the grid wrapper.
        const grid = inner.parentElement as HTMLElement | null;
        if (grid && !this._collapseEndHandlers.has(key)) {
          const onEnd = (e: TransitionEvent) => {
            if (e.propertyName !== 'grid-template-rows' || !this._collapsingKeys.has(key)) return;
            this._collapsingKeys.delete(key);
            this._collapseEndHandlers.delete(key);
            grid.removeEventListener('transitionend', onEnd);
            this._safeCleanup(key);
            this._hostCache.delete(key);
            this._mountedKeys.delete(key);
            this._refCallbacks.delete(key);
            // Remove the collapsed row from expandedRows so the next render
            // drops it from the template (nothing path).
            if (this.expandedRows.has(key)) {
              this.expandedRows = new Set([...this.expandedRows].filter((k) => k !== key));
            }
          };
          grid.addEventListener('transitionend', onEnd);
          this._collapseEndHandlers.set(key, onEnd);
        }
      };
      this._refCallbacks.set(key, refCallback);
    }
    return refCallback;
  }

  private _renderRow(row: TableRow, i: number, key: RowKey) {
    const isExpanded = this.expandedRows.has(key);
    const hostId = `reke-table-expand-${String(key)}`;
    const expandColspan = this.columns.length + (this.expandable ? 1 : 0);

    return html`
      <tr
        part="row"
        class="row ${i % 2 === 1 ? 'row--even' : ''} ${isExpanded ? 'row--expanded' : ''}"
        @click=${() => this.handleRowClick(row, i)}
      >
        ${
          this.expandable
            ? html`
              <td
                part="expand-toggle-cell"
                class="expand-toggle-cell"
              >
                <button
                  type="button"
                  part="expand-toggle-button"
                  class="expand-toggle-button ${isExpanded ? 'expand-toggle-button--expanded' : ''}"
                  aria-expanded=${isExpanded ? 'true' : 'false'}
                  aria-controls=${hostId}
                  aria-label=${isExpanded ? 'Collapse row' : 'Expand row'}
                  @click=${(e: Event) => this._handleChevronClick(e, key)}
                  @keydown=${(e: KeyboardEvent) => this._handleChevronKeydown(e, key)}
                >
                  <span class="expand-toggle-chevron" aria-hidden="true">▶</span>
                </button>
              </td>
            `
            : nothing
        }
        ${this.columns.map(
          (col) => html`
            <td
              part="cell"
              class="cell"
              data-align=${col.align || 'left'}
            >
              ${col.render ? col.render(row[col.key], row, i) : (row[col.key] ?? '')}
            </td>
          `,
        )}
      </tr>
      ${
        this.expandedRowElement && this._keyToRow.get(key) === row
          ? html`
            <tr
              part="expand-row"
              class="expand-row ${isExpanded && !this._enteringKeys.has(key) ? '' : 'expand-row--collapsed'}"
            >
              <td
                part="expand-content"
                class="expand-content"
                id=${hostId}
                colspan=${expandColspan}
              >
                <div class="expand-grid">
                  <div class="expand-inner" ${ref(this._expandTdRef(key))}></div>
                </div>
              </td>
            </tr>
          `
          : nothing
      }
    `;
  }

  override willUpdate(_changed: PropertyValues): void {
    const isDev = _isDev();

    // Dev-only one-shot error if the deprecated `expandedRowRender` is still set.
    if (isDev) {
      const legacy = (this as unknown as { expandedRowRender?: unknown }).expandedRowRender;
      if (legacy != null && !this._warnedLegacyApi) {
        this._warnedLegacyApi = true;
        // eslint-disable-next-line no-console
        console.error(
          '[reke-table] `expandedRowRender` was removed. Use `expandedRowElement(host, row, key) => Cleanup | void` instead.',
        );
      }
    }

    // Rebuild the key→row map and warn about duplicates (one-shot per key).
    const seen = new Map<RowKey, TableRow>();
    for (let i = 0; i < this.rows.length; i += 1) {
      const row = this.rows[i];
      const key = this._resolveKey(row, i);
      if (seen.has(key)) {
        if (isDev && !this._warnedDupKeys.has(key)) {
          this._warnedDupKeys.add(key);
          // eslint-disable-next-line no-console
          console.warn(
            `[reke-table] Duplicate getRowKey value detected: ${JSON.stringify(key)}. Last row with this key wins for expand bookkeeping.`,
          );
        }
      }
      // Last-wins precedence.
      seen.set(key, row);
    }
    this._keyToRow = seen;
  }

  private _warnedLegacyApi = false;

  override updated(_changed: PropertyValues): void {
    // Diff the expanded-key set against the host/cleanup maps:
    //   - Mount any expanded key that isn't mounted yet.
    //   - Cleanup any cached key that is no longer present in `rows` (orphan).
    if (!this.expandedRowElement) {
      // No expand callback: drop any stale state.
      this._runAllCleanupsAndClear();
      // Purge any expanded keys whose rows no longer exist so `isRowExpanded()`
      // stays consistent with the C1 contract even on the no-callback path.
      for (const key of Array.from(this.expandedRows)) {
        if (!this._keyToRow.has(key)) {
          this.expandedRows.delete(key);
        }
      }
      return;
    }

    // 1. Cleanup orphans authoritatively over `expandedRows` ∪ `_hostCache.keys()`.
    //    This covers BOTH windows:
    //      - mounted-then-removed: key is in `_hostCache` but the row is gone.
    //      - never-mounted-then-removed: key was added to `expandedRows` in the same
    //        tick the row was dropped, so it NEVER entered `_hostCache`. Keying the
    //        purge solely on `_hostCache` would miss it, leaving a phantom expanded key.
    const keysToCheck = new Set<RowKey>([...this.expandedRows, ...this._hostCache.keys()]);
    for (const cachedKey of keysToCheck) {
      const present = this._keyToRow.has(cachedKey);
      const stillExpanded = this.expandedRows.has(cachedKey);
      // A key needs purging when its row is gone (orphan) or it is cached but no
      // longer expanded (normal collapse leftover). Keys currently animating
      // their collapse are protected — cleanup happens on transitionend.
      if (present && stillExpanded) continue;
      if (this._collapsingKeys.has(cachedKey)) continue;

      // Guard consumer cleanup against throws so our state stays consistent.
      // `_safeCleanup` is idempotent (deletes after running) so no double-cleanup.
      this._safeCleanup(cachedKey);
      this._hostCache.delete(cachedKey);
      this._mountedKeys.delete(cachedKey);
      this._refCallbacks.delete(cachedKey);
      // If the row was REMOVED (not a normal collapse), purge it from `expandedRows`
      // so `isRowExpanded()` stops lying and a re-added row with the same key renders
      // COLLAPSED instead of spontaneously re-expanding. The normal-collapse path (via
      // `toggleExpand`, which clones the Set) already removed the key. The row is gone,
      // so mutate the Set in place to avoid an extra reactive cycle.
      if (!present && !this._collapsingKeys.has(cachedKey)) {
        this.expandedRows.delete(cachedKey);
      }
    }

    // Phase 2 of collapse animation: the browser has now painted the expanded
    // state with the collapse class. Remove the key from expandedRows so the
    // next render triggers the CSS transition (max-height 1fr → 0).
    if (this._collapsingKeys.size > 0) {
      const toCollapse = [...this._collapsingKeys];
      requestAnimationFrame(() => {
        const newSet = new Set(this.expandedRows);
        for (const key of toCollapse) {
          newSet.delete(key);
        }
        this.expandedRows = newSet;
      });
    }

    // 2. Mount any expanded key that hasn't been mounted yet.
    for (const key of this.expandedRows) {
      if (this._mountedKeys.has(key)) continue;
      const row = this._keyToRow.get(key);
      if (!row) continue;
      const host = this._getOrCreateHost(key);
      // host is already appended to the td via ref callback during render.
      const cleanup = this.expandedRowElement(host, row, key);
      if (typeof cleanup === 'function') {
        this._cleanupMap.set(key, cleanup);
      }
      this._mountedKeys.add(key);
    }

    // Entering rows render collapsed (0fr) with their content mounted. A
    // freshly-inserted element has no painted baseline, so switching straight
    // to 1fr wouldn't transition. Force a reflow to commit the 0fr baseline,
    // then release the keys next frame so the grid animates open (0fr → 1fr).
    if (this._enteringKeys.size > 0) {
      // Force layout so the collapsed 0fr state is the transition's start value.
      void this.offsetHeight;
      requestAnimationFrame(() => {
        this._enteringKeys.clear();
        this.requestUpdate();
      });
    }
  }

  /**
   * Invoke the cached cleanup for a key, swallowing consumer errors so our own state
   * mutation (`expandedRows`, host/cleanup/ref maps) and `emit` stay consistent even if
   * the consumer's cleanup throws. Deletes the cleanup entry after running.
   */
  private _safeCleanup(key: RowKey): void {
    const cleanup = this._cleanupMap.get(key);
    if (cleanup) {
      try {
        cleanup();
      } catch {
        // Swallow consumer cleanup errors so our state stays consistent.
      }
      this._cleanupMap.delete(key);
    }
  }

  private _runAllCleanupsAndClear(): void {
    // Cancel any pending collapse animations.
    for (const [key, handler] of this._collapseEndHandlers) {
      const host = this._hostCache.get(key);
      // host -> .expand-inner -> .expand-grid (where the listener lives)
      const grid = host?.parentElement?.parentElement as HTMLElement | null;
      grid?.removeEventListener('transitionend', handler);
    }
    this._collapsingKeys.clear();
    this._collapseEndHandlers.clear();

    for (const cleanup of this._cleanupMap.values()) {
      try {
        cleanup();
      } catch {
        // Swallow consumer cleanup errors so other cleanups still run.
      }
    }
    this._cleanupMap.clear();
    this._hostCache.clear();
    this._mountedKeys.clear();
    this._refCallbacks.clear();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._runAllCleanupsAndClear();
  }

  override render() {
    const tableClasses = {
      table: true,
      'table--striped': this.striped,
      'table--dense': this.dense,
      'table--hoverable': this.hoverable,
      'table--bordered': this.bordered,
    };

    return html`
      <div class="table-container">
        ${
          this._hasToolbar
            ? html`
              <div part="toolbar" class="table-toolbar">
                <slot name="toolbar" @slotchange=${this._onToolbarSlotChange}></slot>
              </div>
            `
            : html`<slot name="toolbar" @slotchange=${this._onToolbarSlotChange} style="display:none"></slot>`
        }

        <div class="table-wrapper">
          <table part="table" class=${classMap(tableClasses)} role="table">
            <thead part="header">
              <tr>
                ${
                  this.expandable
                    ? html`
                      <th
                        part="expand-toggle-header-cell"
                        class="expand-toggle-header-cell"
                        aria-hidden="true"
                      ></th>
                    `
                    : nothing
                }
                ${this.columns.map(
                  (col) => html`
                    <th
                      part="header-cell"
                      class="header-cell ${this.sortKey === col.key ? 'header-cell--sorted' : ''} ${col.sortable === false ? 'header-cell--no-sort' : ''}"
                      style=${col.width ? `width: ${col.width}` : ''}
                      data-align=${col.align || 'left'}
                      @click=${() => this.handleHeaderClick(col)}
                    >
                      <span class="header-content">
                        ${col.header}
                        ${
                          this.sortKey === col.key
                            ? html`<span class="sort-indicator" aria-hidden="true">${this.sortDirection === 'asc' ? '↑' : '↓'}</span>`
                            : nothing
                        }
                      </span>
                    </th>
                  `,
                )}
              </tr>
            </thead>
            <tbody part="body">
              ${this.rows.map((row, i) => {
                const key = this._resolveKey(row, i);
                return this._renderRow(row, i, key);
              })}
              ${
                this.rows.length === 0
                  ? html`
                    <tr class="row row--empty">
                      <td
                        class="cell cell--empty"
                        colspan=${this.columns.length + (this.expandable ? 1 : 0)}
                      >
                        <slot name="empty">No data</slot>
                      </td>
                    </tr>
                  `
                  : nothing
              }
            </tbody>
          </table>
        </div>

        ${
          this._hasFooter
            ? html`
              <div part="footer" class="table-footer">
                <slot name="footer" @slotchange=${this._onFooterSlotChange}></slot>
              </div>
            `
            : html`<slot name="footer" @slotchange=${this._onFooterSlotChange} style="display:none"></slot>`
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-table': RekeTable;
  }
}
