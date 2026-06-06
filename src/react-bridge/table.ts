/**
 * React-native wrapper around `reke-table`.
 *
 * Why this exists:
 * The underlying `<reke-table>` web component (Lit) accepts render functions
 * that return `TemplateResult | string`. Exposing that contract directly to
 * React consumers leaks Lit into application code and breaks the workspace
 * rule "do not rely on reke-ui web components for reactivity — only consume
 * tokens / structural elements". This wrapper hides the bridge so React apps
 * pass plain `React.ReactNode` everywhere.
 *
 * How the bridge works:
 *  - For each cell render or expanded-row render, we maintain a host `<div>`
 *    keyed by a stable id (`getRowKey(row, i)` for rows, plus column key for
 *    cells).
 *  - We mount a React root into the host (`createRoot` + `flushSync`) with
 *    the user's `ReactNode`.
 *  - We return a Lit `html\`${host}\`` template — Lit accepts raw DOM nodes
 *    in interpolation, so the host is moved into the table cell unchanged.
 *  - On unmount we tear down every root.
 *
 * Backward compatibility:
 * If a render function returns a string or a `TemplateResult` (anything that
 * is not a valid React element), it is passed through untouched.
 */
import { createComponent, type EventName } from '@lit/react';
import { html, type TemplateResult } from 'lit';
import React, { useEffect, useMemo, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import {
  type RekeTable,
  RekeTable as RekeTableClass,
  type TableColumn,
  type TableRow,
  type ExpandedRowElement,
  type RowKey,
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
   *  - `ReactNode` (JSX) — bridged via React root
   *  - `Node` / `HTMLElement` — passed through (escape hatch for hand-built DOM)
   *  - `string` / `TemplateResult` — passed through (Lit-native)
   */
  render?: (
    value: unknown,
    row: TRow,
    index: number,
  ) => React.ReactNode | TemplateResult | string | Node;
}

export type ReactExpandedRowRenderer<TRow extends TableRow = TableRow> = (
  row: TRow,
  index: number,
) => React.ReactNode | TemplateResult | Node;

export interface TableProps<TRow extends TableRow = TableRow> {
  columns: ReactTableColumn<TRow>[];
  rows: TRow[];
  striped?: boolean;
  dense?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  borderless?: boolean;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  expandedRowRender?: ReactExpandedRowRenderer<TRow>;
  expandedRows?: Set<RowKey>;
  /**
   * Returns a stable identifier for a row, used to key React roots for
   * expanded content and cell renderers. Defaults to the row index, which
   * works but causes remounts on sort. Prefer a domain id (e.g. `row.id`).
   */
  getRowKey?: (row: TRow, index: number) => string | number;
  onRekeRowClick?: (e: CustomEvent<{ row: unknown; index: number }>) => void;
  onRekeSort?: (e: CustomEvent<{ key: string; direction: 'asc' | 'desc' }>) => void;
  onRekeRowExpand?: (e: CustomEvent<{ row: unknown; index: number; key: RowKey; expanded: boolean }>) => void;
  children?: React.ReactNode;
}

type HostEntry = { root: Root; host: HTMLDivElement };

function isReactRenderable(value: unknown): value is React.ReactNode {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' || typeof value === 'number') return false;
  // Raw DOM nodes are passed through (Lit accepts them in interpolation)
  if (value instanceof Node) return false;
  if (React.isValidElement(value)) return true;
  // Arrays / fragments of React nodes also qualify
  if (Array.isArray(value)) return value.some(React.isValidElement);
  return false;
}

function renderIntoHost(entry: HostEntry, element: React.ReactNode): void {
  // flushSync so the host has committed DOM before Lit attaches it.
  // Guarded: throws if invoked during another React render — fall back to async.
  try {
    flushSync(() => {
      entry.root.render(element as React.ReactElement);
    });
  } catch {
    entry.root.render(element as React.ReactElement);
  }
}

function TableInner<TRow extends TableRow = TableRow>(
  props: TableProps<TRow>,
  ref: React.Ref<RekeTable>,
): React.ReactElement {
  const {
    columns,
    rows,
    expandedRowRender,
    getRowKey,
    children,
    ...rest
  } = props;

  // Stable host map across renders. Key format:
  //   `${rowKey}::cell::${colKey}` for cells
  //   `${rowKey}::expanded`        for expanded rows
  const hostsRef = useRef<Map<string, HostEntry>>(new Map());
  // Tracks which keys were used in the current render, so we can GC stale roots.
  const usedKeysRef = useRef<Set<string>>(new Set());

  // Cleanup all roots on unmount.
  useEffect(() => {
    const hosts = hostsRef.current;
    return () => {
      for (const { root } of hosts.values()) root.unmount();
      hosts.clear();
    };
  }, []);

  const rowKeyOf = (row: TRow, i: number): string =>
    String(getRowKey ? getRowKey(row, i) : i);

  const getOrCreateHost = (key: string): HostEntry => {
    let entry = hostsRef.current.get(key);
    if (!entry) {
      const host = document.createElement('div');
      const root = createRoot(host);
      entry = { root, host };
      hostsRef.current.set(key, entry);
    }
    usedKeysRef.current.add(key);
    return entry;
  };

  // Reset usage tracker before computing this render's outputs.
  usedKeysRef.current = new Set();

  // Wrap columns so the underlying element gets Lit-shaped renders.
  const wrappedColumns = useMemo<TableColumn[]>(
    () =>
      columns.map((col) => {
        if (!col.render) return col as TableColumn;
        return {
          ...col,
          render: (value: unknown, row: TableRow, index: number) => {
            const out = col.render?.(value, row as TRow, index);
            if (!isReactRenderable(out)) {
              // string | TemplateResult | null | undefined → pass through
              return (out ?? '') as TemplateResult | string;
            }
            const key = `${rowKeyOf(row as TRow, index)}::cell::${col.key}`;
            const entry = getOrCreateHost(key);
            renderIntoHost(entry, out);
            return html`${entry.host}`;
          },
        } satisfies TableColumn;
      }),
    // Re-wrap whenever the column set or rowKey strategy changes.
    // We do NOT depend on rows: stable rowKeys keep hosts stable across data updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns, getRowKey],
  );

  // Transitional adapter: wrap the React-flavored `expandedRowRender` prop into
  // an `expandedRowElement(host, row, key)` host-callback that the underlying
  // element now requires. Slice 3 will rewrite this with createRoot + flushSync
  // + key-stable unmount; for now we route through the same React-root host map
  // used for cells so existing consumers keep working.
  const wrappedExpandedElement = useMemo<ExpandedRowElement | null>(() => {
    if (!expandedRowRender) return null;
    return (host, row, key) => {
      const out = expandedRowRender(row as TRow, key as unknown as number);
      const mapKey = `${String(key)}::expanded`;
      if (!isReactRenderable(out)) {
        // Plain Node / string / TemplateResult fallback.
        if (out instanceof Node) {
          host.appendChild(out);
          return () => {
            if (out.parentNode === host) host.removeChild(out);
          };
        }
        return undefined;
      }
      const entry = getOrCreateHost(mapKey);
      renderIntoHost(entry, out);
      host.appendChild(entry.host);
      return () => {
        if (entry.host.parentNode === host) host.removeChild(entry.host);
      };
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedRowRender, getRowKey]);

  // GC roots that were not used this render (e.g. row removed, sort changed key).
  // Defer to a microtask so Lit has finished consuming the previous render's hosts.
  useEffect(() => {
    const used = usedKeysRef.current;
    const hosts = hostsRef.current;
    for (const [key, entry] of hosts) {
      if (!used.has(key)) {
        entry.root.unmount();
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
      expandedRowElement: wrappedExpandedElement ?? undefined,
      getRowKey: getRowKey as ((row: TableRow, index: number) => RowKey) | undefined,
    } as unknown as React.ComponentProps<typeof RawTable>,
    children,
  );
}

// forwardRef preserves the generic TRow signature for consumers.
export const Table = React.forwardRef(TableInner) as <TRow extends TableRow = TableRow>(
  props: TableProps<TRow> & { ref?: React.Ref<RekeTable> },
) => React.ReactElement;

export { RekeTable } from '../components/reke-table/reke-table.js';
export type { TableColumn, TableRow } from '../components/reke-table/reke-table.js';
