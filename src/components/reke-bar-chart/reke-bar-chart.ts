import { BarChart, type BarSeriesOption, LineChart, type LineSeriesOption } from 'echarts/charts';
import {
  type DataZoomComponentOption,
  DataZoomInsideComponent,
  DataZoomSliderComponent,
  GridComponent,
  type GridComponentOption,
  LegendComponent,
  type LegendComponentOption,
  TooltipComponent,
  type TooltipComponentOption,
} from 'echarts/components';
import type { ComposeOption, ECharts } from 'echarts/core';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { html, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-bar-chart.styles.js';

echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  DataZoomInsideComponent,
  DataZoomSliderComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
]);

type ChartOption = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | GridComponentOption
  | DataZoomComponentOption
  | TooltipComponentOption
  | LegendComponentOption
>;

export interface BarChartSeries {
  name: string;
  /** One value per entry in `categories`, in the same order. Negative values draw below zero. */
  data: number[];
  color?: string;
  /** `line` overlays the series as a line (e.g. a running total); it is never stacked. Defaults to `bar`. */
  type?: 'bar' | 'line';
}

export interface BarChartSelectDetail {
  category: string;
  series: string;
  value: number;
  index: number;
}

/** Fallbacks used only if the `--reke-chart-*` tokens are absent. */
const PALETTE_FALLBACK = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#A855F7', '#14B8A6'];

const STACK_ID = 'total';

const compactNumber = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const fullNumber = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

