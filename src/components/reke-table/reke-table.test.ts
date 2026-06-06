import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { html } from 'lit';
import './reke-table.js';
import type { RekeTable } from './reke-table.js';
import { runAxe } from '../../test-utils/a11y.js';

function createElement(markup: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.backgroundColor = '#0A0A0B';
  wrapper.style.padding = '16px';
  wrapper.innerHTML = markup;
  document.body.appendChild(wrapper);
  return wrapper;
}

async function waitForUpdate(el: RekeTable): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

const testColumns = [
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Role' },
];

const testRows = [
  { id: 'a', name: 'Alice', role: 'Engineer' },
  { id: 'b', name: 'Bob', role: 'Designer' },
  { id: 'c', name: 'Carol', role: 'Manager' },
];

describe('reke-table', () => {
  // --- RENDERING ---

  it('renders columns and rows', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    await waitForUpdate(el);

    const headers = el.shadowRoot!.querySelectorAll('.header-cell');
    expect(headers.length).toBe(2);
    expect(headers[0].textContent).toContain('Name');
    expect(headers[1].textContent).toContain('Role');

    const rows = el.shadowRoot!.querySelectorAll('.row');
    expect(rows.length).toBe(3);

    const cells = el.shadowRoot!.querySelectorAll('.cell');
    expect(cells[0].textContent).toContain('Alice');
    expect(cells[1].textContent).toContain('Engineer');

    wrapper.remove();
  });

  it('renders empty state when no rows', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = [];
    await waitForUpdate(el);

    const emptyCell = el.shadowRoot!.querySelector('.cell--empty');
    expect(emptyCell).toBeTruthy();
    expect(emptyCell!.textContent).toContain('No data');

    wrapper.remove();
  });

  it('renders striped modifier', async () => {
    const wrapper = createElement('<reke-table striped></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    await waitForUpdate(el);

    const table = el.shadowRoot!.querySelector('.table')!;
    expect(table.classList.contains('table--striped')).toBe(true);

    wrapper.remove();
  });

  it('renders dense modifier', async () => {
    const wrapper = createElement('<reke-table dense></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    await waitForUpdate(el);

    const table = el.shadowRoot!.querySelector('.table')!;
    expect(table.classList.contains('table--dense')).toBe(true);

    wrapper.remove();
  });

  it('renders custom cell content via column render function', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = [
      {
        key: 'name',
        header: 'Name',
        render: (value) => html`<strong class="custom-render">${value}</strong>`,
      },
      { key: 'role', header: 'Role' },
    ];
    el.rows = testRows;
    await waitForUpdate(el);

    const custom = el.shadowRoot!.querySelector('.custom-render');
    expect(custom).toBeTruthy();
    expect(custom!.textContent).toBe('Alice');

    const cells = el.shadowRoot!.querySelectorAll('.cell');
    expect(cells[1].textContent).toContain('Engineer');

    wrapper.remove();
  });

  it('renders toolbar slot when content is provided', async () => {
    const wrapper = createElement(
      '<reke-table><div slot="toolbar">Toolbar Content</div></reke-table>',
    );
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    await waitForUpdate(el);
    await new Promise((r) => setTimeout(r, 50));
    await waitForUpdate(el);

    const toolbar = el.shadowRoot!.querySelector('.table-toolbar');
    expect(toolbar).toBeTruthy();

    wrapper.remove();
  });

  it('renders footer slot when content is provided', async () => {
    const wrapper = createElement(
      '<reke-table><div slot="footer">Page 1 of 5</div></reke-table>',
    );
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    await waitForUpdate(el);
    await new Promise((r) => setTimeout(r, 50));
    await waitForUpdate(el);

    const footer = el.shadowRoot!.querySelector('.table-footer');
    expect(footer).toBeTruthy();

    wrapper.remove();
  });

  it('hides toolbar and footer wrappers when slots are empty', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    await waitForUpdate(el);

    const toolbar = el.shadowRoot!.querySelector('.table-toolbar');
    expect(toolbar).toBeNull();

    const footer = el.shadowRoot!.querySelector('.table-footer');
    expect(footer).toBeNull();

    wrapper.remove();
  });

  // Task 1.16: RENDERING — vanilla-DOM expandedRowElement mounts raw <div>
  it('mounts vanilla DOM into the host via expandedRowElement', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.expandedRowElement = (host) => {
      const n = document.createElement('div');
      n.textContent = 'raw';
      n.classList.add('vanilla-content');
      host.appendChild(n);
      return () => n.remove();
    };
    await waitForUpdate(el);

    el.toggleExpand(0);
    await waitForUpdate(el);

    const expandRow = el.shadowRoot!.querySelector('.expand-row');
    expect(expandRow).toBeTruthy();

    const content = el.shadowRoot!.querySelector('.vanilla-content');
    expect(content).toBeTruthy();
    expect(content!.textContent).toBe('raw');

    wrapper.remove();
  });

  // --- BEHAVIOR ---

  it('emits reke-row-click on row click', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-row-click', handler);

    const rows = el.shadowRoot!.querySelectorAll('.row');
    (rows[0] as HTMLElement).click();

    expect(handler).toHaveBeenCalledOnce();
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.row).toEqual({ id: 'a', name: 'Alice', role: 'Engineer' });
    expect(detail.index).toBe(0);

    wrapper.remove();
  });

  it('emits reke-sort on header click', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-sort', handler);

    const headers = el.shadowRoot!.querySelectorAll('.header-cell');
    (headers[0] as HTMLElement).click();
    await waitForUpdate(el);

    expect(handler).toHaveBeenCalledOnce();
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toEqual({
      key: 'name',
      direction: 'asc',
    });

    (headers[0] as HTMLElement).click();
    await waitForUpdate(el);

    expect(handler).toHaveBeenCalledTimes(2);
    expect((handler.mock.calls[1][0] as CustomEvent).detail).toEqual({
      key: 'name',
      direction: 'desc',
    });

    wrapper.remove();
  });

  it('shows sort indicator on sorted column', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    await waitForUpdate(el);

    const headers = el.shadowRoot!.querySelectorAll('.header-cell');
    (headers[0] as HTMLElement).click();
    await waitForUpdate(el);

    const indicator = el.shadowRoot!.querySelector('.sort-indicator');
    expect(indicator).toBeTruthy();
    expect(indicator!.textContent).toBe('↑');

    (headers[0] as HTMLElement).click();
    await waitForUpdate(el);

    const indicatorDesc = el.shadowRoot!.querySelector('.sort-indicator');
    expect(indicatorDesc!.textContent).toBe('↓');

    wrapper.remove();
  });

  it('sortable: false prevents sort on header click', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = [
      { key: 'name', header: 'Name' },
      { key: 'actions', header: 'Actions', sortable: false },
    ];
    el.rows = testRows;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-sort', handler);

    const headers = el.shadowRoot!.querySelectorAll('.header-cell');
    (headers[1] as HTMLElement).click();
    await waitForUpdate(el);

    expect(handler).not.toHaveBeenCalled();

    wrapper.remove();
  });

  it('expands and collapses a row via toggleExpand(index)', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.expandedRowElement = (host, row) => {
      const n = document.createElement('div');
      n.classList.add('detail-content');
      n.textContent = `${(row as { name: string }).name} details`;
      host.appendChild(n);
      return () => n.remove();
    };
    await waitForUpdate(el);

    el.toggleExpand(0);
    await waitForUpdate(el);

    expect(el.shadowRoot!.querySelector('.expand-row')).toBeTruthy();
    const detail = el.shadowRoot!.querySelector('.detail-content');
    expect(detail).toBeTruthy();
    expect(detail!.textContent).toBe('Alice details');

    el.toggleExpand(0);
    await waitForUpdate(el);

    expect(el.shadowRoot!.querySelector('.expand-row')).toBeNull();

    wrapper.remove();
  });

  it('supports multiple simultaneously expanded rows', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.expandedRowElement = (host, row) => {
      const n = document.createElement('div');
      n.textContent = (row as { name: string }).name;
      host.appendChild(n);
      return () => n.remove();
    };
    await waitForUpdate(el);

    el.toggleExpand(0);
    await waitForUpdate(el);
    el.toggleExpand(2);
    await waitForUpdate(el);

    const expandRows = el.shadowRoot!.querySelectorAll('.expand-row');
    expect(expandRows.length).toBe(2);

    wrapper.remove();
  });

  it('isRowExpanded returns correct state by key', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.getRowKey = (row) => (row as { id: string }).id;
    el.expandedRowElement = (host) => {
      const n = document.createElement('div');
      host.appendChild(n);
      return () => n.remove();
    };
    await waitForUpdate(el);

    expect(el.isRowExpanded('a')).toBe(false);

    el.toggleExpand('a');
    await waitForUpdate(el);

    expect(el.isRowExpanded('a')).toBe(true);
    expect(el.isRowExpanded('b')).toBe(false);

    wrapper.remove();
  });

  // Task 1.17: BEHAVIOR — collapse runs cleanup exactly once
  it('collapse runs cleanup exactly once', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    const cleanup = vi.fn();
    el.expandedRowElement = (host) => {
      host.appendChild(document.createElement('div'));
      return cleanup;
    };
    await waitForUpdate(el);

    el.toggleExpand(0);
    await waitForUpdate(el);
    expect(cleanup).not.toHaveBeenCalled();

    el.toggleExpand(0);
    await waitForUpdate(el);
    expect(cleanup).toHaveBeenCalledOnce();

    wrapper.remove();
  });

  // Task 1.18: BEHAVIOR — rapid expand→collapse→expand runs old cleanup BEFORE new mount
  it('rapid expand→collapse→expand runs old cleanup before new mount', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;

    const order: string[] = [];
    let mountCount = 0;
    el.expandedRowElement = (host) => {
      mountCount += 1;
      const id = mountCount;
      order.push(`mount-${id}`);
      const n = document.createElement('div');
      host.appendChild(n);
      return () => {
        order.push(`cleanup-${id}`);
        n.remove();
      };
    };
    await waitForUpdate(el);

    el.toggleExpand(0); // expand
    await waitForUpdate(el);
    el.toggleExpand(0); // collapse
    await waitForUpdate(el);
    el.toggleExpand(0); // re-expand
    await waitForUpdate(el);

    expect(mountCount).toBe(2);
    expect(order).toEqual(['mount-1', 'cleanup-1', 'mount-2']);

    wrapper.remove();
  });

  // Task 1.19: BEHAVIOR — removing <reke-table> invokes cleanup for every expanded row once
  it('disconnectedCallback invokes cleanup for every expanded row once', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.getRowKey = (row) => (row as { id: string }).id;
    const cleanups: Record<string, ReturnType<typeof vi.fn>> = {
      a: vi.fn(),
      b: vi.fn(),
    };
    el.expandedRowElement = (host, _row, key) => {
      host.appendChild(document.createElement('div'));
      return cleanups[key as string] as () => void;
    };
    await waitForUpdate(el);

    el.toggleExpand('a');
    await waitForUpdate(el);
    el.toggleExpand('b');
    await waitForUpdate(el);

    el.remove();
    await Promise.resolve();

    expect(cleanups.a).toHaveBeenCalledOnce();
    expect(cleanups.b).toHaveBeenCalledOnce();
  });

  // Task 1.20: BEHAVIOR — getRowKey keeps B expanded across [A,B,C] → [C,B,A]
  it('identity-keyed expand survives row reordering and reuses host', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.getRowKey = (row) => (row as { id: string }).id;

    let mountCount = 0;
    const hosts = new Map<string, HTMLElement>();
    el.expandedRowElement = (host, _row, key) => {
      mountCount += 1;
      hosts.set(key as string, host);
      const n = document.createElement('div');
      n.classList.add('detail-content');
      n.dataset.key = key as string;
      host.appendChild(n);
      return () => n.remove();
    };
    await waitForUpdate(el);

    el.toggleExpand('b');
    await waitForUpdate(el);

    expect(mountCount).toBe(1);
    const firstHost = hosts.get('b');
    expect(firstHost).toBeTruthy();

    // Reorder rows
    el.rows = [testRows[2], testRows[1], testRows[0]];
    await waitForUpdate(el);

    // 'b' still expanded
    expect(el.isRowExpanded('b')).toBe(true);
    // No remount
    expect(mountCount).toBe(1);
    // Host identity preserved
    expect(hosts.get('b')).toBe(firstHost);

    // Detail content is still in the DOM under the new B row
    const detail = el.shadowRoot!.querySelector('.detail-content');
    expect(detail).toBeTruthy();
    expect((detail as HTMLElement).dataset.key).toBe('b');

    wrapper.remove();
  });

  // Task 1.21: BEHAVIOR — parent re-render with unchanged keys preserves host and skips cleanup
  it('parent re-render with unchanged keys preserves host and skips cleanup', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.getRowKey = (row) => (row as { id: string }).id;

    const cleanup = vi.fn();
    let mountCount = 0;
    let lastHost: HTMLElement | null = null;
    el.expandedRowElement = (host) => {
      mountCount += 1;
      lastHost = host;
      host.appendChild(document.createElement('div'));
      return cleanup;
    };
    await waitForUpdate(el);

    el.toggleExpand('b');
    await waitForUpdate(el);

    expect(mountCount).toBe(1);
    const hostBefore = lastHost;

    // Trigger an unrelated re-render by changing a non-row property
    el.striped = true;
    await waitForUpdate(el);
    el.striped = false;
    await waitForUpdate(el);

    expect(mountCount).toBe(1);
    expect(cleanup).not.toHaveBeenCalled();
    expect(lastHost).toBe(hostBefore);

    wrapper.remove();
  });

  // Task 1.22: BEHAVIOR — removing B invokes B's cleanup once and clears caches
  it('removing an expanded row invokes its cleanup once', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.getRowKey = (row) => (row as { id: string }).id;

    const cleanup = vi.fn();
    el.expandedRowElement = (host, _row, key) => {
      host.appendChild(document.createElement('div'));
      if (key === 'b') return cleanup;
      return () => {};
    };
    await waitForUpdate(el);

    el.toggleExpand('b');
    await waitForUpdate(el);
    expect(cleanup).not.toHaveBeenCalled();

    // Remove row B
    el.rows = [testRows[0], testRows[2]];
    await waitForUpdate(el);

    expect(cleanup).toHaveBeenCalledOnce();

    wrapper.remove();
  });

  // Task 1.23: BEHAVIOR — duplicate getRowKey emits one-shot dev warn; last wins
  it('duplicate getRowKey values emit a one-shot dev warning and last wins', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = [
      { id: 'dup', name: 'First', role: 'A' },
      { id: 'dup', name: 'Last', role: 'B' },
      { id: 'unique', name: 'Carol', role: 'C' },
    ];
    el.getRowKey = (row) => (row as { id: string }).id;
    el.expandedRowElement = (host, row) => {
      const n = document.createElement('div');
      n.classList.add('detail-content');
      n.textContent = (row as { name: string }).name;
      host.appendChild(n);
      return () => n.remove();
    };
    await waitForUpdate(el);

    expect(warnSpy).toHaveBeenCalled();
    const warnMessages = warnSpy.mock.calls.map((c) => String(c[0]));
    expect(warnMessages.some((m) => m.includes('dup'))).toBe(true);

    // Force a re-render — warning still fires only once for this key
    const beforeCount = warnSpy.mock.calls.length;
    el.striped = true;
    await waitForUpdate(el);
    expect(warnSpy.mock.calls.length).toBe(beforeCount);

    // Last wins: expanding 'dup' should mount with the "Last" row
    el.toggleExpand('dup');
    await waitForUpdate(el);

    const detail = el.shadowRoot!.querySelector('.detail-content');
    expect(detail).toBeTruthy();
    expect(detail!.textContent).toBe('Last');

    warnSpy.mockRestore();
    wrapper.remove();
  });

  // Task 1.24: BEHAVIOR — reke-row-expand detail includes { row, index, key, expanded }
  it('reke-row-expand event detail includes row, index, key, expanded', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.getRowKey = (row) => (row as { id: string }).id;
    el.expandedRowElement = (host) => {
      host.appendChild(document.createElement('div'));
      return () => {};
    };
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-row-expand', handler);

    el.toggleExpand('b');
    await waitForUpdate(el);

    expect(handler).toHaveBeenCalledOnce();
    const expandDetail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(expandDetail.row).toEqual(testRows[1]);
    expect(expandDetail.index).toBe(1);
    expect(expandDetail.key).toBe('b');
    expect(expandDetail.expanded).toBe(true);

    el.toggleExpand('b');
    await waitForUpdate(el);

    const collapseDetail = (handler.mock.calls[1][0] as CustomEvent).detail;
    expect(collapseDetail.row).toEqual(testRows[1]);
    expect(collapseDetail.index).toBe(1);
    expect(collapseDetail.key).toBe('b');
    expect(collapseDetail.expanded).toBe(false);

    wrapper.remove();
  });

  // --- ACCESSIBILITY ---

  it('passes axe-core a11y audit', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const violations = results.violations.filter(
      (v) => v.id !== 'color-contrast',
    );
    expect(violations).toEqual([]);

    wrapper.remove();
  });

  it('passes a11y audit with empty table', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = [];
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const violations = results.violations.filter(
      (v) => v.id !== 'color-contrast',
    );
    expect(violations).toEqual([]);

    wrapper.remove();
  });

  it('passes a11y audit with expanded rows', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.expandedRowElement = (host, row) => {
      const n = document.createElement('div');
      n.textContent = `${(row as { name: string }).name} details`;
      host.appendChild(n);
      return () => n.remove();
    };
    el.toggleExpand(0);
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const violations = results.violations.filter(
      (v) => v.id !== 'color-contrast',
    );
    expect(violations).toEqual([]);

    wrapper.remove();
  });
});
