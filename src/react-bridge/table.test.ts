/**
 * React bridge tests for `reke-table`.
 *
 * These tests exercise the bridge in Vitest browser mode (real Chromium) with
 * real React + react-dom. We avoid JSX so the test file stays a plain `.ts`
 * (matching the project's `vitest.config.ts` include pattern), using
 * `React.createElement` directly.
 *
 * The regression target: under a duplicated `lit` instance the previous bridge
 * wrapped cell hosts in a Lit `TemplateResult` via `html\`${host}\``. Lit's
 * brand check failed across realms and the template rendered as the literal
 * string `[object Object]`. The new bridge MUST return raw DOM nodes from
 * cell renderers AND mount React directly into the host element provided by
 * the core component's `expandedRowElement(host, row, key)` callback. NO
 * `TemplateResult` may travel through the bridge's hot path.
 */

import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import type { RekeTable, TableRow } from '../components/reke-table/reke-table.js';
import type { ReactTableColumn } from './table.js';
import { Table } from './table.js';

type Row = { id: string; name: string; role: string };

const rows: Row[] = [
  { id: 'a', name: 'Alice', role: 'Engineer' },
  { id: 'b', name: 'Bob', role: 'Designer' },
  { id: 'c', name: 'Carol', role: 'Manager' },
];

/**
 * Mount `<Table>` (the bridge) into a sandbox div, returning helpers to
 * inspect the underlying `<reke-table>` and to re-render with new props.
 */
async function mountBridge<TRow extends TableRow = TableRow>(
  initialProps: React.ComponentProps<typeof Table<TRow>>,
): Promise<{
  wrapper: HTMLElement;
  root: ReactDOMClient.Root;
  getTable: () => RekeTable;
  rerender: (props: React.ComponentProps<typeof Table<TRow>>) => Promise<void>;
  unmount: () => void;
}> {
  const wrapper = document.createElement('div');
  wrapper.style.backgroundColor = '#0A0A0B';
  wrapper.style.padding = '16px';
  document.body.appendChild(wrapper);

  const root = ReactDOMClient.createRoot(wrapper);
  root.render(
    React.createElement(Table as unknown as React.ComponentType<typeof initialProps>, initialProps),
  );

  const flush = async () => {
    // React commit + Lit updateComplete + microtask drain.
    await new Promise((r) => setTimeout(r, 0));
    const el = wrapper.querySelector('reke-table') as RekeTable | null;
    if (el) await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
  };

  // Wait for React to commit AND Lit to upgrade the custom element.
  await flush();

  const getTable = (): RekeTable => {
    const el = wrapper.querySelector('reke-table');
    if (!el) throw new Error('reke-table not mounted');
    return el as RekeTable;
  };

  const rerender = async (props: React.ComponentProps<typeof Table<TRow>>) => {
    root.render(React.createElement(Table as unknown as React.ComponentType<typeof props>, props));
    await flush();
  };

  const unmount = () => {
    root.unmount();
    wrapper.remove();
  };

  return { wrapper, root, getTable, rerender, unmount };
}