/** Turns `#RGB` / `#RRGGBB` into `rgba()` so canvas overlays can be translucent. */
function withAlpha(color: string, alpha: number): string {
  const hex = color.trim().replace('#', '');
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
  if (!/^[0-9a-f]{6}$/i.test(full)) return `rgba(0, 0, 0, ${alpha})`;
  const [r, g, b] = [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface AxisTooltipParam {
  seriesName: string;
  seriesIndex: number;
  name: string;
  value: number;
  color: string;
}

/**
 * @tag reke-bar-chart
 * @summary A categorical bar chart (grouped or stacked) rendered with ECharts, isolated in Shadow DOM.
 *
 * Canvas cannot resolve `var()`, so every token below is read off the host's
 * computed style and re-read whenever `data-reke-theme` or the OS color scheme
 * changes on the document.
 *
 * @csspart chart - The chart canvas container.
 *
 * @fires reke-bar-chart-select - Fired when a bar is clicked. `detail: { category, series, value, index }`.
 *
 * @cssprop [--reke-chart-1=#22C55E] - Series colors 1–6 (`--reke-chart-1` … `--reke-chart-6`).
 * @cssprop [--reke-bar-chart-height=280px] - Chart height.
 * @cssprop [--reke-color-primary=#22C55E] - Loading spinner color.
 * @cssprop [--reke-color-bg=#0A0A0B] - Loading mask tint.
 * @cssprop [--reke-color-surface=#1A1A1A] - Tooltip background.
 * @cssprop [--reke-color-border=#252525] - Tooltip border and grid lines.
 * @cssprop [--reke-color-text=#E5E5E5] - Tooltip text.
 * @cssprop [--reke-color-text-label=#8A8A8A] - Axis labels and legend text.
 * @cssprop [--reke-color-text-disabled=#3B3B3B] - Legend items toggled off.
 * @cssprop [--reke-font-mono=JetBrains Mono] - Chart font family.
 */
@customElement('reke-bar-chart')
export class RekeBarChart extends RekeElement {
  static override styles = styles;

  /** X-axis categories (e.g. months). */
  @property({ attribute: false })
  categories: string[] = [];

  /** Bar series; each `data` array is aligned with `categories`. */
  @property({ attribute: false })
  series: BarChartSeries[] = [];

  /** Accessible label describing the chart. Required for screen readers. */
  @property()
  label = 'Bar chart';

  /** Stack every series into a single bar per category instead of grouping them side by side. */
  @property({ type: Boolean, reflect: true })
  stacked = false;

  /** Show the legend above the chart. */
  @property({ type: Boolean, attribute: 'show-legend', reflect: true })
  showLegend = false;

  /** Show ECharts' native loading spinner over the chart. */
  @property({ type: Boolean, reflect: true })
  loading = false;

  /** Explicit color palette. Overrides the `--reke-chart-*` tokens when set. */
  @property({ attribute: false })
  palette?: string[];

  /** Entry/update animation length in ms. `0` disables animation. */
  @property({ type: Number, attribute: 'animation-duration' })
  animationDuration = 700;

  /**
   * Most categories drawn at once. Past it the chart opens on the latest ones
   * and becomes scrollable/zoomable (wheel, drag, and a slider below). `0` = show all.
   */
  @property({ type: Number, attribute: 'max-visible' })
  maxVisible = 0;

  private chart?: ECharts;
  private observer?: ResizeObserver;
  private themeObserver?: MutationObserver;
  private colorScheme?: MediaQueryList;

  /** Read a CSS custom property off the host's computed style (canvas can't read var()). */
  private readToken(name: string, fallback: string): string {
    const value = getComputedStyle(this).getPropertyValue(name).trim();
    return value || fallback;
  }

  /** Honours the OS "reduce motion" setting: 0ms means ECharts paints statically. */
  private motionDuration(): number {
    const reduced =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    return reduced ? 0 : Math.max(0, this.animationDuration);
  }

  private resolvePalette(): string[] {
    if (this.palette?.length) return this.palette;
    return PALETTE_FALLBACK.map((fallback, i) => this.readToken(`--reke-chart-${i + 1}`, fallback));
  }

  override firstUpdated(): void {
    const container = this.renderRoot.querySelector('.chart') as HTMLElement;
    this.chart = echarts.init(container);
    this.chart.setOption(this.buildOption(true));
    this.applyLoading();
    this.chart.on('click', (params) => {
      if (params.componentType !== 'series') return;
      this.emit<BarChartSelectDetail>('reke-bar-chart-select', {
        category: String(params.name),
        series: String(params.seriesName),
        value: Number(params.value),
        index: Number(params.dataIndex),
      });
    });
    this.observer = new ResizeObserver(() => this.chart?.resize());
    this.observer.observe(container);
    this.watchTheme();
  }

  /** Repaints with freshly read tokens when the theme switches. */
  private watchTheme(): void {
    this.themeObserver = new MutationObserver(() => this.repaint());
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-reke-theme'],
    });
    if (typeof matchMedia === 'function') {
      this.colorScheme = matchMedia('(prefers-color-scheme: light)');
      this.colorScheme.addEventListener('change', this.repaint);
    }
  }

  /** Static repaint: a theme switch should not replay the entry animation. */
  private repaint = (): void => {
    this.chart?.setOption(this.buildOption(false), true);
    this.applyLoading();
  };

  override updated(changed: PropertyValues): void {
    if (!this.chart) return;
    if (
      changed.has('categories') ||
      changed.has('series') ||
      changed.has('stacked') ||
      changed.has('showLegend') ||
      changed.has('palette') ||
      changed.has('animationDuration') ||
      changed.has('maxVisible')
    ) {
      // `true` = notMerge, so removed series actually disappear.
      this.chart.setOption(this.buildOption(true), true);
    }
    if (changed.has('loading')) this.applyLoading();
  }

  private applyLoading(): void {
    if (this.loading) {
      this.chart?.showLoading('default', {
        text: '',
        color: this.readToken('--reke-color-primary', '#22C55E'),
        maskColor: withAlpha(this.readToken('--reke-color-bg', '#0A0A0B'), 0.6),
      });
    } else {
      this.chart?.hideLoading();
    }
  }

  override disconnectedCallback(): void {
    this.themeObserver?.disconnect();
    this.themeObserver = undefined;
    this.colorScheme?.removeEventListener('change', this.repaint);
    this.colorScheme = undefined;
    super.disconnectedCallback();
    this.observer?.disconnect();
    this.chart?.dispose();
    this.chart = undefined;
  }

  /** "2026-01: USDC 100, USDT 20" — one line per category for assistive tech. */
  private describeCategory(index: number): string {
    const values = this.series.map((s) => `${s.name} ${fullNumber.format(s.data[index] ?? 0)}`);
    return `${this.categories[index]}: ${values.join(', ')}`;
  }

  private get chartAriaLabel(): string {
    const names = this.series.map((s) => s.name).join(', ');
    return `${this.label}. ${this.categories.length} categories, series: ${names}`;
  }

  private buildOption(animate: boolean): ChartOption {
    const duration = animate ? this.motionDuration() : 0;
    const font = this.readToken('--reke-font-mono', "'JetBrains Mono', ui-monospace, monospace");
    const text = this.readToken('--reke-color-text', '#E5E5E5');
    const muted = this.readToken('--reke-color-text-label', '#8A8A8A');
    const border = this.readToken('--reke-color-border', '#252525');
    const surface = this.readToken('--reke-color-surface', '#1A1A1A');
    const stacked = this.stacked;
    const scrollable = this.maxVisible > 0 && this.categories.length > this.maxVisible;
    // Opens on the latest window: the most recent periods are the ones people check.
    const window = scrollable
      ? {
          startValue: this.categories.length - this.maxVisible,
          endValue: this.categories.length - 1,
        }
      : undefined;
    const accent = this.readToken('--reke-color-primary', '#22C55E');
    return {
      color: this.resolvePalette(),
      animation: duration > 0,
      animationDuration: duration,
      animationEasing: 'cubicOut',
      aria: { enabled: true },
      textStyle: { fontFamily: font },
      grid: {
        left: 8,
        right: 8,
        top: this.showLegend ? 36 : 12,
        // Room for the zoom slider under the axis labels.
        bottom: scrollable ? 44 : 8,
        containLabel: true,
      },
      dataZoom: window
        ? [
            {
              type: 'inside',
              xAxisIndex: 0,
              ...window,
              zoomOnMouseWheel: 'shift',
              moveOnMouseWheel: true,
            },
            {
              type: 'slider',
              xAxisIndex: 0,
              ...window,
              height: 18,
              bottom: 8,
              brushSelect: false,
              borderColor: border,
              backgroundColor: 'transparent',
              fillerColor: withAlpha(accent, 0.15),
              dataBackground: {
                lineStyle: { color: muted, opacity: 0.4 },
                areaStyle: { color: muted, opacity: 0.1 },
              },
              selectedDataBackground: {
                lineStyle: { color: accent, opacity: 0.6 },
                areaStyle: { color: accent, opacity: 0.15 },
              },
              handleStyle: { color: surface, borderColor: muted },
              moveHandleStyle: { color: muted, opacity: 0.4 },
              textStyle: { color: muted, fontFamily: font, fontSize: 10 },
            },
          ]
        : [],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow', shadowStyle: { color: withAlpha(text, 0.06) } },
        backgroundColor: surface,
        borderColor: border,
        borderWidth: 0.5,
        padding: [8, 12],
        textStyle: { color: text, fontFamily: font, fontSize: 12 },
        // Glassmorphism per the design system; the gradient layers over the surface token.
        extraCssText: `background: linear-gradient(180deg, #FFFFFF10 0%, #FFFFFF05 100%), ${surface}; backdrop-filter: blur(40px); box-shadow: 0 12px 60px -2px #00000040; border-radius: 4px;`,
        formatter: (raw) => {
          const params = raw as unknown as AxisTooltipParam[];
          if (!params.length) return '';
          const rows = params.map(
            (p) =>
              `<div style="display:flex;align-items:center;gap:8px;"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${p.color};"></span>${echarts.format.encodeHTML(p.seriesName)}<span style="margin-left:auto;padding-left:12px;font-weight:600;">${fullNumber.format(Number(p.value) || 0)}</span></div>`,
          );
          // The total only adds up bars; a line is a separate measure (e.g. a running total).
          // Matched by index, not name: two series may share a name.
          const bars = params.filter((p) => (this.series[p.seriesIndex]?.type ?? 'bar') === 'bar');
          const total = bars.reduce((sum, p) => sum + (Number(p.value) || 0), 0);
          const footer =
            bars.length > 1
              ? `<div style="display:flex;margin-top:4px;padding-top:4px;border-top:0.5px solid ${border};color:${muted};">Total<span style="margin-left:auto;padding-left:12px;font-weight:600;color:${text};">${fullNumber.format(total)}</span></div>`
              : '';
          return `<div style="margin-bottom:4px;color:${muted};">${echarts.format.encodeHTML(params[0].name)}</div>${rows.join('')}${footer}`;
        },
      },
      legend: {
        show: this.showLegend,
        top: 0,
        icon: 'roundRect',
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 16,
        textStyle: { color: muted, fontFamily: font, fontSize: 12 },
        inactiveColor: this.readToken('--reke-color-text-disabled', '#3B3B3B'),
      },
      xAxis: {
        type: 'category',
        data: this.categories,
        axisLine: { lineStyle: { color: border } },
        axisTick: { show: false },
        axisLabel: { color: muted, fontFamily: font, fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: border, type: 'dashed' } },
        axisLabel: {
          color: muted,
          fontFamily: font,
          fontSize: 11,
          formatter: (value: number) => compactNumber.format(value),
        },
      },
      series: this.series.map((s, i) => this.buildSeries(s, i, stacked)),
    };
  }

  /**
   * Corner radius per bar item. A bar is rounded at its far end from zero: top
   * corners above zero, bottom corners below. Stacked, only the outermost
   * segment on each side of zero is rounded, so each stack reads as one shape
   * (ECharts stacks positives and negatives separately — `samesign`).
   */
  private itemRadius(i: number, index: number, value: number, stacked: boolean): number | number[] {
    if (!value) return 0;
    const outer = value > 0 ? [4, 4, 0, 0] : [0, 0, 4, 4];
    if (!stacked) return outer;
    let outermost = -1;
    this.series.forEach((s, idx) => {
      const v = s.data[index] ?? 0;
      if ((s.type ?? 'bar') === 'bar' && v !== 0 && Math.sign(v) === Math.sign(value))
        outermost = idx;
    });
    return i === outermost ? outer : 0;
  }

  private buildSeries(
    s: BarChartSeries,
    i: number,
    stacked: boolean,
  ): BarSeriesOption | LineSeriesOption {
    if (s.type === 'line') {
      return {
        type: 'line',
        name: s.name,
        data: s.data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        showSymbol: false,
        lineStyle: { width: 2, color: s.color },
        itemStyle: { color: s.color },
        emphasis: { focus: 'series' },
        z: 3,
      };
    }
    return {
      type: 'bar',
      name: s.name,
      data: s.data.map((value, index) => ({
        value,
        itemStyle: { borderRadius: this.itemRadius(i, index, value, stacked) },
      })),
      stack: stacked ? STACK_ID : undefined,
      barMaxWidth: 32,
      barGap: '20%',
      itemStyle: { color: s.color },
      emphasis: { focus: 'series' },
      blur: { itemStyle: { opacity: 0.35 } },
      animationDelay: (index: number) => Math.min(index, 24) * 20,
    };
  }

  override render() {
    return html`
      <div class="frame">
        <div part="chart" class="chart" role="img" aria-label=${this.chartAriaLabel}></div>
      </div>
      <ul class="sr-only">
        ${this.categories.map((_, i) => html`<li>${this.describeCategory(i)}</li>`)}
      </ul>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-bar-chart': RekeBarChart;
  }
}
