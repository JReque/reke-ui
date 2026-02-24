import { describe, it, expect, vi } from 'vitest';
import './reke-table.js';
import type { RekeTable } from './reke-table.js';
import { runAxe } from '../../test-utils/a11y.js';

function createElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.backgroundColor = '#0A0A0B';
  wrapper.style.padding = '16px';
  wrapper.innerHTML = html;
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
});
