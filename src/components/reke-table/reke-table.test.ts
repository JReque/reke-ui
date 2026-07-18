import { html } from 'lit';
import { describe, expect, it, vi } from 'vitest';
import './reke-table.js';
import { runAxe } from '../../test-utils/a11y.js';
import type { RekeTable } from './reke-table.js';

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

/**
 * Wait for the enter animation to settle. A freshly-expanded row renders
 * collapsed for one frame, then releases on the next rAF via requestUpdate.
 * Use this before asserting the settled (non-collapsed) class after expanding.
 */
async function flushEnterTransition(el: RekeTable): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => requestAnimationFrame(r));
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

/** Dispatch transitionend on all collapsing expand rows so cleanup runs. */
async function flushExpandTransition(el: RekeTable): Promise<void> {
  await waitForUpdate(el);
  await new Promise((r) => requestAnimationFrame(r));
  await waitForUpdate(el);
  const grids = el.shadowRoot!.querySelectorAll('.expand-row--collapsed .expand-grid');
  for (const grid of grids) {
    grid.dispatchEvent(
      new TransitionEvent('transitionend', { propertyName: 'grid-template-rows' }),
    );
  }
  await waitForUpdate(el);
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
    const wrapper = createElement('<reke-table><div slot="footer">Page 1 of 5</div></reke-table>');
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
    await flushEnterTransition(el);

    expect(el.shadowRoot!.querySelector('.expand-row')).toBeTruthy();
    // The expanded row's expand content should NOT be collapsed.
    expect(el.shadowRoot!.querySelector('.expand-row:not(.expand-row--collapsed)')).toBeTruthy();
    const detail = el.shadowRoot!.querySelector('.detail-content');
    expect(detail).toBeTruthy();
    expect(detail!.textContent).toBe('Alice details');

    el.toggleExpand(0);
    await flushExpandTransition(el);

    expect(el.shadowRoot!.querySelector('.expand-row--collapsed')).toBeTruthy();
    expect(el.shadowRoot!.querySelector('.detail-content')).toBeNull();

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
    await flushEnterTransition(el);

    const expandRows = el.shadowRoot!.querySelectorAll('.expand-row:not(.expand-row--collapsed)');
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

  it('vanilla-DOM expandedRowElement cleanup removes the appended node on collapse', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.expandedRowElement = (host) => {
      const n = document.createElement('div');
      n.textContent = 'raw';
      n.classList.add('vanilla-cleanup-test');
      host.appendChild(n);
      return () => n.remove();
    };
    await waitForUpdate(el);

    el.toggleExpand(0);
    await waitForUpdate(el);
    expect(el.shadowRoot!.querySelector('.vanilla-cleanup-test')).toBeTruthy();

    el.toggleExpand(0);
    await flushExpandTransition(el);
    expect(el.shadowRoot!.querySelector('.vanilla-cleanup-test')).toBeNull();
    expect(el.shadowRoot!.querySelector('.expand-row--collapsed')).toBeTruthy();

    wrapper.remove();
  });

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
    await flushExpandTransition(el);
    expect(cleanup).toHaveBeenCalledOnce();

    wrapper.remove();
  });

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
    el.toggleExpand(0); // re-expand — cancels the pending collapse
    await waitForUpdate(el);

    expect(mountCount).toBe(1);
    expect(order).toEqual(['mount-1']);

    wrapper.remove();
  });

  it('same-task collapse then re-expand runs old cleanup before new mount', async () => {
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

    // Collapse and re-expand synchronously, no waitForUpdate between them.
    // Collapse defers cleanup; re-expand cancels it.
    el.toggleExpand(0); // collapse — deferred
    el.toggleExpand(0); // re-expand — cancels pending collapse
    await waitForUpdate(el);

    expect(mountCount).toBe(1);
    expect(order).toEqual(['mount-1']);

    wrapper.remove();
  });

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

    // Reorder rows so that the expanded row 'b' ACTUALLY changes index (1 → 0).
    el.rows = [testRows[1], testRows[2], testRows[0]];
    await waitForUpdate(el);

    // 'b' still expanded
    expect(el.isRowExpanded('b')).toBe(true);
    // Other keys are NOT expanded
    expect(el.isRowExpanded('a')).toBe(false);
    expect(el.isRowExpanded('c')).toBe(false);
    // No remount
    expect(mountCount).toBe(1);
    // Host identity preserved (same DOM node reused)
    expect(hosts.get('b')).toBe(firstHost);

    // Detail content is still in the DOM under the new B row, on the SAME node
    const detail = el.shadowRoot!.querySelector('.detail-content');
    expect(detail).toBeTruthy();
    expect((detail as HTMLElement).dataset.key).toBe('b');
    expect((firstHost as HTMLElement).contains(detail)).toBe(true);

    wrapper.remove();
  });

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

  it('removing an expanded row purges expand state and re-add does not auto-expand', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.getRowKey = (row) => (row as { id: string }).id;

    const cleanup = vi.fn();
    let mountCount = 0;
    el.expandedRowElement = (host, _row, key) => {
      if (key === 'b') mountCount += 1;
      host.appendChild(document.createElement('div'));
      return key === 'b' ? cleanup : () => {};
    };
    await waitForUpdate(el);

    el.toggleExpand('b');
    await waitForUpdate(el);
    expect(el.isRowExpanded('b')).toBe(true);
    expect(mountCount).toBe(1);

    // Remove row B
    el.rows = [testRows[0], testRows[2]];
    await waitForUpdate(el);

    // Cleanup fired once AND expand state purged
    expect(cleanup).toHaveBeenCalledOnce();
    expect(el.isRowExpanded('b')).toBe(false);

    // Re-add a row with key 'b' — it must render COLLAPSED, not auto-expanded or re-mounted
    el.rows = [testRows[0], testRows[1], testRows[2]];
    await waitForUpdate(el);

    expect(el.isRowExpanded('b')).toBe(false);
    expect(mountCount).toBe(1);
    // Row B's expand row is present but collapsed (animation target).
    const collapsedRows = el.shadowRoot!.querySelectorAll('.expand-row--collapsed');
    expect(collapsedRows.length).toBeGreaterThan(0);

    wrapper.remove();
  });

  it('purges a never-mounted expand key removed in the same tick and re-add stays collapsed', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.getRowKey = (row) => (row as { id: string }).id;

    let mountCount = 0;
    el.expandedRowElement = (host, _row, key) => {
      if (key === 'b') mountCount += 1;
      host.appendChild(document.createElement('div'));
      return () => {};
    };
    await waitForUpdate(el);

    // Expand 'b' and remove 'b' in the SAME tick: 'b' enters expandedRows but its
    // row never renders, so the host is never created (never enters _hostCache).
    el.toggleExpand('b');
    el.rows = [testRows[0], testRows[2]];
    await waitForUpdate(el);

    // Phantom key must be purged even though it was never mounted.
    expect(el.isRowExpanded('b')).toBe(false);
    expect(mountCount).toBe(0);
    // All expand rows are collapsed since nothing is expanded.
    const allExpandRows = el.shadowRoot!.querySelectorAll('.expand-row');
    const expandedRows = el.shadowRoot!.querySelectorAll('.expand-row:not(.expand-row--collapsed)');
    expect(expandedRows.length).toBe(0);
    expect(allExpandRows.length).toBeGreaterThan(0);

    // Re-add a row with key 'b' — must render COLLAPSED and stay unmounted.
    el.rows = [testRows[0], testRows[1], testRows[2]];
    await waitForUpdate(el);

    expect(el.isRowExpanded('b')).toBe(false);
    expect(mountCount).toBe(0);

    wrapper.remove();
  });

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
    const violations = results.violations.filter((v) => v.id !== 'color-contrast');
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
    const violations = results.violations.filter((v) => v.id !== 'color-contrast');
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
    const violations = results.violations.filter((v) => v.id !== 'color-contrast');
    expect(violations).toEqual([]);

    wrapper.remove();
  });

  // ============================================================
  // ============================================================

  it('chevron OFF: no leading toggle column or chevron button is rendered', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    await waitForUpdate(el);

    expect(el.shadowRoot!.querySelector('.expand-toggle-cell')).toBeNull();
    expect(el.shadowRoot!.querySelector('.expand-toggle-button')).toBeNull();
    // Header cell count equals the consumer-provided columns (no extra leading th).
    const headers = el.shadowRoot!.querySelectorAll('thead .header-cell');
    expect(headers.length).toBe(testColumns.length);
    // Each data row has exactly testColumns.length cells (no extra leading td).
    const firstRow = el.shadowRoot!.querySelector('tbody .row')!;
    expect(firstRow.querySelectorAll('td').length).toBe(testColumns.length);

    wrapper.remove();
  });

  it('chevron ON: renders a leading <button> per row with aria-expanded and aria-controls', async () => {
    const wrapper = createElement('<reke-table expandable></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.getRowKey = (row) => (row as { id: string }).id;
    el.expandedRowElement = (host) => {
      host.appendChild(document.createElement('div'));
      return () => {};
    };
    await waitForUpdate(el);

    // One leading toggle cell + button per row, sitting before the consumer columns.
    const buttons = el.shadowRoot!.querySelectorAll<HTMLButtonElement>(
      'tbody .expand-toggle-button',
    );
    expect(buttons.length).toBe(testRows.length);

    // Header has a leading empty toggle header cell as well, to keep column alignment.
    const headers = el.shadowRoot!.querySelectorAll(
      'thead .header-cell, thead .expand-toggle-header-cell',
    );
    expect(headers.length).toBe(testColumns.length + 1);

    // Each row has columns.length + 1 cells (leading toggle cell first).
    const firstRow = el.shadowRoot!.querySelector('tbody .row')!;
    const firstRowCells = firstRow.querySelectorAll('td');
    expect(firstRowCells.length).toBe(testColumns.length + 1);
    expect(firstRowCells[0].classList.contains('expand-toggle-cell')).toBe(true);

    // ARIA: aria-expanded="false" + aria-controls pointing at the expand <td> id.
    const firstButton = buttons[0]!;
    expect(firstButton.getAttribute('aria-expanded')).toBe('false');
    const ariaControls = firstButton.getAttribute('aria-controls');
    expect(ariaControls).toBe('reke-table-expand-a');

    // axe-core: zero violations (ignoring pre-existing color-contrast noise).
    const results = await runAxe(wrapper);
    const violations = results.violations.filter((v) => v.id !== 'color-contrast');
    expect(violations).toEqual([]);

    wrapper.remove();
  });

  it('chevron ON: aria-expanded reflects expanded state and axe stays clean when expanded', async () => {
    const wrapper = createElement('<reke-table expandable></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.getRowKey = (row) => (row as { id: string }).id;
    el.expandedRowElement = (host, row) => {
      const n = document.createElement('div');
      n.textContent = `${(row as { name: string }).name} details`;
      host.appendChild(n);
      return () => n.remove();
    };
    await waitForUpdate(el);

    const buttons = el.shadowRoot!.querySelectorAll<HTMLButtonElement>(
      'tbody .expand-toggle-button',
    );
    expect(buttons[0].getAttribute('aria-expanded')).toBe('false');

    // Click the first chevron — should expand.
    buttons[0].click();
    await waitForUpdate(el);

    const buttonsAfter = el.shadowRoot!.querySelectorAll<HTMLButtonElement>(
      'tbody .expand-toggle-button',
    );
    expect(buttonsAfter[0].getAttribute('aria-expanded')).toBe('true');

    // Expand row visible with the host id matching aria-controls.
    const expandRow = el.shadowRoot!.querySelector('.expand-row');
    expect(expandRow).toBeTruthy();
    const expandTd = el.shadowRoot!.querySelector('.expand-content') as HTMLElement;
    expect(expandTd).toBeTruthy();
    expect(expandTd.id).toBe('reke-table-expand-a');
    expect(expandTd.id).toBe(buttonsAfter[0].getAttribute('aria-controls'));

    // Axe-core on expanded state with chevron ON.
    const results = await runAxe(wrapper);
    const violations = results.violations.filter((v) => v.id !== 'color-contrast');
    expect(violations).toEqual([]);

    wrapper.remove();
  });

  it('chevron ON: Enter and Space activate the toggle button', async () => {
    const wrapper = createElement('<reke-table expandable></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.getRowKey = (row) => (row as { id: string }).id;
    el.expandedRowElement = (host) => {
      host.appendChild(document.createElement('div'));
      return () => {};
    };
    await waitForUpdate(el);

    const getButton = () =>
      el.shadowRoot!.querySelector<HTMLButtonElement>('tbody .row .expand-toggle-button')!;

    // Enter expands.
    getButton().focus();
    getButton().dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    );
    await waitForUpdate(el);
    expect(getButton().getAttribute('aria-expanded')).toBe('true');
    expect(el.isRowExpanded('a')).toBe(true);

    // Space collapses (and preventDefault prevents page scroll — we just verify toggle).
    const spaceEvent = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });
    getButton().dispatchEvent(spaceEvent);
    await waitForUpdate(el);
    // Phase 2 of collapse: RAF removes key from expandedRows.
    await new Promise((r) => requestAnimationFrame(r));
    await waitForUpdate(el);
    expect(spaceEvent.defaultPrevented).toBe(true);
    expect(getButton().getAttribute('aria-expanded')).toBe('false');
    expect(el.isRowExpanded('a')).toBe(false);

    wrapper.remove();
  });

  it('chevron click fires reke-row-expand with the correct row key', async () => {
    const wrapper = createElement('<reke-table expandable></reke-table>');
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

    const buttons = el.shadowRoot!.querySelectorAll<HTMLButtonElement>(
      'tbody .expand-toggle-button',
    );
    buttons[1].click(); // row 'b'
    await waitForUpdate(el);

    expect(handler).toHaveBeenCalledOnce();
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.key).toBe('b');
    expect(detail.expanded).toBe(true);
    expect(detail.index).toBe(1);
    expect(detail.row).toEqual(testRows[1]);

    wrapper.remove();
  });

  it('chevron click does not also trigger reke-row-click', async () => {
    const wrapper = createElement('<reke-table expandable></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.getRowKey = (row) => (row as { id: string }).id;
    el.expandedRowElement = (host) => {
      host.appendChild(document.createElement('div'));
      return () => {};
    };
    await waitForUpdate(el);

    const rowClickHandler = vi.fn();
    el.addEventListener('reke-row-click', rowClickHandler);

    const button = el.shadowRoot!.querySelector<HTMLButtonElement>('tbody .expand-toggle-button')!;
    button.click();
    await waitForUpdate(el);

    expect(rowClickHandler).not.toHaveBeenCalled();

    wrapper.remove();
  });

  it('chevron ON: passes a11y audit on an empty table', async () => {
    const wrapper = createElement('<reke-table expandable></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = [];
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const violations = results.violations.filter((v) => v.id !== 'color-contrast');
    expect(violations).toEqual([]);

    wrapper.remove();
  });

  // ============================================================
  // ============================================================

  // BEHAVIOR — `expandOnRowClick=true` toggles expand on row click
  it('expandOnRowClick ON: clicking a row toggles expand (open then close)', async () => {
    const wrapper = createElement('<reke-table expand-on-row-click></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.getRowKey = (row) => (row as { id: string }).id;
    el.expandedRowElement = (host, row) => {
      const n = document.createElement('div');
      n.classList.add('detail-content');
      n.textContent = `${(row as { name: string }).name} details`;
      host.appendChild(n);
      return () => n.remove();
    };
    await waitForUpdate(el);

    expect(el.isRowExpanded('a')).toBe(false);

    const rows = el.shadowRoot!.querySelectorAll('tbody .row');
    (rows[0] as HTMLElement).click();
    await waitForUpdate(el);

    expect(el.isRowExpanded('a')).toBe(true);
    const detail = el.shadowRoot!.querySelector('.detail-content');
    expect(detail).toBeTruthy();
    expect(detail!.textContent).toBe('Alice details');

    // Click again — collapses.
    const rowsAfter = el.shadowRoot!.querySelectorAll('tbody .row');
    (rowsAfter[0] as HTMLElement).click();
    await flushExpandTransition(el);

    expect(el.isRowExpanded('a')).toBe(false);
    expect(el.shadowRoot!.querySelector('.expand-row--collapsed')).toBeTruthy();
    expect(el.shadowRoot!.querySelector('.detail-content')).toBeNull();

    wrapper.remove();
  });

  // BEHAVIOR — default OFF: clicking a row does NOT toggle expand
  it('expandOnRowClick OFF (default): clicking a row does not toggle expand', async () => {
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

    expect(el.expandOnRowClick).toBe(false);
    expect(el.isRowExpanded('a')).toBe(false);

    const rows = el.shadowRoot!.querySelectorAll('tbody .row');
    (rows[0] as HTMLElement).click();
    await waitForUpdate(el);

    expect(el.isRowExpanded('a')).toBe(false);
    // Expand rows are always in DOM (collapsed) when expandedRowElement is set.
    // Verify none are in the expanded state.
    expect(el.shadowRoot!.querySelector('.expand-row:not(.expand-row--collapsed)')).toBeNull();

    wrapper.remove();
  });

  // BEHAVIOR — chevron + expandOnRowClick: chevron click toggles exactly once (no double toggle)
  it('chevron + expandOnRowClick ON: chevron click toggles exactly once', async () => {
    const wrapper = createElement('<reke-table expandable expand-on-row-click></reke-table>');
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

    expect(el.isRowExpanded('a')).toBe(false);

    const button = el.shadowRoot!.querySelector<HTMLButtonElement>('tbody .expand-toggle-button')!;
    button.click();
    await waitForUpdate(el);

    // State flipped exactly once → now expanded.
    expect(el.isRowExpanded('a')).toBe(true);
    // Event fired exactly once (no double toggle bubbling into row handler).
    expect(handler).toHaveBeenCalledOnce();
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.key).toBe('a');
    expect(detail.expanded).toBe(true);

    wrapper.remove();
  });

  // BEHAVIOR — `reke-row-click` still emitted on row click when `expandOnRowClick` is ON
  it('expandOnRowClick ON: still emits reke-row-click on row click', async () => {
    const wrapper = createElement('<reke-table expand-on-row-click></reke-table>');
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
    el.addEventListener('reke-row-click', handler);

    const rows = el.shadowRoot!.querySelectorAll('tbody .row');
    (rows[1] as HTMLElement).click();
    await waitForUpdate(el);

    expect(handler).toHaveBeenCalledOnce();
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.row).toEqual(testRows[1]);
    expect(detail.index).toBe(1);
    // And internal toggle still ran.
    expect(el.isRowExpanded('b')).toBe(true);

    wrapper.remove();
  });

  // ACCESSIBILITY — axe clean with both flags ON and expanded state
  it('expandOnRowClick + expandable ON: passes a11y audit in expanded state', async () => {
    const wrapper = createElement('<reke-table expandable expand-on-row-click></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.getRowKey = (row) => (row as { id: string }).id;
    el.expandedRowElement = (host, row) => {
      const n = document.createElement('div');
      n.textContent = `${(row as { name: string }).name} details`;
      host.appendChild(n);
      return () => n.remove();
    };
    await waitForUpdate(el);

    el.toggleExpand('a');
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const violations = results.violations.filter((v) => v.id !== 'color-contrast');
    expect(violations).toEqual([]);

    wrapper.remove();
  });
});
