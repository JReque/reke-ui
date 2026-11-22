import * as echarts from 'echarts/core';
import { describe, expect, it } from 'vitest';
import './reke-bar-chart.js';
import { runAxe } from '../../test-utils/a11y.js';
import type { BarChartSelectDetail, BarChartSeries, RekeBarChart } from './reke-bar-chart.js';

const CATEGORIES = ['2026-01', '2026-02', '2026-03'];
const SERIES: BarChartSeries[] = [
  { name: 'USDC', data: [100, 0, 50] },
  { name: 'USDT', data: [20, 30, 0] },
];

function createChart(): { wrapper: HTMLElement; el: RekeBarChart } {
  const wrapper = document.createElement('div');
  wrapper.style.backgroundColor = '#0A0A0B';
  wrapper.style.width = '480px';
  const el = document.createElement('reke-bar-chart') as RekeBarChart;
  el.categories = CATEGORIES;
  el.series = SERIES;
  el.label = 'Monthly purchases';
  wrapper.appendChild(el);
  document.body.appendChild(wrapper);
  return { wrapper, el };
}

/** Plain values of a resolved series, whether items are numbers or `{ value }` objects. */
function values(series: { data: unknown[] }): number[] {
  return series.data.map((d) =>
    typeof d === 'object' && d !== null ? (d as { value: number }).value : (d as number),
  );
}

/** Corner radius ECharts will draw for one bar: per-item override, else the series default. */
// biome-ignore lint/suspicious/noExplicitAny: ECharts' resolved option is loosely typed.
function radius(series: any, index: number): unknown {
  const item = series.data[index];
  return item?.itemStyle?.borderRadius ?? series.itemStyle?.borderRadius;
}

async function waitForUpdate(el: RekeBarChart): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

// biome-ignore lint/suspicious/noExplicitAny: ECharts' resolved option is loosely typed.
function chartOption(el: RekeBarChart): any {
  const container = el.shadowRoot!.querySelector('.chart') as HTMLElement;
  return echarts.getInstanceByDom(container)!.getOption();
}

