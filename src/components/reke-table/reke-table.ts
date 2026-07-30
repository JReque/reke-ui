import { html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { guard } from 'lit/directives/guard.js';
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
 * Upper bound for the collapse teardown, in ms. The normal path resolves off
 * the real animations, so this only fires when the browser never produced one
 * AND the empty-animation fast path did not apply either. Keep it comfortably
 * above the 200ms CSS transition in `reke-table.styles.ts`.
 */
const COLLAPSE_TEARDOWN_FALLBACK_MS = 400;

/**
 * Rows rendered on the very first virtualized paint, before the scroll
 * container has been measured. Enough to fill a typical viewport so the table
 * is never briefly blank, and to give the container something to size against.
 */
const INITIAL_WINDOW_ROWS = 20;

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
 * Virtualization: opt-in via `virtualized`, off by default. When on, only the
 * rows intersecting the viewport are rendered and spacer rows carry the scroll
 * height of the rest. Requires `rowHeight` and `maxHeight`. Expandable rows are
 * supported: their height is measured with a ResizeObserver and folded into the
 * row offsets, which is affordable because only a handful of rows are ever open
 * at once. Rows are never recycled across keys — a row key keeps its host
 * element and its cleanup contract even while scrolled out of the window.
 * See README-DOC.md.
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
  // A table is a container, not a single control — disable focus delegation.
  static override shadowRootOptions: ShadowRootInit = {
    ...RekeElement.shadowRootOptions,
    delegatesFocus: false,
  };

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

  /**
   * Opt-in row windowing: only the rows intersecting the viewport are rendered,
   * with spacer rows standing in for the rest.
   *
   * This is NOT a transparent optimization — it changes the layout contract.
   * A virtualized table needs a bounded scroll container, so `maxHeight` and
   * `rowHeight` are both REQUIRED when this is `true` (dev error otherwise), and
   * the table switches to `table-layout: fixed` so column widths stop depending
   * on whichever rows happen to be rendered. That is also why this is a prop and
   * not an automatic row-count threshold: silently changing a consumer's layout
   * because their dataset grew past some boundary is worse than being slow.
   *
   * Not yet compatible with `expandedRowElement` — see the class JSDoc.
   */
  @property({ type: Boolean, reflect: true })
  virtualized = false;

  /**
   * Height in px of a single COLLAPSED row, declared by the consumer. Required
   * when `virtualized` is `true`.
   *
   * Declared rather than measured on purpose: it makes row offsets pure
   * arithmetic (`index * rowHeight`) available on the very first frame, with no
   * measure-then-render pass. The tradeoff is yours to honor — if your cell
   * content is taller than this, rows will overlap. Keep it in sync with the
   * `dense` modifier if you use it.
   */
  @property({ type: Number, attribute: 'row-height' })
  rowHeight = 0;

  /**
   * CSS length capping the scroll container height (e.g. `'600px'`, `'70vh'`).
   * Required when `virtualized` is `true` — without a bounded height there is
   * no viewport to window against.
   */
  @property({ attribute: 'max-height' })
  maxHeight = '';

  /**
   * Extra rows rendered above and below the viewport, absorbing fast scrolls
   * before blank space can appear. Higher costs more per frame.
   */
  @property({ type: Number })
  overscan = 4;

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

  /**
   * Keys currently animating their collapse. The row stays rendered while the
   * key is here; teardown runs when the collapse settles (see
   * `_scheduleCollapseTeardown`). A key is NEVER in both this set and
   * `expandedRows` — collapse removes it from `expandedRows` immediately, which
   * is what makes a re-entrant toggle read as a genuine re-expand.
   */
  private _collapsingKeys = new Set<RowKey>();

  /**
   * Keys newly expanded this tick. They render collapsed (0fr) for the first
   * paint, then `updated()` clears them on the next frame so the CSS grid
   * transition animates open (0fr → 1fr). Without this, a freshly-mounted
   * expand row starts at 1fr and pops open with no animation.
   */
  private _enteringKeys = new Set<RowKey>();

  /**
   * Generation token per collapsing key. A pending settle only tears the key
   * down when its token is still the current one, so cancelling a collapse
   * (re-expand, row removal, disconnect) is a single map delete.
   */
  private _collapseTokens = new Map<RowKey, number>();

  private _collapseSeq = 0;

  /** Latest resolved row map: key → row. Filled during render so callbacks can look up rows. */
  private _keyToRow = new Map<RowKey, TableRow>();

  /** Latest resolved index map: key → absolute index into `rows`. */
  private _keyToIndex = new Map<RowKey, number>();

  /**
   * Measured height in px of each rendered expand row, keyed by row key.
   *
   * This is the whole reason expand and virtualization can coexist. A collapsed
   * row's height is declared (`rowHeight`); an expanded row's is not knowable in
   * advance, because the consumer mounts arbitrary content into the host. So we
   * measure it — and that is affordable precisely because the set is tiny: no
   * one has ten thousand rows open at once. Offsets stay
   * `index * rowHeight + sum(extra heights of expanded rows above)`.
   *
   * Entries survive an expanded row scrolling out of the window (the height is
   * still needed for the math) and are dropped only on teardown.
   */
  private _expandedHeights = new Map<RowKey, number>();

  private _expandRowElements = new Map<RowKey, HTMLElement>();
  private _expandRowKeys = new WeakMap<Element, RowKey>();
  private _expandRowRefs = new Map<RowKey, (el: Element | undefined) => void>();
  private _expandObserver: ResizeObserver | null = null;

  /** First index of the window rendered on the last pass, for scroll anchoring. */
  private _windowStart = 0;

  /** Stable ref callback per row key. One closure per key, reused across renders. */
  private _refCallbacks = new Map<RowKey, (el: Element | undefined) => void>();

  @state() private _hasToolbar = false;
  @state() private _hasFooter = false;

  /** Live scroll offset of the scroll container, in px. Virtualized mode only. */
  @state() private _scrollTop = 0;

  /** Measured height of the scroll container, in px. Virtualized mode only. */
  @state() private _viewportHeight = 0;

  private _scrollContainer: HTMLElement | null = null;
  private _viewportObserver: ResizeObserver | null = null;
  private _scrollFrame: number | null = null;

  /**
   * Coalesce scroll into one update per frame. A trackpad fires scroll events
   * far faster than the browser paints, and each one would otherwise queue a
   * full window recompute.
   */
  private _onScroll = (): void => {
    if (this._scrollFrame !== null) return;
    this._scrollFrame = requestAnimationFrame(() => {
      this._scrollFrame = null;
      if (this._scrollContainer) {
        this._scrollTop = this._scrollContainer.scrollTop;
      }
    });
  };

  /**
   * Bind the scroll container. Called by lit's `ref` on every render, so it must
   * be cheap and idempotent — it rebinds only when the element actually changes.
   */
  private _bindScrollContainer = (element: Element | undefined): void => {
    const next = (element as HTMLElement | undefined) ?? null;
    if (next === this._scrollContainer) return;

    this._scrollContainer?.removeEventListener('scroll', this._onScroll);
    this._viewportObserver?.disconnect();
    this._viewportObserver = null;
    this._scrollContainer = next;

    if (!next) return;
    next.addEventListener('scroll', this._onScroll, { passive: true });
    // The initial measurement comes from the observer's first callback rather
    // than a synchronous read here: this runs during Lit's commit phase, and
    // assigning reactive state mid-commit schedules an update from inside an
    // update. The observer fires right after observe(), so the cost is one frame.
    //
    // The viewport size drives how many rows are in the window, so a container
    // resize has to recompute it — maxHeight can be relative (vh, %).
    this._viewportObserver = new ResizeObserver(() => {
      if (this._scrollContainer) {
        this._viewportHeight = this._scrollContainer.clientHeight;
      }
    });
    this._viewportObserver.observe(next);
  };

  /**
   * Expanded rows that add height, as `{ index, extra }` sorted by index.
   * Small by construction — this is the set of rows the user has open.
   */
  private _extraHeights(): { index: number; extra: number }[] {
    if (this._expandedHeights.size === 0) return [];
    const out: { index: number; extra: number }[] = [];
    for (const [key, extra] of this._expandedHeights) {
      const index = this._keyToIndex.get(key);
      if (index === undefined || extra <= 0) continue;
      out.push({ index, extra });
    }
    return out.sort((a, b) => a.index - b.index);
  }

  /** Distance in px from the top of the dataset to the top of row `index`. */
  private _offsetOf(index: number, extras: readonly { index: number; extra: number }[]): number {
    let acc = 0;
    for (const entry of extras) {
      if (entry.index >= index) break;
      acc += entry.extra;
    }
    return index * this.rowHeight + acc;
  }

  /**
   * Inverse of `_offsetOf`: the row index sitting at a given scroll offset.
   * Walks the (short) list of expanded rows to find which linear segment the
   * offset falls in, then divides within that segment.
   */
  private _indexAtOffset(
    offset: number,
    extras: readonly { index: number; extra: number }[],
    total: number,
  ): number {
    let acc = 0;
    for (const entry of extras) {
      // Where the row AFTER this expanded one begins.
      const nextRowTop = (entry.index + 1) * this.rowHeight + acc + entry.extra;
      if (nextRowTop > offset) break;
      acc += entry.extra;
    }
    const index = Math.floor((offset - acc) / this.rowHeight);
    return Math.min(total, Math.max(0, index));
  }

  /**
   * The slice of `rows` to render plus the spacer heights standing in for the
   * rows outside it. `end` is exclusive.
   *
   * Expanded rows INSIDE the window render at their real height, so their extra
   * height is deliberately excluded from the spacers — only rows above and below
   * the window contribute.
   */
  private _computeWindow(): {
    start: number;
    end: number;
    topSpacer: number;
    bottomSpacer: number;
  } {
    const total = this.rows.length;
    if (!this.virtualized || this.rowHeight <= 0) {
      return { start: 0, end: total, topSpacer: 0, bottomSpacer: 0 };
    }

    const extras = this._extraHeights();
    let totalExtra = 0;
    for (const entry of extras) totalExtra += entry.extra;
    const totalHeight = total * this.rowHeight + totalExtra;

    // First paint: the container has not been measured yet. Render a slab rather
    // than nothing, so the table has content (and a height) to measure against.
    if (this._viewportHeight <= 0) {
      const end = Math.min(total, this.overscan * 2 + INITIAL_WINDOW_ROWS);
      return {
        start: 0,
        end,
        topSpacer: 0,
        bottomSpacer: Math.max(0, totalHeight - this._offsetOf(end, extras)),
      };
    }

    const start = Math.max(0, this._indexAtOffset(this._scrollTop, extras, total) - this.overscan);
    const bottomIndex = this._indexAtOffset(this._scrollTop + this._viewportHeight, extras, total);
    const end = Math.min(total, bottomIndex + 1 + this.overscan);

    return {
      start,
      end,
      topSpacer: this._offsetOf(start, extras),
      bottomSpacer: Math.max(0, totalHeight - this._offsetOf(end, extras)),
    };
  }

  /**
   * Observe an expand row so its height feeds the window math. Measuring is what
   * lets expanded rows coexist with windowing; the observer also fires
   * continuously while the row animates open, so the offsets track the
   * transition instead of jumping at the end.
   */
  private _expandRowRef(key: RowKey): (el: Element | undefined) => void {
    let callback = this._expandRowRefs.get(key);
    if (!callback) {
      callback = (element: Element | undefined) => {
        const previous = this._expandRowElements.get(key);
        if (previous && previous !== element) {
          this._expandObserver?.unobserve(previous);
          this._expandRowElements.delete(key);
        }
        if (!element) return;
        this._expandRowElements.set(key, element as HTMLElement);
        this._expandRowKeys.set(element, key);
        if (this.virtualized) this._ensureExpandObserver().observe(element);
      };
      this._expandRowRefs.set(key, callback);
    }
    return callback;
  }

  private _ensureExpandObserver(): ResizeObserver {
    if (this._expandObserver) return this._expandObserver;

    this._expandObserver = new ResizeObserver((entries) => {
      let changed = false;
      // Height changes ABOVE the window shift everything below them, which would
      // yank the viewport out from under the user. Compensate the scroll by the
      // same delta so what they are looking at stays put.
      let driftAboveWindow = 0;

      for (const entry of entries) {
        const key = this._expandRowKeys.get(entry.target);
        if (key === undefined) continue;
        const height =
          entry.borderBoxSize?.[0]?.blockSize ?? (entry.target as HTMLElement).offsetHeight;
        const previous = this._expandedHeights.get(key) ?? 0;
        if (Math.abs(previous - height) < 0.5) continue;

        this._expandedHeights.set(key, height);
        changed = true;

        const index = this._keyToIndex.get(key);
        if (index !== undefined && index < this._windowStart) {
          driftAboveWindow += height - previous;
        }
      }

      if (!changed) return;
      if (driftAboveWindow !== 0 && this._scrollContainer) {
        this._scrollContainer.scrollTop += driftAboveWindow;
        this._scrollTop = this._scrollContainer.scrollTop;
      }
      this.requestUpdate();
    });

    return this._expandObserver;
  }

  /**
   * A zero-content row standing in for the rows outside the window, holding the
   * scroll height they would have occupied. `<tr>` height is honored as a
   * minimum, and the cell is stripped of padding and borders so it contributes
   * nothing beyond `height`.
   */
  private _renderSpacerRow(height: number, position: 'top' | 'bottom') {
    if (height <= 0) return nothing;
    return html`
      <tr class="spacer-row" aria-hidden="true" data-position=${position} style=${`height: ${height}px`}>
        <td class="spacer-cell" colspan=${this.columns.length + (this.expandable ? 1 : 0)}></td>
      </tr>
    `;
  }

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
      // Cancel any collapse still animating for this key. The host is still
      // cached and still mounted, so we reuse it instead of tearing it down and
      // building a second one.
      const wasCollapsing = this._collapsingKeys.delete(key);
      this._collapseTokens.delete(key);
      // Only play the open animation when there is nothing mounted yet. A row
      // caught mid-collapse already has painted content — it just reverses.
      if (!wasCollapsing && !this._mountedKeys.has(key)) {
        this._enteringKeys.add(key);
      }
    } else {
      // Drop the key from `expandedRows` right away and keep the row rendered
      // via `_collapsingKeys`. The grid is already painted at 1fr, so the
      // 1fr -> 0fr transition starts from a real baseline without a second
      // render pass — and a click landing mid-collapse reads as a re-expand
      // instead of a duplicate collapse.
      newSet.delete(key);
      this._collapsingKeys.add(key);
      this._enteringKeys.delete(key);
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
          // `replaceChildren`, not `appendChild`: the container may still hold a
          // host from an earlier expand cycle, and stacking them is exactly how
          // the shadow tree grew on every open/close round trip.
          inner.replaceChildren(host);
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
    // The expand row exists only while it is open or animating shut. Rendering
    // it for every row left a permanent tr + td + grid + inner per row, which is
    // both dead weight and the container the orphaned hosts piled up in.
    // `_keyToRow.get(key) === row` is the last-wins tiebreak for duplicate
    // `getRowKey` values: only the winning row owns the expand slot.
    const showExpandRow =
      this.expandedRowElement != null &&
      (isExpanded || this._collapsingKeys.has(key)) &&
      this._keyToRow.get(key) === row;

    return html`
      <tr
        part="row"
        class="row ${i % 2 === 1 ? 'row--even' : ''} ${isExpanded ? 'row--expanded' : ''}"
        aria-rowindex=${this.virtualized ? i + 2 : nothing}
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
        showExpandRow
          ? html`
            <tr
              part="expand-row"
              class="expand-row ${isExpanded && !this._enteringKeys.has(key) ? '' : 'expand-row--collapsed'}"
              ${ref(this._expandRowRef(key))}
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

    // Dev-only one-shot errors for a virtualized setup that cannot work.
    if (isDev && this.virtualized && !this._warnedVirtualConfig) {
      const problems: string[] = [];
      if (this.rowHeight <= 0) {
        problems.push('`row-height` must be a positive number — row offsets are computed from it');
      }
      if (!this.maxHeight) {
        problems.push('`max-height` is required — windowing needs a bounded scroll container');
      }
      if (problems.length > 0) {
        this._warnedVirtualConfig = true;
        // eslint-disable-next-line no-console
        console.error(`[reke-table] virtualized: ${problems.join('; ')}.`);
      }
    }

    // Rebuild the key→row map and warn about duplicates (one-shot per key).
    const seen = new Map<RowKey, TableRow>();
    const indices = new Map<RowKey, number>();
    for (let i = 0; i < this.rows.length; i += 1) {
      const row = this.rows[i];
      const key = this._resolveKey(row, i);
      indices.set(key, i);
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
    this._keyToIndex = indices;
  }

  private _warnedLegacyApi = false;

  private _warnedVirtualConfig = false;

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

    // 1. Cleanup orphans authoritatively over every key we still hold state for.
    //    This covers BOTH windows:
    //      - mounted-then-removed: key is in `_hostCache` but the row is gone.
    //      - never-mounted-then-removed: key was added to `expandedRows` in the same
    //        tick the row was dropped, so it NEVER entered `_hostCache`. Keying the
    //        purge solely on `_hostCache` would miss it, leaving a phantom expanded key.
    const keysToCheck = new Set<RowKey>([
      ...this.expandedRows,
      ...this._collapsingKeys,
      ...this._hostCache.keys(),
    ]);
    for (const cachedKey of keysToCheck) {
      const present = this._keyToRow.has(cachedKey);
      // A key stays alive while its row exists AND it is either open or still
      // animating shut. Anything else is a leftover: a removed row, or a key
      // that left `expandedRows` without going through `toggleExpand`.
      if (present && (this.expandedRows.has(cachedKey) || this._collapsingKeys.has(cachedKey))) {
        continue;
      }
      // A removed row takes its DOM with it, so there is no animation left to
      // wait for — tear down now instead of leaning on a transition that will
      // never fire.
      this._teardownKey(cachedKey);
      // If the row was REMOVED (not a normal collapse), purge it from `expandedRows`
      // so `isRowExpanded()` stops lying and a re-added row with the same key renders
      // COLLAPSED instead of spontaneously re-expanding. The normal-collapse path (via
      // `toggleExpand`, which clones the Set) already removed the key. The row is gone,
      // so mutate the Set in place to avoid an extra reactive cycle.
      if (!present) {
        this.expandedRows.delete(cachedKey);
      }
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

    // 3. Arm the deterministic teardown for every row animating shut. Idempotent:
    //    a key that already has a live token is left alone.
    for (const key of this._collapsingKeys) {
      if (this._collapseTokens.has(key)) continue;
      this._scheduleCollapseTeardown(key);
    }

    // Entering rows render collapsed (0fr) with their content mounted. A
    // freshly-inserted element has no painted baseline, so switching straight
    // to 1fr wouldn't transition. Force a reflow to commit the 0fr baseline,
    // then release the keys next frame so the grid animates open (0fr → 1fr).
    if (this._enteringKeys.size > 0) {
      // Force layout so the collapsed 0fr state is the transition's start value.
      void this.offsetHeight;
      requestAnimationFrame(() => {
        if (this._enteringKeys.size === 0) return;
        this._enteringKeys.clear();
        this.requestUpdate();
      });
    }
  }

  /**
   * Wait for a collapsing row to finish animating, then tear it down.
   *
   * The wait resolves off `getAnimations()`, not `transitionend`: that event is
   * never guaranteed (reduced motion, `display: none`, a backgrounded tab, a
   * zero-duration override, the row being unmounted mid-flight), and when it
   * failed to arrive the key stayed in `_collapsingKeys` forever, which in turn
   * disabled the purge in `updated()`. If there is no animation at all,
   * `Promise.allSettled([])` settles on the next microtask and teardown is
   * immediate. `COLLAPSE_TEARDOWN_FALLBACK_MS` is the last resort for an
   * animation that never finishes.
   */
  private _scheduleCollapseTeardown(key: RowKey): void {
    this._collapseSeq += 1;
    const token = this._collapseSeq;
    this._collapseTokens.set(key, token);

    // host -> .expand-inner -> .expand-grid (the element carrying the transition)
    const grid = this._hostCache.get(key)?.parentElement?.parentElement ?? null;

    let animations: Animation[] = [];
    if (grid) {
      // Reading a computed value flushes the pending style change, which is what
      // actually creates the transition we are about to await. Without it,
      // `getAnimations()` can legitimately return an empty list.
      void getComputedStyle(grid).gridTemplateRows;
      animations = grid.getAnimations({ subtree: true });
    }

    // Always burn at least one frame, even with nothing to animate. Tearing down
    // synchronously would unmount content on a fast collapse→re-expand, and it
    // would do it in the same task the collapse was requested in.
    const nextFrame = new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
    const settled = Promise.all([
      Promise.allSettled(animations.map((animation) => animation.finished)),
      nextFrame,
    ]);
    const fallback = new Promise<void>((resolve) => {
      setTimeout(resolve, COLLAPSE_TEARDOWN_FALLBACK_MS);
    });

    void Promise.race([settled, fallback]).then(() => {
      // Superseded by a re-expand, a row removal, or a later collapse.
      if (this._collapseTokens.get(key) !== token) return;
      this._teardownKey(key);
      this.requestUpdate();
    });
  }

  /**
   * Release every resource held for a row key. Idempotent and safe to call at
   * any point in the lifecycle — each step is a delete, and `_safeCleanup`
   * drops its entry after running.
   */
  private _teardownKey(key: RowKey): void {
    this._safeCleanup(key);
    // Detach the host itself. The consumer cleanup only owns what IT mounted;
    // the host div is ours, and `.expand-inner` may outlive this cycle.
    this._hostCache.get(key)?.remove();
    this._hostCache.delete(key);
    this._mountedKeys.delete(key);
    this._refCallbacks.delete(key);
    this._collapsingKeys.delete(key);
    this._collapseTokens.delete(key);
    this._enteringKeys.delete(key);

    const expandRow = this._expandRowElements.get(key);
    if (expandRow) this._expandObserver?.unobserve(expandRow);
    this._expandRowElements.delete(key);
    this._expandRowRefs.delete(key);
    this._expandedHeights.delete(key);
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
    // Invalidate every pending collapse settle: the token check makes them no-ops.
    this._collapsingKeys.clear();
    this._collapseTokens.clear();
    this._enteringKeys.clear();

    for (const cleanup of this._cleanupMap.values()) {
      try {
        cleanup();
      } catch {
        // Swallow consumer cleanup errors so other cleanups still run.
      }
    }
    this._cleanupMap.clear();
    for (const host of this._hostCache.values()) {
      host.remove();
    }
    this._hostCache.clear();
    this._expandObserver?.disconnect();
    this._expandRowElements.clear();
    this._expandRowRefs.clear();
    this._expandedHeights.clear();
    this._mountedKeys.clear();
    this._refCallbacks.clear();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._runAllCleanupsAndClear();

    this._scrollContainer?.removeEventListener('scroll', this._onScroll);
    this._scrollContainer = null;
    this._viewportObserver?.disconnect();
    this._viewportObserver = null;
    this._expandObserver?.disconnect();
    this._expandObserver = null;
    if (this._scrollFrame !== null) {
      cancelAnimationFrame(this._scrollFrame);
      this._scrollFrame = null;
    }
  }

  override render() {
    const tableClasses = {
      table: true,
      'table--striped': this.striped,
      'table--dense': this.dense,
      'table--hoverable': this.hoverable,
      'table--bordered': this.bordered,
      // Fixed layout is mandatory when windowing: with `auto`, column widths are
      // derived from the rendered rows, so they would shift as you scroll.
      'table--fixed-layout': this.virtualized,
    };

    const { start, end, topSpacer, bottomSpacer } = this._computeWindow();
    const total = this.rows.length;
    const windowRows = this.virtualized ? this.rows.slice(start, end) : this.rows;
    this._windowStart = start;

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

        <div
          class="table-wrapper ${this.virtualized ? 'table-wrapper--virtualized' : ''}"
          style=${this.virtualized && this.maxHeight ? `max-height: ${this.maxHeight}` : ''}
          tabindex=${this.virtualized ? 0 : nothing}
          role=${this.virtualized ? 'group' : nothing}
          aria-label=${this.virtualized ? 'Scrollable table' : nothing}
          ${ref(this._bindScrollContainer)}
        >
          <table
            part="table"
            class=${classMap(tableClasses)}
            role="table"
            aria-rowcount=${this.virtualized ? total : nothing}
          >
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
              ${this._renderSpacerRow(topSpacer, 'top')}
              ${windowRows.map((row, offset) => {
                // Absolute index into `rows`, NOT the slice offset: striping,
                // `reke-row-click`, and key resolution all key off the real
                // position in the dataset.
                const i = start + offset;
                const key = this._resolveKey(row, i);
                // `guard` makes each row its own reactive unit. Toggling one row
                // used to re-invoke `column.render` for EVERY row (twice, with
                // the old two-phase collapse); now only the rows whose inputs
                // actually changed re-render.
                //
                // Deliberately NOT `repeat()`: duplicate `getRowKey` values are a
                // warned-but-supported input here, and `repeat` corrupts its DOM
                // mapping when keys collide. Row identity for expand state is
                // already carried by `_hostCache`, not by DOM position.
                //
                // `this.rows` is a dependency on purpose: consumers who mutate a
                // row in place and reassign the array still get a full re-render.
                return guard(
                  [
                    row,
                    i,
                    this.rows,
                    this.columns,
                    this.expandable,
                    this.expandedRowElement,
                    this.expandedRows.has(key),
                    this._collapsingKeys.has(key),
                    this._enteringKeys.has(key),
                  ],
                  () => this._renderRow(row, i, key),
                );
              })}
              ${this._renderSpacerRow(bottomSpacer, 'bottom')}
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