async function settle(el: RekeTable): Promise<void> {
  await new Promise((r) => setTimeout(r, 0));
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

async function flushExpandTransition(el: RekeTable): Promise<void> {
  await settle(el);
  await new Promise((r) => requestAnimationFrame(r));
  await settle(el);
  const grids = el.shadowRoot!.querySelectorAll('.expand-row--collapsed .expand-grid');
  for (const grid of grids) {
    grid.dispatchEvent(
      new TransitionEvent('transitionend', { propertyName: 'grid-template-rows' }),
    );
  }
  await settle(el);
}

describe('react-bridge / Table', () => {
  it('expanded row renders the React node and never emits `[object Object]`', async () => {
    const columns: ReactTableColumn<Row>[] = [
      { key: 'name', header: 'Name' },
      { key: 'role', header: 'Role' },
    ];

    const ExpandedPanel: React.FC<{ row: Row }> = ({ row }) =>
      React.createElement('div', { 'data-testid': 'expanded-panel' }, `details-for-${row.name}`);

    const { wrapper, getTable, unmount } = await mountBridge<Row>({
      columns,
      rows,
      getRowKey: (r) => r.id,
      expandedRowRender: (row) => React.createElement(ExpandedPanel, { row }),
    });

    const el = getTable();
    await settle(el);

    el.toggleExpand('a');
    await settle(el);

    const panel = el.shadowRoot!.querySelector('[data-testid="expanded-panel"]');
    expect(panel).toBeTruthy();
    expect(panel!.textContent).toBe('details-for-Alice');

    const text = el.shadowRoot!.textContent ?? '';
    expect(text.includes('[object Object]')).toBe(false);

    unmount();
    wrapper.remove();
  });

  it('cell renderer returning JSX renders as DOM and never emits `[object Object]`', async () => {
    const columns: ReactTableColumn<Row>[] = [
      {
        key: 'name',
        header: 'Name',
        render: (_value, row) =>
          React.createElement('strong', { 'data-testid': `cell-${row.id}` }, row.name),
      },
      { key: 'role', header: 'Role' },
    ];

    const { wrapper, getTable, unmount } = await mountBridge<Row>({
      columns,
      rows,
      getRowKey: (r) => r.id,
    });

    const el = getTable();
    await settle(el);

    const strong = el.shadowRoot!.querySelector('[data-testid="cell-a"]');
    expect(strong).toBeTruthy();
    expect(strong!.textContent).toBe('Alice');

    const text = el.shadowRoot!.textContent ?? '';
    expect(text.includes('[object Object]')).toBe(false);

    unmount();
    wrapper.remove();
  });

  it('collapsing an expanded row unmounts the React root and clears the host', async () => {
    let didUnmount = false;
    const Panel: React.FC<{ row: Row }> = ({ row }) => {
      React.useEffect(() => {
        return () => {
          didUnmount = true;
        };
      }, []);
      return React.createElement('div', { 'data-testid': 'panel' }, row.name);
    };

    const columns: ReactTableColumn<Row>[] = [
      { key: 'name', header: 'Name' },
      { key: 'role', header: 'Role' },
    ];

    const { wrapper, getTable, unmount } = await mountBridge<Row>({
      columns,
      rows,
      getRowKey: (r) => r.id,
      expandedRowRender: (row) => React.createElement(Panel, { row }),
    });

    const el = getTable();
    await settle(el);

    el.toggleExpand('a');
    await settle(el);

    expect(el.shadowRoot!.querySelector('[data-testid="panel"]')).toBeTruthy();

    el.toggleExpand('a');
    await flushExpandTransition(el);

    // Host's React content gone AND the React unmount effect ran.
    expect(el.shadowRoot!.querySelector('[data-testid="panel"]')).toBeNull();
    expect(didUnmount).toBe(true);

    unmount();
    wrapper.remove();
  });

  it('sort preserving keys does NOT remount the expanded row React root', async () => {
    let mountCount = 0;
    const Panel: React.FC<{ row: Row }> = ({ row }) => {
      React.useEffect(() => {
        mountCount += 1;
      }, []);
      return React.createElement('div', { 'data-testid': 'panel' }, row.name);
    };

    const columns: ReactTableColumn<Row>[] = [
      { key: 'name', header: 'Name' },
      { key: 'role', header: 'Role' },
    ];

    const { wrapper, getTable, rerender, unmount } = await mountBridge<Row>({
      columns,
      rows,
      getRowKey: (r) => r.id,
      expandedRowRender: (row) => React.createElement(Panel, { row }),
    });

    const el = getTable();
    await settle(el);

    el.toggleExpand('a');
    await settle(el);

    expect(mountCount).toBe(1);

    // Re-render with rows reordered — keys are stable, so the root MUST be reused.
    const reordered = [rows[2], rows[1], rows[0]];
    await rerender({
      columns,
      rows: reordered,
      getRowKey: (r) => r.id,
      expandedRowRender: (row) => React.createElement(Panel, { row }),
    });

    expect(mountCount).toBe(1);
    expect(el.shadowRoot!.querySelector('[data-testid="panel"]')!.textContent).toBe('Alice');

    unmount();
    wrapper.remove();
  });

  it('forwards getRowKey to the underlying reke-table element', async () => {
    const columns: ReactTableColumn<Row>[] = [
      { key: 'name', header: 'Name' },
      { key: 'role', header: 'Role' },
    ];

    const getRowKey = (r: Row) => r.id;

    const { wrapper, getTable, unmount } = await mountBridge<Row>({
      columns,
      rows,
      getRowKey,
    });

    const el = getTable();
    await settle(el);

    expect(typeof el.getRowKey).toBe('function');
    expect(el.getRowKey!(rows[0], 0)).toBe('a');
    expect(el.getRowKey!(rows[1], 1)).toBe('b');

    unmount();
    wrapper.remove();
  });

  it('cell renderer returning a string passes through and renders as text', async () => {
    const columns: ReactTableColumn<Row>[] = [
      {
        key: 'name',
        header: 'Name',
        render: (_value, row) => `plain-${row.name}`,
      },
      { key: 'role', header: 'Role' },
    ];

    const { wrapper, getTable, unmount } = await mountBridge<Row>({
      columns,
      rows,
      getRowKey: (r) => r.id,
    });

    const el = getTable();
    await settle(el);

    const cells = el.shadowRoot!.querySelectorAll('tbody .cell');
    // 2 cols × 3 rows = 6 cells
    expect(cells.length).toBe(6);
    expect(cells[0].textContent).toContain('plain-Alice');
    expect(cells[2].textContent).toContain('plain-Bob');

    unmount();
    wrapper.remove();
  });

  it('re-rendering the parent with a new expandedRowRender updates expanded content', async () => {
    const columns: ReactTableColumn<Row>[] = [
      { key: 'name', header: 'Name' },
      { key: 'role', header: 'Role' },
    ];

    const { wrapper, getTable, rerender, unmount } = await mountBridge<Row>({
      columns,
      rows,
      getRowKey: (r) => r.id,
      expandedRowRender: (row) =>
        React.createElement('div', { 'data-testid': 'panel' }, `v1-${row.name}`),
    });

    const el = getTable();
    await settle(el);

    el.toggleExpand('a');
    await settle(el);
    expect(el.shadowRoot!.querySelector('[data-testid="panel"]')!.textContent).toBe('v1-Alice');

    await rerender({
      columns,
      rows,
      getRowKey: (r) => r.id,
      expandedRowRender: (row) =>
        React.createElement('div', { 'data-testid': 'panel' }, `v2-${row.name}`),
    });

    expect(el.shadowRoot!.querySelector('[data-testid="panel"]')!.textContent).toBe('v2-Alice');

    const text = el.shadowRoot!.textContent ?? '';
    expect(text.includes('[object Object]')).toBe(false);

    unmount();
    wrapper.remove();
  });

  it('unmounting the bridge unmounts every cached React root', async () => {
    const unmountSpy = vi.fn();
    const Panel: React.FC<{ row: Row }> = ({ row }) => {
      React.useEffect(() => () => unmountSpy(), []);
      return React.createElement('div', null, row.name);
    };

    const columns: ReactTableColumn<Row>[] = [
      {
        key: 'name',
        header: 'Name',
        render: (_v, row) => React.createElement('strong', null, row.name),
      },
    ];

    const { wrapper, getTable, unmount } = await mountBridge<Row>({
      columns,
      rows,
      getRowKey: (r) => r.id,
      expandedRowRender: (row) => React.createElement(Panel, { row }),
    });

    const el = getTable();
    await settle(el);

    el.toggleExpand('a');
    await settle(el);

    unmount();
    // The Panel effect cleanup fires when the bridge unmounts its roots.
    expect(unmountSpy).toHaveBeenCalled();
    wrapper.remove();
  });
});
