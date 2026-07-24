/**
 * React wrapper around `reke-table`.
 *
 * Lets React consumers pass `React.ReactNode` for cells and expanded rows
 * while the underlying Lit element gets raw DOM nodes (cells) and a
 * `expandedRowElement(host, row, key) => Cleanup` host callback (expand).
 *
 * Returning raw DOM nodes instead of `html\`${host}\`` is deliberate: a
 * `TemplateResult` from a duplicated `lit` instance (npm symlink, Module
 * Federation) fails Lit's brand check and renders as `[object Object]`.
 */
import { createComponent, type EventName } from '@lit/react';
import type { TemplateResult } from 'lit';
import React, { useEffect, useMemo, useRef } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';
import {
  type ExpandedRowElement,
  type RekeTable,
  RekeTable as RekeTableClass,
  type RowKey,
  type TableColumn,
  type TableRow,
} from '../components/reke-table/reke-table.js';

const RawTable = createComponent({
  tagName: 'reke-table',
  elementClass: RekeTableClass,
  react: React,
  events: {
    onRekeRowClick: 'reke-row-click' as EventName<CustomEvent<{ row: unknown; index: number }>>,
    onRekeSort: 'reke-sort' as EventName<CustomEvent<{ key: string; direction: 'asc' | 'desc' }>>,
    onRekeRowExpand: 'reke-row-expand' as EventName<
      CustomEvent<{ row: unknown; index: number; key: RowKey; expanded: boolean }>
    >,
  },
});

export interface ReactTableColumn<TRow extends TableRow = TableRow>
  extends Omit<TableColumn, 'render'> {
  /**
   * Cell renderer. Return any of:
   *  - `ReactNode` (JSX) — bridged via React root, returned to Lit as a raw DOM node
   *  - `Node` / `HTMLElement` — passed through (escape hatch for hand-built DOM)
   *  - `string` / `TemplateResult` — passed through (Lit-native)
   */
  render?: (
    value: unknown,
    row: TRow,
    index: number,
  ) => React.ReactNode | TemplateResult | string | Node;
}

/** Expanded-row renderer. Return any `React.ReactNode`. */
export type ReactExpandedRowRenderer<TRow extends TableRow = TableRow> = (
  row: TRow,
  key: RowKey,
) => React.ReactNode;

export interface TableProps<TRow extends TableRow = TableRow> {
  columns: ReactTableColumn<TRow>[];
  rows: TRow[];
  striped?: boolean;
  dense?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  borderless?: boolean;
  /** Opt-in: render a leading chevron column with built-in a11y + keyboard activation. */
  expandable?: boolean;
  /** Opt-in: clicking a row toggles expand. The chevron, if present, calls `stopPropagation()`. */
  expandOnRowClick?: boolean;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  expandedRowRender?: ReactExpandedRowRenderer<TRow>;
  expandedRows?: Set<RowKey>;
  /**
   * Returns a stable identifier for a row. Defaults to the row index (which
   * causes remounts on sort). Prefer a domain id (e.g. `r => r.id`) so the
   * expanded React root survives sorts, filters, and unrelated re-renders.
   */
  getRowKey?: (row: TRow, index: number) => RowKey;
  onRekeRowClick?: (e: CustomEvent<{ row: unknown; index: number }>) => void;
  onRekeSort?: (e: CustomEvent<{ key: string; direction: 'asc' | 'desc' }>) => void;
  onRekeRowExpand?: (
    e: CustomEvent<{ row: unknown; index: number; key: RowKey; expanded: boolean }>,
  ) => void;
  children?: React.ReactNode;
}

type CellHostEntry = { root: Root; host: HTMLDivElement };

/** Strings, numbers, raw nodes and `TemplateResult`s go to Lit untouched; everything else mounts via a React root. */
function passThroughNonReact(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' || typeof value === 'number') return true;
  if (value instanceof Node) return true;
  return false;
}

/**
 * Renders `element` into `root`.
 *
 * `sync` (default `true`) wraps the commit in `flushSync` so Lit reads a
 * populated host node on the SAME tick — required only for the initial mount of
 * a vanilla cell/expand host. Pass `sync: false` for re-renders of an
 * already-mounted root: the host is already in the DOM, so a plain async
 * `root.render()` is enough and, crucially, avoids the "flushSync was called
 * from inside a lifecycle method" warning storm when this runs during a
 * parent commit.
 */
function renderIntoRoot(root: Root, element: React.ReactNode, sync = true): void {
  if (!sync) {
    root.render(element as React.ReactElement);
    return;
  }
  // flushSync throws if called mid-render; fall back to async render.
  try {
    flushSync(() => {
      root.render(element as React.ReactElement);
    });
  } catch {
    root.render(element as React.ReactElement);
  }
}

/** Unmounting an already-unmounted root throws; swallow it. */
function safeUnmount(root: Root): void {
  try {
    root.unmount();
  } catch {
    /* already unmounted */
  }
}

