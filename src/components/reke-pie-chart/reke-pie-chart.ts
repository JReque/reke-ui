import { html, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import * as echarts from 'echarts/core';
import { PieChart, type PieSeriesOption } from 'echarts/charts';
import {
  LegendComponent,
  type LegendComponentOption,
  TooltipComponent,
  type TooltipComponentOption,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ComposeOption, ECharts } from 'echarts/core';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-pie-chart.styles.js';

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

type ChartOption = ComposeOption<
  PieSeriesOption | TooltipComponentOption | LegendComponentOption
>;

export type PieChartVariant = 'pie' | 'donut';

export interface PieChartDatum {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartSelectDetail {
  name: string;
  value: number;
  percent: number;
}

/** Fallbacks used only if the `--reke-chart-*` tokens are absent. */
const PALETTE_FALLBACK = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#A855F7', '#14B8A6'];

/**
 * @tag reke-pie-chart
 * @summary A circular (pie / donut) chart rendered with ECharts, isolated in Shadow DOM.
 *
 * @csspart chart - The chart canvas container.
 *
 * @fires reke-pie-chart-select - Fired when a slice is clicked. `detail: { name, value, percent }`.
 *
 * @cssprop [--reke-color-primary=#22C55E] - First slice / accent color.
 */
@customElement('reke-pie-chart')
export class RekePieChart extends RekeElement {
  static override styles = styles;

  /** Slices to render. */
  @property({ attribute: false })
  data: PieChartDatum[] = [];

  /** Pie (filled) or donut (ring). */
  @property({ reflect: true })
  variant: PieChartVariant = 'donut';

  /** Accessible label describing the chart. Required for screen readers. */
  @property()
  label = 'Pie chart';

  /** Square size in px. Falls back to filling the container. */
  @property({ type: Number })
  size?: number;

  /** Show the legend below the chart. */
  @property({ type: Boolean, attribute: 'show-legend', reflect: true })
  showLegend = false;

  /** Show ECharts' native loading spinner (skeleton) over the chart. */
  @property({ type: Boolean, reflect: true })
  loading = false;

  /** Explicit color palette. Overrides the `--reke-chart-*` tokens when set. */
  @property({ attribute: false })
  palette?: string[];

  private chart?: ECharts;
  private observer?: ResizeObserver;

  /** Read a CSS custom property off the host's computed style (canvas can't read var()). */
  private readToken(name: string, fallback: string): string {
    const value = getComputedStyle(this).getPropertyValue(name).trim();
    return value || fallback;
  }

  private resolvePalette(): string[] {
    if (this.palette?.length) return this.palette;
    return PALETTE_FALLBACK.map((fallback, i) => this.readToken(`--reke-chart-${i + 1}`, fallback));
  }

  override firstUpdated(): void {
    const container = this.renderRoot.querySelector('.chart') as HTMLElement;
    this.chart = echarts.init(container);
    this.chart.setOption(this.buildOption());
    this.applyLoading();
    this.chart.on('click', (params) => {
      this.emit<PieChartSelectDetail>('reke-pie-chart-select', {
        name: String(params.name),
        value: Number(params.value),
        percent: Number((params as { percent?: number }).percent ?? 0),
      });
    });
    this.observer = new ResizeObserver(() => this.chart?.resize());
    this.observer.observe(container);
  }

  override updated(changed: PropertyValues): void {
    if (!this.chart) return;
    if (
      changed.has('data') ||
      changed.has('variant') ||
      changed.has('showLegend') ||
      changed.has('palette')
    ) {
      // `true` = notMerge, so removed slices actually disappear. Animations run natively.
      this.chart.setOption(this.buildOption(), true);
    }
    if (changed.has('loading')) this.applyLoading();
  }

  private applyLoading(): void {
    if (this.loading) {
      // Canvas loader can't read CSS vars, so resolve the token to its value first.
      this.chart?.showLoading('default', {
        text: '',
        color: this.readToken('--reke-color-primary', '#22C55E'),
        maskColor: 'rgba(10, 10, 11, 0.4)',
      });
    } else {
      this.chart?.hideLoading();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.observer?.disconnect();
    this.chart?.dispose();
    this.chart = undefined;
  }

  private get total(): number {
    return this.data.reduce((sum, d) => sum + d.value, 0) || 1;
  }

  private get chartAriaLabel(): string {
    const parts = this.data.map(
      (d) => `${d.name} ${Math.round((d.value / this.total) * 100)}%`,
    );
    return `${this.label}. ${parts.join(', ')}`;
  }

  private buildOption(): ChartOption {
    return {
      color: this.resolvePalette(),
      aria: { enabled: true },
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: this.showLegend ? { bottom: 0 } : undefined,
      series: [
        {
          type: 'pie',
          radius: this.variant === 'donut' ? ['55%', '75%'] : '75%',
          center: ['50%', this.showLegend ? '45%' : '50%'],
          avoidLabelOverlap: true,
          label: { show: this.variant === 'pie' },
          data: this.data.map((d) => ({
            name: d.name,
            value: d.value,
            itemStyle: d.color ? { color: d.color } : undefined,
          })),
        },
      ],
    };
  }

  override render() {
    const dimension = this.size ? `${this.size}px` : '100%';
    return html`
      <div
        part="chart"
        class="chart"
        role="img"
        aria-label=${this.chartAriaLabel}
        style="width:${dimension};height:${this.size ? `${this.size}px` : '240px'};"
      ></div>
      <ul class="sr-only">
        ${this.data.map(
          (d) =>
            html`<li>${d.name}: ${Math.round((d.value / this.total) * 100)}%</li>`,
        )}
      </ul>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-pie-chart': RekePieChart;
  }
}
