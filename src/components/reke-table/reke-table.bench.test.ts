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

async function measure(rowCount: number, renderCalls: { n: number }): Promise<BenchResult> {
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

  const idleElements = el.shadowRoot!.querySelectorAll('*').length;

  // --- sort: reassigning `rows` re-renders every cell by design ---
  const sortStart = performance.now();
  el.rows = [...rows].reverse();
  await settle(el);
  const sortMs = performance.now() - sortStart;

  // --- toggle one row: must stay independent of row count ---
  renderCalls.n = 0;
  const toggleStart = performance.now();
  el.toggleExpand('row-0');
  await settle(el);
  await new Promise((r) => requestAnimationFrame(r));
  await settle(el);
  const toggleMs = performance.now() - toggleStart;
  const toggleRenderCalls = renderCalls.n;

  wrapper.remove();

  return { rows: rowCount, mountMs, sortMs, toggleMs, toggleRenderCalls, idleElements };
}

describe.skipIf(!BENCH_ENABLED)('reke-table sizing benchmark', () => {
  it('reports cost across row counts', async () => {
    const renderCalls = { n: 0 };

    // Warm-up: the first mount pays for style sheet adoption and JIT.
    await measure(100, renderCalls);

    const results: BenchResult[] = [];
    for (const count of ROW_COUNTS) {
      results.push(await measure(count, renderCalls));
    }

    const columnsOut = [
      ['rows', (r: BenchResult) => String(r.rows)],
      ['mount ms', (r: BenchResult) => r.mountMs.toFixed(1)],
      ['sort ms', (r: BenchResult) => r.sortMs.toFixed(1)],
      ['toggle ms', (r: BenchResult) => r.toggleMs.toFixed(1)],
      ['render()/toggle', (r: BenchResult) => String(r.toggleRenderCalls)],
      ['idle nodes', (r: BenchResult) => String(r.idleElements)],
      ['us/row mount', (r: BenchResult) => ((r.mountMs / r.rows) * 1000).toFixed(0)],
    ] as const;

    const widths = columnsOut.map(([head, get]) =>
      Math.max(head.length, ...results.map((r) => get(r).length)),
    );
    const line = (cells: readonly string[]) =>
      cells.map((cell, i) => cell.padStart(widths[i])).join('  ');

    const overBudget = results.find((r) => r.mountMs > SLOW_RENDER_BUDGET_MS);
    const report = [
      '',
      'reke-table sizing benchmark',
      line(columnsOut.map(([head]) => head)),
      line(widths.map((w) => '-'.repeat(w))),
      ...results.map((r) => line(columnsOut.map(([, get]) => get(r)))),
      '',
      overBudget
        ? `Mount crosses ${SLOW_RENDER_BUDGET_MS}ms at ${overBudget.rows} rows — windowing pays off from here up.`
        : `Mount stayed under ${SLOW_RENDER_BUDGET_MS}ms at every size measured.`,
      '',
    ].join('\n');

    // The report IS the deliverable here, and `warn` is the only console level
    // the vitest browser runner forwards to the terminal.
    console.warn(report);

    // The one deterministic guarantee: a toggle touches one row, not the table.
    // Five columns, and the entering row renders twice (collapsed, then open).
    for (const result of results) {
      expect(result.toggleRenderCalls).toBeLessThanOrEqual(10);
    }

    // Nothing expanded at rest means no per-row expand scaffolding.
    for (const result of results) {
      expect(result.idleElements).toBeLessThan(result.rows * 12);
    }
  }, 120_000);
});
