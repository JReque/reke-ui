import { describe, it, expect, vi } from 'vitest';
import { html, render } from 'lit';
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
  { name: 'Alice', role: 'Engineer' },
  { name: 'Bob', role: 'Designer' },
  { name: 'Carol', role: 'Manager' },
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

    // Second column still renders plain text
    const cells = el.shadowRoot!.querySelectorAll('.cell');
    expect(cells[1].textContent).toContain('Engineer');

    wrapper.remove();
  });

  it('does not add extra columns when expandedRowRender is set', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.expandedRowRender = () => html`<div>Details</div>`;
    await waitForUpdate(el);

    const headers = el.shadowRoot!.querySelectorAll('.header-cell');
    expect(headers.length).toBe(2);

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
    // Wait for slotchange
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
    expect(detail.row).toEqual({ name: 'Alice', role: 'Engineer' });
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

    // Click again to toggle direction
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

  it('expands row via toggleExpand()', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.expandedRowRender = (row) => html`<div class="detail-content">${row.name} details</div>`;
    await waitForUpdate(el);

    el.toggleExpand(0);
    await waitForUpdate(el);

    const expandRow = el.shadowRoot!.querySelector('.expand-row');
    expect(expandRow).toBeTruthy();

    const detail = el.shadowRoot!.querySelector('.detail-content');
    expect(detail).toBeTruthy();
    expect(detail!.textContent).toBe('Alice details');

    wrapper.remove();
  });

  it('collapses row on second toggleExpand()', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.expandedRowRender = (row) => html`<div>${row.name} details</div>`;
    await waitForUpdate(el);

    el.toggleExpand(0);
    await waitForUpdate(el);
    expect(el.shadowRoot!.querySelector('.expand-row')).toBeTruthy();

    el.toggleExpand(0);
    await waitForUpdate(el);
    expect(el.shadowRoot!.querySelector('.expand-row')).toBeNull();

    wrapper.remove();
  });

  it('emits reke-row-expand on expand/collapse', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.expandedRowRender = () => html`<div>Details</div>`;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-row-expand', handler);

    el.toggleExpand(0);
    await waitForUpdate(el);

    expect(handler).toHaveBeenCalledOnce();
    const detail1 = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail1.index).toBe(0);
    expect(detail1.expanded).toBe(true);

    el.toggleExpand(0);
    await waitForUpdate(el);

    expect(handler).toHaveBeenCalledTimes(2);
    const detail2 = (handler.mock.calls[1][0] as CustomEvent).detail;
    expect(detail2.expanded).toBe(false);

    wrapper.remove();
  });

  it('multiple rows can be expanded simultaneously', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.expandedRowRender = (row) => html`<div>${row.name}</div>`;
    await waitForUpdate(el);

    el.toggleExpand(0);
    await waitForUpdate(el);
    el.toggleExpand(2);
    await waitForUpdate(el);

    const expandRows = el.shadowRoot!.querySelectorAll('.expand-row');
    expect(expandRows.length).toBe(2);

    wrapper.remove();
  });

  it('isRowExpanded returns correct state', async () => {
    const wrapper = createElement('<reke-table></reke-table>');
    const el = wrapper.querySelector('reke-table')! as RekeTable;
    el.columns = testColumns;
    el.rows = testRows;
    el.expandedRowRender = () => html`<div>Details</div>`;
    await waitForUpdate(el);

    expect(el.isRowExpanded(0)).toBe(false);

    el.toggleExpand(0);
    await waitForUpdate(el);

    expect(el.isRowExpanded(0)).toBe(true);
    expect(el.isRowExpanded(1)).toBe(false);

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
    el.expandedRowRender = (row) => html`<div>${row.name} details</div>`;
    el.expandedRows = new Set([0]);
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const violations = results.violations.filter(
      (v) => v.id !== 'color-contrast',
    );
    expect(violations).toEqual([]);

    wrapper.remove();
  });
});
