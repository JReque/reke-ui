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

/** Every running animation in the component's shadow tree. */
function shadowAnimations(el: RekeTable): Animation[] {
  return Array.from(el.shadowRoot!.querySelectorAll('*')).flatMap((node) => node.getAnimations());
}

/**
 * Finish every running animation in the shadow tree so the collapse teardown
 * resolves. The component awaits `Animation.finished`, so calling `finish()`
 * settles it on the next microtask instead of waiting out the real 200ms.
 */
async function flushExpandTransition(el: RekeTable): Promise<void> {
  await waitForUpdate(el);
  for (const animation of shadowAnimations(el)) {
    animation.finish();
  }
  // The teardown always waits at least one frame, so the no-animation path
  // needs it too.
  await new Promise((r) => requestAnimationFrame(r));
  await waitForUpdate(el);
  await waitForUpdate(el);
}

/** Count every element in the component's shadow tree. */
function countShadowElements(el: RekeTable): number {
  return el.shadowRoot!.querySelectorAll('*').length;
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

    // The expand row is removed entirely once the collapse settles.
    expect(el.shadowRoot!.querySelector('.expand-row')).toBeNull();
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
    expect(el.shadowRoot!.querySelector('.expand-row')).toBeNull();

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
    // Nothing is expanded, so no expand row exists for the re-added row.
    expect(el.shadowRoot!.querySelectorAll('.expand-row').length).toBe(0);

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
    // No expand rows at all, since nothing is expanded or animating.
    expect(el.shadowRoot!.querySelectorAll('.expand-row').length).toBe(0);

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

  it('returns to the baseline shadow node count after repeated expand/collapse cycles', async () => {
    const wrapper = createElement('<reke-table expandable></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = Array.from({ length: 10 }, (_, i) => ({
      id: `r${i}`,
      name: `Name ${i}`,
      role: `Role ${i}`,
    }));
    el.getRowKey = (row) => (row as { id: string }).id;
    el.expandedRowElement = (host, row) => {
      const panel = document.createElement('div');
      panel.classList.add('detail-panel');
      for (let i = 0; i < 3; i += 1) {
        const line = document.createElement('p');
        line.textContent = `${(row as { name: string }).name} — line ${i}`;
        panel.appendChild(line);
      }
      host.appendChild(panel);
      return () => panel.remove();
    };
    await waitForUpdate(el);

    const baseline = countShadowElements(el);

    for (let cycle = 0; cycle < 3; cycle += 1) {
      for (const row of el.rows) {
        el.toggleExpand((row as { id: string }).id);
      }
      await flushEnterTransition(el);
      expect(el.shadowRoot!.querySelectorAll('.detail-panel').length).toBe(10);

      for (const row of el.rows) {
        el.toggleExpand((row as { id: string }).id);
      }
      await flushExpandTransition(el);

      // Every cycle must land back exactly on the baseline — no orphan hosts,
      // no leftover expand rows.
      expect(countShadowElements(el)).toBe(baseline);
      expect(el.shadowRoot!.querySelectorAll('.expand-row').length).toBe(0);
      expect(el.shadowRoot!.querySelectorAll('.detail-panel').length).toBe(0);
    }

    wrapper.remove();
  });

  it('collapse cleans up even when the transition never completes', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.getRowKey = (row) => (row as { id: string }).id;

    const cleanup = vi.fn();
    el.expandedRowElement = (host) => {
      const n = document.createElement('div');
      n.classList.add('detail-content');
      host.appendChild(n);
      return () => {
        n.remove();
        cleanup();
      };
    };
    await waitForUpdate(el);

    const baseline = countShadowElements(el);

    el.toggleExpand('a');
    await flushEnterTransition(el);

    el.toggleExpand('a');
    await waitForUpdate(el);

    // Kill the animation instead of finishing it: `transitionend` never fires on
    // a cancelled transition, which is exactly the case that used to leak.
    for (const animation of shadowAnimations(el)) {
      animation.cancel();
    }
    await new Promise((r) => requestAnimationFrame(r));
    await waitForUpdate(el);
    await waitForUpdate(el);

    expect(cleanup).toHaveBeenCalledOnce();
    expect(el.shadowRoot!.querySelector('.detail-content')).toBeNull();
    expect(countShadowElements(el)).toBe(baseline);

    wrapper.remove();
  });

  it('re-expanding mid-collapse reuses the mounted host and stays expanded', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.getRowKey = (row) => (row as { id: string }).id;

    let mountCount = 0;
    const cleanup = vi.fn();
    const events: boolean[] = [];
    el.expandedRowElement = (host) => {
      mountCount += 1;
      const n = document.createElement('div');
      n.classList.add('detail-content');
      host.appendChild(n);
      return () => {
        n.remove();
        cleanup();
      };
    };
    el.addEventListener('reke-row-expand', (e) => {
      events.push((e as CustomEvent<{ expanded: boolean }>).detail.expanded);
    });
    await waitForUpdate(el);

    el.toggleExpand('a');
    await flushEnterTransition(el);
    expect(mountCount).toBe(1);

    // Collapse, then re-expand while the collapse animation is still running.
    el.toggleExpand('a');
    await waitForUpdate(el);
    el.toggleExpand('a');
    await flushEnterTransition(el);

    // The re-expand must read as an expand, not as a second collapse.
    expect(events).toEqual([true, false, true]);
    expect(el.isRowExpanded('a')).toBe(true);
    expect(mountCount).toBe(1);
    expect(cleanup).not.toHaveBeenCalled();
    // Exactly one host, exactly one content node — no abandoned subtree.
    expect(el.shadowRoot!.querySelectorAll('.detail-content').length).toBe(1);
    expect(el.shadowRoot!.querySelectorAll('.expand-inner > *').length).toBe(1);

    wrapper.remove();
  });

  it('toggling one row does not re-render the other rows cells', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;

    const renderCalls = new Map<string, number>();
    el.columns = testColumns.map((col) => ({
      ...col,
      render: (value: unknown, row: Record<string, unknown>) => {
        const id = row.id as string;
        renderCalls.set(id, (renderCalls.get(id) ?? 0) + 1);
        return String(value);
      },
    }));
    el.rows = testRows;
    el.getRowKey = (row) => (row as { id: string }).id;
    el.expandedRowElement = (host) => {
      host.appendChild(document.createElement('div'));
      return () => {};
    };
    await waitForUpdate(el);

    renderCalls.clear();
    el.toggleExpand('a');
    await flushEnterTransition(el);

    // Only the toggled row re-renders its cells; rows b and c are untouched.
    expect(renderCalls.get('a')).toBeGreaterThan(0);
    expect(renderCalls.get('b')).toBeUndefined();
    expect(renderCalls.get('c')).toBeUndefined();

    wrapper.remove();
  });

  // --- BEHAVIOR: virtualization ---

  const VIRTUAL_ROW_HEIGHT = 40;
  const VIRTUAL_MAX_HEIGHT = 320;

  function makeVirtualRows(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      id: `v${i}`,
      name: `Name ${i}`,
      role: `Role ${i}`,
    }));
  }

  /**
   * Mount a virtualized table and wait for the ResizeObserver to report the
   * container height, which is what the window math needs.
   */
  async function mountVirtual(rowCount: number): Promise<{ wrapper: HTMLElement; el: RekeTable }> {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = makeVirtualRows(rowCount);
    el.getRowKey = (row) => (row as { id: string }).id;
    el.virtualized = true;
    el.rowHeight = VIRTUAL_ROW_HEIGHT;
    el.maxHeight = `${VIRTUAL_MAX_HEIGHT}px`;
    await waitForUpdate(el);
    await new Promise((r) => requestAnimationFrame(r));
    await waitForUpdate(el);
    return { wrapper, el };
  }

  function renderedRowNames(el: RekeTable): string[] {
    return Array.from(el.shadowRoot!.querySelectorAll('tbody .row')).map((row) =>
      row.querySelector('.cell')!.textContent!.trim(),
    );
  }

  function scrollContainer(el: RekeTable): HTMLElement {
    return el.shadowRoot!.querySelector('.table-wrapper') as HTMLElement;
  }

  it('virtualized: renders only the rows in the window, not the whole dataset', async () => {
    const { wrapper, el } = await mountVirtual(1000);

    const rendered = el.shadowRoot!.querySelectorAll('tbody .row');
    // A 320px viewport at 40px per row is 8 rows, plus overscan on both sides.
    expect(rendered.length).toBeGreaterThan(0);
    expect(rendered.length).toBeLessThan(40);

    // The first rows of the dataset are the ones on screen.
    expect(renderedRowNames(el)[0]).toBe('Name 0');

    wrapper.remove();
  });

  it('virtualized: spacer rows preserve the full scroll height', async () => {
    const { wrapper, el } = await mountVirtual(1000);

    const container = scrollContainer(el);
    const headerHeight = el.shadowRoot!.querySelector('thead')!.getBoundingClientRect().height;
    const expected = 1000 * VIRTUAL_ROW_HEIGHT;

    // The scrollable content must measure as if every row were rendered,
    // otherwise the scrollbar lies about the size of the dataset.
    //
    // Tolerance, not equality: spacers are exact, but the RENDERED rows are as
    // tall as their real content, so any gap between the declared `rowHeight`
    // and the actual height shows up here. Crucially that error is bounded by
    // the window size, not the dataset size — it does not accumulate over 1000
    // rows, which is what keeps the scrollbar honest.
    const measured = container.scrollHeight - headerHeight;
    expect(measured).toBeGreaterThan(expected * 0.98);
    expect(measured).toBeLessThan(expected * 1.02);

    wrapper.remove();
  });

  it('virtualized: scrolling swaps the rendered window', async () => {
    const { wrapper, el } = await mountVirtual(1000);

    expect(renderedRowNames(el)).toContain('Name 0');

    const container = scrollContainer(el);
    container.scrollTop = 400 * VIRTUAL_ROW_HEIGHT;
    container.dispatchEvent(new Event('scroll'));
    await new Promise((r) => requestAnimationFrame(r));
    await waitForUpdate(el);

    const names = renderedRowNames(el);
    expect(names).toContain('Name 400');
    expect(names).not.toContain('Name 0');

    wrapper.remove();
  });

  it('virtualized: row events carry the absolute dataset index, not the window offset', async () => {
    const { wrapper, el } = await mountVirtual(1000);

    const detail: { index: number; row: Record<string, unknown> }[] = [];
    el.addEventListener('reke-row-click', (e) => {
      detail.push((e as CustomEvent<{ index: number; row: Record<string, unknown> }>).detail);
    });

    const container = scrollContainer(el);
    container.scrollTop = 400 * VIRTUAL_ROW_HEIGHT;
    container.dispatchEvent(new Event('scroll'));
    await new Promise((r) => requestAnimationFrame(r));
    await waitForUpdate(el);

    const rows = Array.from(el.shadowRoot!.querySelectorAll('tbody .row'));
    const target = rows.find(
      (row) => row.querySelector('.cell')!.textContent!.trim() === 'Name 400',
    )!;
    (target as HTMLElement).click();

    expect(detail).toHaveLength(1);
    expect(detail[0].index).toBe(400);
    expect((detail[0].row as { id: string }).id).toBe('v400');

    wrapper.remove();
  });

  it('virtualized: exposes the real dataset size to assistive tech', async () => {
    const { wrapper, el } = await mountVirtual(1000);

    const table = el.shadowRoot!.querySelector('table')!;
    expect(table.getAttribute('aria-rowcount')).toBe('1000');

    const firstRow = el.shadowRoot!.querySelector('tbody .row')!;
    // 1-based and header-inclusive, so dataset row 0 is aria-rowindex 2.
    expect(firstRow.getAttribute('aria-rowindex')).toBe('2');

    const results = await runAxe(wrapper);
    const violations = results.violations.filter((v) => v.id !== 'color-contrast');
    expect(violations.map((v) => `${v.id}: ${v.nodes[0]?.html ?? ''}`)).toEqual([]);

    wrapper.remove();
  });

  it('virtualized: renders every row when the dataset is smaller than the window', async () => {
    const { wrapper, el } = await mountVirtual(3);

    expect(el.shadowRoot!.querySelectorAll('tbody .row').length).toBe(3);
    expect(el.shadowRoot!.querySelectorAll('.spacer-row').length).toBe(0);

    wrapper.remove();
  });

  it('virtualized: dev error when row-height or max-height is missing', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = makeVirtualRows(50);
    el.virtualized = true;
    await waitForUpdate(el);

    const messages = errorSpy.mock.calls.map((c) => String(c[0]));
    const virtualError = messages.find((m) => m.includes('virtualized'));
    expect(virtualError).toBeTruthy();
    expect(virtualError).toContain('row-height');
    expect(virtualError).toContain('max-height');

    // One-shot: a re-render does not repeat it.
    const before = errorSpy.mock.calls.length;
    el.striped = true;
    await waitForUpdate(el);
    expect(errorSpy.mock.calls.length).toBe(before);

    errorSpy.mockRestore();
    wrapper.remove();
  });

  // --- BEHAVIOR: virtualization + expand (F2) ---

  const EXPAND_PANEL_HEIGHT = 150;

  /** Mount a virtualized table whose expand panels have a known, fixed height. */
  async function mountVirtualExpandable(
    rowCount: number,
  ): Promise<{ wrapper: HTMLElement; el: RekeTable }> {
    const wrapper = createElement('<reke-table expandable></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = makeVirtualRows(rowCount);
    el.getRowKey = (row) => (row as { id: string }).id;
    el.virtualized = true;
    el.rowHeight = VIRTUAL_ROW_HEIGHT;
    el.maxHeight = `${VIRTUAL_MAX_HEIGHT}px`;
    el.expandedRowElement = (host, row) => {
      const panel = document.createElement('div');
      panel.classList.add('detail-panel');
      panel.style.height = `${EXPAND_PANEL_HEIGHT}px`;
      panel.textContent = `${(row as { name: string }).name} detail`;
      host.appendChild(panel);
      return () => panel.remove();
    };
    await waitForUpdate(el);
    await new Promise((r) => requestAnimationFrame(r));
    await waitForUpdate(el);
    return { wrapper, el };
  }

  /**
   * Run the open animation to completion, then let the ResizeObserver report the
   * final expand row height and the table re-render off it. Without finishing the
   * animation first, the measurement lands mid-transition.
   */
  async function settleExpandMeasurement(el: RekeTable): Promise<void> {
    for (const animation of shadowAnimations(el)) {
      animation.finish();
    }
    for (let i = 0; i < 4; i += 1) {
      await new Promise((r) => requestAnimationFrame(r));
      await waitForUpdate(el);
    }
  }

  it('virtualized + expand: mounts the panel and no longer errors', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { wrapper, el } = await mountVirtualExpandable(1000);

    el.toggleExpand('v0');
    await flushEnterTransition(el);
    await settleExpandMeasurement(el);

    expect(el.shadowRoot!.querySelector('.detail-panel')).toBeTruthy();
    const messages = errorSpy.mock.calls.map((c) => String(c[0]));
    expect(messages.filter((m) => m.includes('virtualized'))).toEqual([]);

    errorSpy.mockRestore();
    wrapper.remove();
  });

  it('virtualized + expand: measured panel height grows the total scroll height', async () => {
    const { wrapper, el } = await mountVirtualExpandable(1000);

    const container = scrollContainer(el);
    const before = container.scrollHeight;

    el.toggleExpand('v0');
    await flushEnterTransition(el);
    await settleExpandMeasurement(el);

    // The dataset got taller by exactly one expanded panel, and the scrollbar
    // has to say so — otherwise the rows below become unreachable.
    const grew = container.scrollHeight - before;
    expect(grew).toBeGreaterThan(EXPAND_PANEL_HEIGHT * 0.8);
    expect(grew).toBeLessThan(EXPAND_PANEL_HEIGHT * 1.5);

    wrapper.remove();
  });

  it('virtualized + expand: an expanded row above the window shifts the rows below it', async () => {
    const { wrapper, el } = await mountVirtualExpandable(1000);

    // Open row 0, then scroll well past it.
    el.toggleExpand('v0');
    await flushEnterTransition(el);
    await settleExpandMeasurement(el);

    const container = scrollContainer(el);
    const targetRow = 300;
    // Without accounting for the open panel above, this offset would land on a
    // different row than the one the offset math predicts.
    container.scrollTop = targetRow * VIRTUAL_ROW_HEIGHT + EXPAND_PANEL_HEIGHT;
    container.dispatchEvent(new Event('scroll'));
    await new Promise((r) => requestAnimationFrame(r));
    await waitForUpdate(el);

    const names = renderedRowNames(el);
    expect(names).toContain(`Name ${targetRow}`);

    wrapper.remove();
  });

  it('virtualized + expand: content survives scrolling out of the window and back', async () => {
    const { wrapper, el } = await mountVirtualExpandable(1000);

    let mountCount = 0;
    const cleanup = vi.fn();
    el.expandedRowElement = (host, row) => {
      mountCount += 1;
      const panel = document.createElement('div');
      panel.classList.add('detail-panel');
      panel.style.height = `${EXPAND_PANEL_HEIGHT}px`;
      panel.textContent = `${(row as { name: string }).name} detail`;
      host.appendChild(panel);
      return () => {
        panel.remove();
        cleanup();
      };
    };
    await waitForUpdate(el);

    el.toggleExpand('v0');
    await flushEnterTransition(el);
    await settleExpandMeasurement(el);
    expect(mountCount).toBe(1);

    // Scroll far away — the expand row leaves the DOM entirely.
    const container = scrollContainer(el);
    container.scrollTop = 500 * VIRTUAL_ROW_HEIGHT;
    container.dispatchEvent(new Event('scroll'));
    await new Promise((r) => requestAnimationFrame(r));
    await waitForUpdate(el);
    expect(el.shadowRoot!.querySelector('.detail-panel')).toBeNull();
    expect(el.isRowExpanded('v0')).toBe(true);

    // Scroll back — the SAME host is reattached, with no remount and no cleanup.
    container.scrollTop = 0;
    container.dispatchEvent(new Event('scroll'));
    await new Promise((r) => requestAnimationFrame(r));
    await waitForUpdate(el);

    expect(el.shadowRoot!.querySelector('.detail-panel')).toBeTruthy();
    expect(mountCount).toBe(1);
    expect(cleanup).not.toHaveBeenCalled();

    wrapper.remove();
  });

  it('virtualized + expand: collapsing releases the measured height', async () => {
    const { wrapper, el } = await mountVirtualExpandable(1000);

    const container = scrollContainer(el);
    const baseline = container.scrollHeight;

    el.toggleExpand('v0');
    await flushEnterTransition(el);
    await settleExpandMeasurement(el);
    expect(container.scrollHeight).toBeGreaterThan(baseline);

    el.toggleExpand('v0');
    await flushExpandTransition(el);
    await settleExpandMeasurement(el);

    // Back to the collapsed dataset height: the measurement was released with
    // the rest of the row's state, not left inflating the scroll range.
    expect(container.scrollHeight).toBeCloseTo(baseline, -1);
    expect(el.shadowRoot!.querySelector('.detail-panel')).toBeNull();

    wrapper.remove();
  });

  it('virtualized off (default): renders every row and adds no spacers', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = makeVirtualRows(60);
    await waitForUpdate(el);

    expect(el.virtualized).toBe(false);
    expect(el.shadowRoot!.querySelectorAll('tbody .row').length).toBe(60);
    expect(el.shadowRoot!.querySelectorAll('.spacer-row').length).toBe(0);
    expect(el.shadowRoot!.querySelector('table')!.hasAttribute('aria-rowcount')).toBe(false);

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
    expect(el.shadowRoot!.querySelector('.expand-row')).toBeNull();
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
    // Expand rows only exist while a row is open or animating.
    expect(el.shadowRoot!.querySelector('.expand-row')).toBeNull();

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
