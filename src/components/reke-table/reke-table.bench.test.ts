import { describe, expect, it } from 'vitest';
import './reke-table.js';
import type { RekeTable, TableColumn, TableRow } from './reke-table.js';

/**
 * Sizing benchmark for `reke-table`, gated behind VITE_BENCH so it never runs
 * in the normal suite. Run it with `npm run bench:table`.
 *
 * Purpose: find the row count at which rendering every row actually starts to
 * hurt, so the virtualization roadmap is driven by numbers instead of a guess.
 * Timings are machine-dependent and are reported, not asserted. The only hard
 * assertion is `renderCalls` on a toggle, which is deterministic: it must not
 * scale with row count.
 */
// Cast rather than alias: Vite only substitutes the literal `import.meta.env`
// token, and the cast is compile-time only so the token survives.
const BENCH_ENABLED =
  (import.meta as unknown as { env?: { VITE_BENCH?: string } }).env?.VITE_BENCH === '1';

const ROW_COUNTS = [100, 500, 1_000, 2_000, 5_000, 10_000];

/** Row counts above this are the ones we expect to need windowing. */
const SLOW_RENDER_BUDGET_MS = 100;

interface BenchResult {
  rows: number;
  mountMs: number;
  sortMs: number;
  toggleMs: number;
  toggleRenderCalls: number;
  scrollMs: number;
  idleElements: number;
}

function makeRows(count: number): TableRow[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `row-${i}`,
    name: `Name ${i}`,
    role: i % 3 === 0 ? 'Engineer' : i % 3 === 1 ? 'Designer' : 'Manager',
    email: `user${i}@example.com`,
    status: i % 2 === 0 ? 'Active' : 'Inactive',
    score: (i * 37) % 100,
  }));
}

/**
 * Resolve once the browser has finished style and layout for the pending
 * render. `updateComplete` only tells us Lit committed the DOM; reading
 * `offsetHeight` forces the layout that the user actually waits for.
 */
async function settle(el: RekeTable): Promise<void> {
  await el.updateComplete;
  void el.offsetHeight;
}

/** Row height declared to the virtualized table, matching the default cell padding. */
const BENCH_ROW_HEIGHT = 41;
const BENCH_VIEWPORT = '600px';

async function measure(
  rowCount: number,
  renderCalls: { n: number },
  virtualized: boolean,
): Promise<BenchResult> {
  const wrapper = document.createElement('div');
  document.body.appendChild(wrapper);
  const el = document.createElement('reke-table') as RekeTable;

  const columns: TableColumn[] = (
    ['name', 'role', 'email', 'status', 'score'] as const
  ).map<TableColumn>((key) => ({
    key,
    header: key,
    render: (value) => {
      renderCalls.n += 1;
      return String(value);
    },
  }));

  const rows = makeRows(rowCount);
  el.getRowKey = (row) => (row as { id: string }).id;
  el.expandable = true;

  if (virtualized) {
    el.virtualized = true;
    el.rowHeight = BENCH_ROW_HEIGHT;
    el.maxHeight = BENCH_VIEWPORT;
  }
  // Expand is measured in BOTH modes: since F2 they coexist, and the whole point
  // is that windowing does not cost you the expand contract.
  el.expandedRowElement = (host, row) => {
    const panel = document.createElement('div');
    panel.textContent = `${(row as { name: string }).name} detail`;
    host.appendChild(panel);
    return () => panel.remove();
  };

  // --- mount + first render ---
  el.columns = columns;
  el.rows = rows;
  const mountStart = performance.now();
  wrapper.appendChild(el);
  await settle(el);
  const mountMs = performance.now() - mountStart;

  if (virtualized) {
    // Let the ResizeObserver report the viewport so the window is the real one.
    await new Promise((r) => requestAnimationFrame(r));
    await settle(el);
  }

  const idleElements = el.shadowRoot!.querySelectorAll('*').length;

  // --- sort: reassigning `rows` re-renders every rendered cell ---
  const sortStart = performance.now();
  el.rows = [...rows].reverse();
  await settle(el);
  const sortMs = performance.now() - sortStart;

  // --- expand toggle ---
  // Target the first row in current dataset order: the sort above reversed the
  // rows, so `row-0` now sits at the far end and would be outside the window in
  // virtualized mode, measuring nothing.
  const firstKey = (el.rows[0] as { id: string }).id;
  renderCalls.n = 0;
  const toggleStart = performance.now();
  el.toggleExpand(firstKey);
  await settle(el);
  await new Promise((r) => requestAnimationFrame(r));
  await settle(el);
  const toggleMs = performance.now() - toggleStart;
  const toggleRenderCalls = renderCalls.n;

  // --- scroll jump to the middle of the dataset (windowed mode only) ---
  let scrollMs = 0;
  if (virtualized) {
    const container = el.shadowRoot!.querySelector('.table-wrapper') as HTMLElement;
    const scrollStart = performance.now();
    container.scrollTop = Math.floor(rowCount / 2) * BENCH_ROW_HEIGHT;
    container.dispatchEvent(new Event('scroll'));
    await new Promise((r) => requestAnimationFrame(r));
    await settle(el);
    scrollMs = performance.now() - scrollStart;
  }

  wrapper.remove();

  return { rows: rowCount, mountMs, sortMs, toggleMs, toggleRenderCalls, scrollMs, idleElements };
}

