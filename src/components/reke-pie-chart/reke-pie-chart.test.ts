import { describe, expect, it } from 'vitest';
import './reke-pie-chart.js';
import { runAxe } from '../../test-utils/a11y.js';
import type { PieChartDatum, RekePieChart } from './reke-pie-chart.js';

const SAMPLE: PieChartDatum[] = [
  { name: 'Chrome', value: 60 },
  { name: 'Firefox', value: 25 },
  { name: 'Safari', value: 15 },
];

function createChart(data: PieChartDatum[] = SAMPLE): { wrapper: HTMLElement; el: RekePieChart } {
  const wrapper = document.createElement('div');
  wrapper.style.backgroundColor = '#0A0A0B';
  wrapper.style.padding = '16px';
  wrapper.style.width = '320px';
  const el = document.createElement('reke-pie-chart') as RekePieChart;
  el.data = data;
  el.label = 'Browser share';
  wrapper.appendChild(el);
  document.body.appendChild(wrapper);
  return { wrapper, el };
}

async function waitForUpdate(el: RekePieChart): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

describe('reke-pie-chart', () => {
  // --- RENDERING ---

  it('renders with default props', async () => {
    const { wrapper, el } = createChart();
    await waitForUpdate(el);

    expect(el.variant).toBe('donut');
    expect(el.loading).toBe(false);

    const container = el.shadowRoot!.querySelector('.chart')!;
    expect(container).toBeTruthy();
    // ECharts mounts a canvas inside the container.
    expect(container.querySelector('canvas')).toBeTruthy();

    wrapper.remove();
  });

  it('renders a screen-reader list from data', async () => {
    const { wrapper, el } = createChart();
    await waitForUpdate(el);

    const items = el.shadowRoot!.querySelectorAll('.sr-only li');
    expect(items.length).toBe(3);
    expect(items[0].textContent).toContain('Chrome');
    expect(items[0].textContent).toContain('60%');

    wrapper.remove();
  });

  it('exposes an aria-label describing every slice', async () => {
    const { wrapper, el } = createChart();
    await waitForUpdate(el);

    const label = el.shadowRoot!.querySelector('.chart')!.getAttribute('aria-label')!;
    expect(label).toContain('Browser share');
    expect(label).toContain('Chrome 60%');

    wrapper.remove();
  });

  // --- BEHAVIOR ---

  it('toggles the native loader without throwing', async () => {
    const { wrapper, el } = createChart();
    await waitForUpdate(el);

    el.loading = true;
    await waitForUpdate(el);
    expect(el.loading).toBe(true);

    el.loading = false;
    await waitForUpdate(el);
    expect(el.loading).toBe(false);

    wrapper.remove();
  });

  it('updates the SR list when data changes', async () => {
    const { wrapper, el } = createChart();
    await waitForUpdate(el);

    el.data = [{ name: 'Edge', value: 100 }];
    await waitForUpdate(el);

    const items = el.shadowRoot!.querySelectorAll('.sr-only li');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Edge');

    wrapper.remove();
  });

  // --- ACCESSIBILITY ---

  it('passes axe-core a11y audit', async () => {
    const { wrapper, el } = createChart();
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    expect(results.violations).toEqual([]);

    wrapper.remove();
  });
});
