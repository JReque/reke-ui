import * as echarts from 'echarts/core';
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

// biome-ignore lint/suspicious/noExplicitAny: ECharts' resolved option is loosely typed.
function chartOption(el: RekePieChart): any {
  const container = el.shadowRoot!.querySelector('.chart') as HTMLElement;
  return echarts.getInstanceByDom(container)!.getOption();
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

  it('shows the total and center label inside a donut', async () => {
    const { wrapper, el } = createChart();
    el.centerLabel = 'Visits';
    await waitForUpdate(el);

    const center = el.shadowRoot!.querySelector('.center')!;
    expect(center).toBeTruthy();
    expect(center.getAttribute('aria-hidden')).toBe('true');
    expect(center.querySelector('.center-value')!.textContent).toBe('100');
    expect(center.querySelector('.center-caption')!.textContent).toBe('Visits');

    wrapper.remove();
  });

  it('renders no center content for the pie variant or with hide-center', async () => {
    const { wrapper, el } = createChart();
    el.variant = 'pie';
    await waitForUpdate(el);
    expect(el.shadowRoot!.querySelector('.center')).toBeNull();

    el.variant = 'donut';
    el.hideCenter = true;
    await waitForUpdate(el);
    expect(el.shadowRoot!.querySelector('.center')).toBeNull();

    wrapper.remove();
  });

  it('separates slices and styles the legend from tokens', async () => {
    const { wrapper, el } = createChart();
    wrapper.style.setProperty('--reke-color-text-label', '#123456');
    el.showLegend = true;
    await waitForUpdate(el);

    const option = chartOption(el);
    expect(option.series[0].padAngle).toBeGreaterThan(0);
    expect(option.series[0].itemStyle.borderRadius).toBeGreaterThan(0);
    expect(option.legend[0].textStyle.color).toBe('#123456');
    expect(option.legend[0].icon).toBe('circle');

    wrapper.remove();
  });

  it('escapes slice names in the tooltip', async () => {
    const { wrapper, el } = createChart([{ name: '<img src=x>', value: 1 }]);
    el.variant = 'pie';
    await waitForUpdate(el);

    const html = chartOption(el).tooltip[0].formatter({
      name: '<img src=x>',
      value: 1,
      percent: 100,
      color: '#22C55E',
    });
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');

    wrapper.remove();
  });

  // --- BEHAVIOR ---

  it('excludes legend-hidden slices from the center total', async () => {
    const { wrapper, el } = createChart();
    el.showLegend = true;
    await waitForUpdate(el);

    const container = el.shadowRoot!.querySelector('.chart') as HTMLElement;
    echarts.getInstanceByDom(container)!.dispatchAction({ type: 'legendUnSelect', name: 'Chrome' });
    await waitForUpdate(el);

    expect(el.shadowRoot!.querySelector('.center-value')!.textContent).toBe('40');

    wrapper.remove();
  });

  it('repaints with fresh tokens when the theme changes', async () => {
    const { wrapper, el } = createChart();
    el.showLegend = true;
    await waitForUpdate(el);

    const root = document.documentElement;
    root.style.setProperty('--reke-color-text-label', '#ABCDEF');
    root.setAttribute('data-reke-theme', 'light');
    await waitForUpdate(el);

    expect(chartOption(el).legend[0].textStyle.color).toBe('#ABCDEF');

    root.removeAttribute('data-reke-theme');
    root.style.removeProperty('--reke-color-text-label');
    wrapper.remove();
  });

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