describe.skipIf(!BENCH_ENABLED)('reke-table sizing benchmark', () => {
  it('reports cost across row counts', async () => {
    const renderCalls = { n: 0 };

    // Warm-up: the first mount pays for style sheet adoption and JIT.
    await measure(100, renderCalls, false);

    const plain: BenchResult[] = [];
    const windowed: BenchResult[] = [];
    for (const count of ROW_COUNTS) {
      plain.push(await measure(count, renderCalls, false));
      windowed.push(await measure(count, renderCalls, true));
    }

    const columnsOut = [
      ['rows', (r: BenchResult) => String(r.rows)],
      ['mount ms', (r: BenchResult) => r.mountMs.toFixed(1)],
      ['sort ms', (r: BenchResult) => r.sortMs.toFixed(1)],
      ['toggle ms', (r: BenchResult) => r.toggleMs.toFixed(1)],
      ['render()/toggle', (r: BenchResult) => String(r.toggleRenderCalls)],
      ['scroll ms', (r: BenchResult) => (r.scrollMs > 0 ? r.scrollMs.toFixed(1) : '-')],
      ['idle nodes', (r: BenchResult) => String(r.idleElements)],
      ['us/row mount', (r: BenchResult) => ((r.mountMs / r.rows) * 1000).toFixed(0)],
    ] as const;

    const all = [...plain, ...windowed];
    const widths = columnsOut.map(([head, get]) =>
      Math.max(head.length, ...all.map((r) => get(r).length)),
    );
    const line = (cells: readonly string[]) =>
      cells.map((cell, i) => cell.padStart(widths[i])).join('  ');
    const head = line(columnsOut.map(([label]) => label));
    const rule = line(widths.map((w) => '-'.repeat(w)));
    const body = (rows: BenchResult[]) =>
      rows.map((r) => line(columnsOut.map(([, get]) => get(r))));

    const overBudget = plain.find((r) => r.mountMs > SLOW_RENDER_BUDGET_MS);
    const speedup = plain.map((p, i) => ({
      rows: p.rows,
      mount: p.mountMs / Math.max(windowed[i].mountMs, 0.01),
    }));

    console.warn(
      [
        '',
        'reke-table — every row rendered (virtualized: off)',
        head,
        rule,
        ...body(plain),
        '',
        `reke-table — windowed (virtualized: on, row-height ${BENCH_ROW_HEIGHT}, viewport ${BENCH_VIEWPORT})`,
        head,
        rule,
        ...body(windowed),
        '',
        overBudget
          ? `Unwindowed mount crosses ${SLOW_RENDER_BUDGET_MS}ms at ${overBudget.rows} rows.`
          : `Unwindowed mount stayed under ${SLOW_RENDER_BUDGET_MS}ms at every size measured.`,
        `Mount speedup from windowing: ${speedup
          .map((s) => `${s.rows}: ${s.mount.toFixed(1)}x`)
          .join(', ')}`,
        '',
      ].join('\n'),
    );

    // A toggle touches one row, not the table: five columns, and the entering
    // row renders twice (collapsed, then open). True in BOTH modes.
    for (const result of all) {
      expect(result.toggleRenderCalls).toBeLessThanOrEqual(10);
    }

    // Nothing expanded at rest means no per-row expand scaffolding.
    for (const result of plain) {
      expect(result.idleElements).toBeLessThan(result.rows * 12);
    }

    // The point of windowing: node count stops tracking dataset size.
    for (const result of windowed) {
      expect(result.idleElements).toBeLessThan(400);
    }

    // And mount cost stops growing with it.
    const largest = windowed[windowed.length - 1];
    const smallest = windowed[0];
    expect(largest.idleElements).toBeLessThan(smallest.idleElements * 2);
  }, 180_000);
});