function TableInner<TRow extends TableRow = TableRow>(
  props: TableProps<TRow>,
  ref: React.Ref<RekeTable>,
): React.ReactElement {
  const { columns, rows, expandedRowRender, getRowKey, children, ...rest } = props;

  // Cell roots, keyed `${rowKey}::cell::${colKey}`. Stable across re-renders
  // so sort/filter that preserve rowKey don't remount roots.
  const cellHostsRef = useRef<Map<string, CellHostEntry>>(new Map());
  const usedCellKeysRef = useRef<Set<string>>(new Set());

  // Expand roots, keyed by row key. The host comes from the core component's
  // callback, so we only cache the Root here.
  const expandRootsRef = useRef<Map<string, Root>>(new Map());

  // The element captures `expandedRowElement` once, but we want the latest
  // renderer closure on every commit without remounting. The cached callback
  // reads this ref instead of closing over the prop.
  const expandRenderRef = useRef<ReactExpandedRowRenderer<TRow> | undefined>(expandedRowRender);
  expandRenderRef.current = expandedRowRender;

  // Re-render open expand roots so they reflect the latest renderer/props.
  // Deps-scoped to the inputs it actually reads: it must NOT run on every
  // parent render (that re-fired renderIntoRoot on each commit and triggered a
  // flushSync warning storm + layout thrash). Roots are already mounted here,
  // so render async (sync: false) — no flushSync needed.
  useEffect(() => {
    if (!expandedRowRender) return;
    const roots = expandRootsRef.current;
    for (const [key, root] of roots) {
      // ponytail: linear scan; rows are small. Index by key if tables grow large.
      let row: TRow | undefined;
      for (let i = 0; i < rows.length; i += 1) {
        const r = rows[i];
        const k = String(getRowKey ? getRowKey(r, i) : i);
        if (k === key) {
          row = r;
          break;
        }
      }
      if (!row) continue;
      const out = expandedRowRender(row, key);
      if (passThroughNonReact(out)) continue;
      renderIntoRoot(root, out, false);
    }
  }, [rows, getRowKey, expandedRowRender]);

  // Unmount all roots (cells + expands) when the bridge unmounts.
  useEffect(() => {
    const cells = cellHostsRef.current;
    const expands = expandRootsRef.current;
    return () => {
      for (const { root } of cells.values()) safeUnmount(root);
      cells.clear();
      for (const root of expands.values()) safeUnmount(root);
      expands.clear();
    };
  }, []);

  const rowKeyOf = (row: TRow, i: number): string => String(getRowKey ? getRowKey(row, i) : i);

  const getOrCreateCellHost = (key: string): CellHostEntry => {
    let entry = cellHostsRef.current.get(key);
    if (!entry) {
      const host = document.createElement('div');
      // display: contents so the host adds no layout box — React children
      // render as direct children of the <td>.
      host.style.cssText = 'display: contents;';
      const root = createRoot(host);
      entry = { root, host };
      cellHostsRef.current.set(key, entry);
    }
    usedCellKeysRef.current.add(key);
    return entry;
  };

  usedCellKeysRef.current = new Set();

  // Wrap columns so React cell renderers return raw DOM nodes to Lit.
  const wrappedColumns = useMemo<TableColumn[]>(
    () =>
      columns.map((col) => {
        if (!col.render) return col as TableColumn;
        return {
          ...col,
          render: (value: unknown, row: TableRow, index: number) => {
            const out = col.render?.(value, row as TRow, index);
            if (passThroughNonReact(out)) {
              return (out ?? '') as TemplateResult | string | Node;
            }
            const key = `${rowKeyOf(row as TRow, index)}::cell::${col.key}`;
            const entry = getOrCreateCellHost(key);
            renderIntoRoot(entry.root, out as React.ReactNode);
            return entry.host;
          },
        } satisfies TableColumn;
      }),
    // Host map is stable across rows changes, so only columns/rowKey matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns, getRowKey],
  );

  // expandedRowElement callback: mount a React root into the host the core
  // component owns, cache it by key, return a cleanup that unmounts it.
  const wrappedExpandedElement = useMemo<ExpandedRowElement | undefined>(() => {
    if (!expandedRowRender) return undefined;
    return (host, row, key) => {
      const callback = expandRenderRef.current;
      if (!callback) return undefined;
      const mapKey = String(key);
      // Reuse a root if one already exists (defensive: core usually cleans up first).
      let root = expandRootsRef.current.get(mapKey);
      if (!root) {
        root = createRoot(host);
        expandRootsRef.current.set(mapKey, root);
      }
      const out = callback(row as TRow, key);
      if (!passThroughNonReact(out)) {
        renderIntoRoot(root, out);
      } else if (out instanceof Node) {
        host.appendChild(out);
        return () => {
          if (out.parentNode === host) host.removeChild(out);
        };
      } else if (typeof out === 'string' || typeof out === 'number') {
        host.textContent = String(out);
        return () => {
          host.textContent = '';
        };
      }
      return () => {
        const cached = expandRootsRef.current.get(mapKey);
        if (cached) {
          safeUnmount(cached);
          expandRootsRef.current.delete(mapKey);
        }
      };
    };
    // Identity flips only on toggle on/off; closure updates go via expandRenderRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!expandedRowRender]);

  // GC cell roots not used in this render (column or row removed).
  useEffect(() => {
    const used = usedCellKeysRef.current;
    const hosts = cellHostsRef.current;
    for (const [key, entry] of hosts) {
      if (!used.has(key)) {
        safeUnmount(entry.root);
        hosts.delete(key);
      }
    }
  });

  return React.createElement(
    RawTable,
    {
      ...rest,
      ref,
      columns: wrappedColumns,
      rows: rows as TableRow[],
      expandedRowElement: wrappedExpandedElement,
      getRowKey: getRowKey as ((row: TableRow, index: number) => RowKey) | undefined,
    } as unknown as React.ComponentProps<typeof RawTable>,
    children,
  );
}

// forwardRef cast preserves the generic TRow signature.
export const Table = React.forwardRef(TableInner) as <TRow extends TableRow = TableRow>(
  props: TableProps<TRow> & { ref?: React.Ref<RekeTable> },
) => React.ReactElement;

export type {
  Cleanup,
  ExpandedRowElement,
  GetRowKey,
  RowKey,
  TableColumn,
  TableRow,
} from '../components/reke-table/reke-table.js';
export { RekeTable } from '../components/reke-table/reke-table.js';