describe('reke-bar-chart', () => {
  it('renders a canvas with default props', async () => {
    const { wrapper, el } = createChart();
    await waitForUpdate(el);

    expect(el.stacked).toBe(false);
    expect(el.loading).toBe(false);
    expect(el.shadowRoot!.querySelector('.chart canvas')).toBeTruthy();

    wrapper.remove();
  });

  it('maps categories to the x axis and one bar series per input series', async () => {
    const { wrapper, el } = createChart();
    await waitForUpdate(el);

    const option = chartOption(el);
    expect(option.xAxis[0].data).toEqual(CATEGORIES);
    expect(option.series).toHaveLength(2);
    expect(option.series.map((s: { type: string }) => s.type)).toEqual(['bar', 'bar']);
    expect(option.series[0].name).toBe('USDC');
    expect(values(option.series[0])).toEqual([100, 0, 50]);
    expect(option.series[0].stack).toBeUndefined();

    wrapper.remove();
  });

  it('stacks every series on one bar when stacked', async () => {
    const { wrapper, el } = createChart();
    el.stacked = true;
    await waitForUpdate(el);

    const stacks = chartOption(el).series.map((s: { stack?: string }) => s.stack);
    expect(stacks[0]).toBeTruthy();
    expect(stacks[1]).toBe(stacks[0]);

    wrapper.remove();
  });

  it('overlays a line series that is never stacked with the bars', async () => {
    const { wrapper, el } = createChart();
    el.stacked = true;
    el.series = [...SERIES, { name: 'Cumulative', data: [120, 150, 200], type: 'line' }];
    await waitForUpdate(el);

    const series = chartOption(el).series;
    expect(series.map((s: { type: string }) => s.type)).toEqual(['bar', 'bar', 'line']);
    expect(series[2].stack).toBeUndefined();
    expect(values(series[2])).toEqual([120, 150, 200]);
    // The outer segment is the last *bar* (USDT), not the line.
    expect(radius(series[1], 0)).toEqual([4, 4, 0, 0]);
    expect(radius(series[0], 0)).toBe(0);

    wrapper.remove();
  });

  it('accepts negative values for bars', async () => {
    const { wrapper, el } = createChart();
    el.series = [{ name: 'Net', data: [100, -40, 0] }];
    await waitForUpdate(el);

    expect(values(chartOption(el).series[0])).toEqual([100, -40, 0]);
    // A negative bar is rounded at its far end, below zero.
    expect(radius(chartOption(el).series[0], 0)).toEqual([4, 4, 0, 0]);
    expect(radius(chartOption(el).series[0], 1)).toEqual([0, 0, 4, 4]);
    expect(el.shadowRoot!.querySelectorAll('.sr-only li')[1].textContent).toBe('2026-02: Net -40');

    wrapper.remove();
  });

  it('shows every category without a zoom when max-visible is not exceeded', async () => {
    const { wrapper, el } = createChart();
    el.maxVisible = 3;
    await waitForUpdate(el);

    expect(chartOption(el).dataZoom ?? []).toHaveLength(0);

    wrapper.remove();
  });

  it('opens a scrollable window on the latest categories past max-visible', async () => {
    const { wrapper, el } = createChart();
    const days = Array.from({ length: 100 }, (_, i) => `d${i}`);
    el.categories = days;
    el.series = [{ name: 'Net', data: days.map((_, i) => i) }];
    el.maxVisible = 30;
    await waitForUpdate(el);

    const zoom = chartOption(el).dataZoom;
    expect(zoom.map((z: { type: string }) => z.type).sort()).toEqual(['inside', 'slider']);
    for (const z of zoom) {
      expect(z.startValue).toBe(70);
      expect(z.endValue).toBe(99);
    }

    wrapper.remove();
  });

  it('rounds only the outermost stacked segment on each side of zero', async () => {
    const { wrapper, el } = createChart();
    el.stacked = true;
    el.categories = ['m1'];
    // Positive stack: A then B (B outermost). Negative stack: C then D (D outermost).
    el.series = [
      { name: 'A', data: [10] },
      { name: 'C', data: [-5] },
      { name: 'B', data: [20] },
      { name: 'D', data: [-7] },
      { name: 'E', data: [0] },
    ];
    await waitForUpdate(el);

    const [a, c, b, d] = chartOption(el).series;
    expect(radius(a, 0)).toBe(0);
    expect(radius(b, 0)).toEqual([4, 4, 0, 0]);
    expect(radius(c, 0)).toBe(0);
    expect(radius(d, 0)).toEqual([0, 0, 4, 4]);

    wrapper.remove();
  });

  it('totals only bars in the tooltip, even with duplicate series names', async () => {
    const { wrapper, el } = createChart();
    el.categories = ['m1'];
    el.series = [
      { name: 'Same', data: [10] },
      { name: 'Same', data: [5], type: 'line' },
      { name: 'Other', data: [3] },
    ];
    await waitForUpdate(el);

    const formatter = chartOption(el).tooltip[0].formatter;
    const html: string = formatter([
      { seriesName: 'Same', seriesIndex: 0, name: 'm1', value: 10, color: '#000' },
      { seriesName: 'Same', seriesIndex: 1, name: 'm1', value: 5, color: '#000' },
      { seriesName: 'Other', seriesIndex: 2, name: 'm1', value: 3, color: '#000' },
    ]);
    expect(html).toContain('Total');
    expect(html).toMatch(/Total.*>13</);

    wrapper.remove();
  });

  it('follows a max-visible change', async () => {
    const { wrapper, el } = createChart();
    el.categories = Array.from({ length: 10 }, (_, i) => `d${i}`);
    el.series = [{ name: 'A', data: Array(10).fill(1) }];
    el.maxVisible = 4;
    await waitForUpdate(el);
    expect(chartOption(el).dataZoom[0].startValue).toBe(6);

    el.maxVisible = 0;
    await waitForUpdate(el);
    expect(chartOption(el).dataZoom ?? []).toHaveLength(0);

    wrapper.remove();
  });

  it('lists negative and line values for screen readers', async () => {
    const { wrapper, el } = createChart();
    el.categories = ['m1'];
    el.series = [
      { name: 'Net', data: [-50] },
      { name: 'Cum', data: [10], type: 'line' },
    ];
    await waitForUpdate(el);

    expect(el.shadowRoot!.querySelector('.sr-only li')!.textContent).toBe('m1: Net -50, Cum 10');

    wrapper.remove();
  });

  it('repaints with fresh tokens when the theme changes', async () => {
    const { wrapper, el } = createChart();
    el.maxVisible = 2;
    await waitForUpdate(el);

    const root = document.documentElement;
    root.style.setProperty('--reke-color-text-label', '#ABCDEF');
    root.setAttribute('data-reke-theme', 'light');
    await waitForUpdate(el);

    const option = chartOption(el);
    expect(option.xAxis[0].axisLabel.color).toBe('#ABCDEF');
    expect(option.yAxis[0].axisLabel.color).toBe('#ABCDEF');
    expect(option.dataZoom.find((z: { type: string }) => z.type === 'slider').textStyle.color).toBe(
      '#ABCDEF',
    );

    root.removeAttribute('data-reke-theme');
    root.style.removeProperty('--reke-color-text-label');
    wrapper.remove();
  });

  it('has no accessibility violations in the light theme', async () => {
    const root = document.documentElement;
    root.setAttribute('data-reke-theme', 'light');
    const { wrapper, el } = createChart();
    wrapper.style.backgroundColor = '#FFFFFF';
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    expect(results.violations).toEqual([]);

    root.removeAttribute('data-reke-theme');
    wrapper.remove();
  });

  it('applies a per-series color over the palette', async () => {
    const { wrapper, el } = createChart();
    el.series = [{ name: 'USDC', data: [1, 2, 3], color: '#2775CA' }];
    await waitForUpdate(el);

    expect(chartOption(el).series[0].itemStyle.color).toBe('#2775CA');

    wrapper.remove();
  });

  it('shows the legend only when requested', async () => {
    const { wrapper, el } = createChart();
    await waitForUpdate(el);
    expect(chartOption(el).legend?.[0]?.show ?? false).toBe(false);

    el.showLegend = true;
    await waitForUpdate(el);
    expect(chartOption(el).legend[0].show).not.toBe(false);

    wrapper.remove();
  });

  it('describes every category and series for screen readers', async () => {
    const { wrapper, el } = createChart();
    await waitForUpdate(el);

    const label = el.shadowRoot!.querySelector('.chart')!.getAttribute('aria-label')!;
    expect(label).toContain('Monthly purchases');

    const items = el.shadowRoot!.querySelectorAll('.sr-only li');
    expect(items).toHaveLength(3);
    expect(items[0].textContent).toBe('2026-01: USDC 100, USDT 20');

    wrapper.remove();
  });

  it('fires reke-bar-chart-select with the clicked bar', async () => {
    const { wrapper, el } = createChart();
    await waitForUpdate(el);

    let detail: BarChartSelectDetail | undefined;
    el.addEventListener('reke-bar-chart-select', (e) => {
      detail = (e as CustomEvent<BarChartSelectDetail>).detail;
    });
    const container = el.shadowRoot!.querySelector('.chart') as HTMLElement;
    const chart = echarts.getInstanceByDom(container)!;
    // biome-ignore lint/suspicious/noExplicitAny: trigger the internal click handler directly.
    (chart as any).trigger('click', {
      componentType: 'series',
      seriesName: 'USDT',
      name: '2026-02',
      dataIndex: 1,
      value: 30,
    });

    expect(detail).toEqual({ category: '2026-02', series: 'USDT', value: 30, index: 1 });

    wrapper.remove();
  });

  it('has no accessibility violations', async () => {
    const { wrapper, el } = createChart();
    await waitForUpdate(el);
    const results = await runAxe(wrapper);
    expect(results.violations).toEqual([]);
    wrapper.remove();
  });
});
