import { PieChart, type PieSeriesOption } from 'echarts/charts';
import {
  LegendComponent,
  type LegendComponentOption,
  TooltipComponent,
  type TooltipComponentOption,
} from 'echarts/components';
import type { ComposeOption, ECharts } from 'echarts/core';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { html, nothing, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-pie-chart.styles.js';

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

type ChartOption = ComposeOption<PieSeriesOption | TooltipComponentOption | LegendComponentOption>;

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

const compactNumber = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Turns `#RGB` / `#RRGGBB` into `rgba()` so canvas overlays can be translucent. */
function withAlpha(color: string, alpha: number): string {
  const hex = color.trim().replace('#', '');
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
  if (!/^[0-9a-f]{6}$/i.test(full)) return `rgba(0, 0, 0, ${alpha})`;
  const [r, g, b] = [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface SliceParams {
  name: string;
  value: number;
  percent: number;
  color: string;
}

interface HoveredSlice {
  name: string;
  value: number;
  percent: number;
}

/**
 * @tag reke-pie-chart
 * @summary A circular (pie / donut) chart rendered with ECharts, isolated in Shadow DOM.
 *
 * Canvas cannot resolve `var()`, so every token below is read off the host's
 * computed style and re-read whenever `data-reke-theme` or the OS color scheme
 * changes on the document.
 *
 * @csspart chart - The chart canvas container.
 * @csspart center - The donut center overlay (total, or the hovered slice).
 *
 * @fires reke-pie-chart-select - Fired when a slice is clicked. `detail: { name, value, percent }`.
 *
 * @cssprop [--reke-chart-1=#22C55E] - Slice colors 1–6 (`--reke-chart-1` … `--reke-chart-6`).
 * @cssprop [--reke-pie-chart-height=240px] - Chart height when `size` is not set.
 * @cssprop [--reke-color-primary=#22C55E] - Loading spinner color.
 * @cssprop [--reke-color-bg=#0A0A0B] - Loading mask tint.
 * @cssprop [--reke-color-surface=#1A1A1A] - Tooltip background.
 * @cssprop [--reke-color-border=#252525] - Tooltip border.
 * @cssprop [--reke-color-text=#E5E5E5] - Center value, labels and tooltip text.
 * @cssprop [--reke-color-text-label=#8A8A8A] - Legend and center caption text.
 * @cssprop [--reke-color-text-disabled=#3B3B3B] - Legend items toggled off.
 * @cssprop [--reke-color-border-hover=#3A3A3A] - Pie label connector lines.
 * @cssprop [--reke-font-mono=JetBrains Mono] - Chart font family.
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

  /** Caption under the total in the donut center. */
  @property({ attribute: 'center-label' })
  centerLabel = 'Total';

  /** Hide the donut center overlay (total / hovered slice). */
  @property({ type: Boolean, attribute: 'hide-center', reflect: true })
  hideCenter = false;

  /** Entry/update animation length in ms. `0` disables animation. */
  @property({ type: Number, attribute: 'animation-duration' })
  animationDuration = 700;

  private chart?: ECharts;
  private observer?: ResizeObserver;
  private visibility?: IntersectionObserver;
  private themeObserver?: MutationObserver;
  private colorScheme?: MediaQueryList;

  /** Slice under the pointer; the donut center shows it instead of the total. */
  @state() private hovered?: HoveredSlice;

  /** Slices toggled off from the legend, excluded from the center total. */
  @state() private hiddenNames = new Set<string>();

  /**
   * The entry animation is held back until the chart is actually on screen.
   * ECharts animates the moment `setOption` runs, so a chart mounted below the
   * fold plays its reveal into a canvas nobody is looking at and is already
   * static by the time it is scrolled to.
   */
  private revealed = false;

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
    // ECharts creates the <canvas> on its first real render, so the chart is
    // always painted here — an empty frame leaves the container canvas-less.
    // A chart already on screen animates straight away, as it always did; one
    // below the fold is painted static and re-rendered with animation when it
    // is scrolled to, which is the only moment the reveal can be seen.
    if (this.inViewport()) {
      this.revealed = true;
      this.chart.setOption(this.buildOption(true));
    } else {
      this.chart.setOption(this.buildOption(false));
      this.watchVisibility();
    }
    this.applyLoading();
    this.chart.on('mouseover', (params) => {
      if (params.componentType !== 'series') return;
      this.hovered = {
        name: String(params.name),
        value: Number(params.value),
        percent: Number((params as { percent?: number }).percent ?? 0),
      };
    });
    this.chart.on('mouseout', () => {
      this.hovered = undefined;
    });
    // A legend click emits `legendselectchanged`; the programmatic legend
    // actions emit their own event names. All of them carry the full map.
    const syncHidden = (params: unknown) => {
      const { selected } = params as { selected: Record<string, boolean> };
      this.hiddenNames = new Set(Object.keys(selected).filter((name) => !selected[name]));
    };
    for (const event of [
      'legendselectchanged',
      'legendselected',
      'legendunselected',
      'legendselectall',
      'legendinverseselect',
    ]) {
      this.chart.on(event, syncHidden);
    }
    this.chart.on('click', (params) => {
      this.emit<PieChartSelectDetail>('reke-pie-chart-select', {
        name: String(params.name),
        value: Number(params.value),
        percent: Number((params as { percent?: number }).percent ?? 0),
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

  private inViewport(): boolean {
    const rect = this.getBoundingClientRect();
    const height = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < height && rect.bottom > 0;
  }

  /**
   * Reveals on first intersection and then stops observing: the animation is an
   * entrance, not something to replay on every scroll past.
   */
  private watchVisibility(): void {
    // Absent in jsdom and older engines — reveal immediately rather than
    // leaving an empty chart forever.
    if (typeof IntersectionObserver === 'undefined') {
      this.reveal();
      return;
    }
    this.visibility = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        this.reveal();
      },
      { threshold: 0.2 },
    );
    this.visibility.observe(this);
  }

  private reveal(): void {
    if (this.revealed) return;
    this.revealed = true;
    this.visibility?.disconnect();
    this.visibility = undefined;
    this.chart?.setOption(this.buildOption(true), true);
  }

  override updated(changed: PropertyValues): void {
    if (!this.chart) return;
    if (
      changed.has('data') ||
      changed.has('variant') ||
      changed.has('showLegend') ||
      changed.has('palette') ||
      changed.has('animationDuration')
    ) {
      if (changed.has('data')) this.hiddenNames = new Set();
      // `true` = notMerge, so removed slices actually disappear. Updates before
      // the reveal stay static so the entry animation is still the first motion
      // the viewer sees.
      this.chart.setOption(this.buildOption(this.revealed), true);
    }
    if (changed.has('loading')) this.applyLoading();
  }

  private applyLoading(): void {
    if (this.loading) {
      // Canvas loader can't read CSS vars, so resolve the token to its value first.
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
    this.visibility?.disconnect();
    this.visibility = undefined;
    this.themeObserver?.disconnect();
    this.themeObserver = undefined;
    this.colorScheme?.removeEventListener('change', this.repaint);
    this.colorScheme = undefined;
    super.disconnectedCallback();
    this.observer?.disconnect();
    this.chart?.dispose();
    this.chart = undefined;
  }

  private get total(): number {
    return this.data.reduce((sum, d) => sum + d.value, 0) || 1;
  }

  private get showCenter(): boolean {
    return this.variant === 'donut' && !this.hideCenter;
  }

  private get visibleTotal(): number {
    return this.data.reduce((sum, d) => (this.hiddenNames.has(d.name) ? sum : sum + d.value), 0);
  }

  private get chartAriaLabel(): string {
    const parts = this.data.map((d) => `${d.name} ${Math.round((d.value / this.total) * 100)}%`);
    return `${this.label}. ${parts.join(', ')}`;
  }

  private buildOption(animate: boolean): ChartOption {
    const duration = animate ? this.motionDuration() : 0;
    const donut = this.variant === 'donut';
    const font = this.readToken('--reke-font-mono', "'JetBrains Mono', ui-monospace, monospace");
    const text = this.readToken('--reke-color-text', '#E5E5E5');
    const surface = this.readToken('--reke-color-surface', '#1A1A1A');
    return {
      color: this.resolvePalette(),
      animation: duration > 0,
      animationDuration: duration,
      animationEasing: 'cubicOut',
      aria: { enabled: true },
      textStyle: { fontFamily: font },
      tooltip: {
        // The donut center already reports the hovered slice.
        show: !this.showCenter,
        trigger: 'item',
        backgroundColor: surface,
        borderColor: this.readToken('--reke-color-border', '#252525'),
        borderWidth: 0.5,
        padding: [8, 12],
        textStyle: { color: text, fontFamily: font, fontSize: 12 },
        // Glassmorphism per the design system; the gradient layers over the surface token.
        extraCssText: `background: linear-gradient(180deg, #FFFFFF10 0%, #FFFFFF05 100%), ${surface}; backdrop-filter: blur(40px); box-shadow: 0 12px 60px -2px #00000040; border-radius: 4px;`,
        formatter: (params) => {
          const p = params as unknown as SliceParams;
          const name = echarts.format.encodeHTML(p.name);
          return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:8px;"></span>${name}<span style="margin-left:12px;font-weight:600;">${p.percent}%</span>`;
        },
      },
      legend: this.showLegend
        ? {
            bottom: 0,
            icon: 'circle',
            itemWidth: 8,
            itemHeight: 8,
            itemGap: 16,
            textStyle: {
              color: this.readToken('--reke-color-text-label', '#8A8A8A'),
              fontFamily: font,
              fontSize: 12,
            },
            inactiveColor: this.readToken('--reke-color-text-disabled', '#3B3B3B'),
          }
        : undefined,
      series: [
        {
          type: 'pie',
          radius: donut ? ['58%', '78%'] : '75%',
          center: ['50%', this.showLegend ? '45%' : '50%'],
          avoidLabelOverlap: true,
          // Transparent gaps between slices, so they read on any background.
          padAngle: donut ? 2 : 1,
          itemStyle: { borderRadius: donut ? 6 : 4 },
          label: {
            show: !donut,
            color: text,
            fontFamily: font,
            fontSize: 12,
          },
          labelLine: {
            lineStyle: { color: this.readToken('--reke-color-border-hover', '#3A3A3A') },
          },
          emphasis: {
            scale: true,
            scaleSize: 6,
            focus: 'self',
            itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0, 0, 0, 0.35)' },
          },
          blur: { itemStyle: { opacity: 0.35 } },
          animationType: 'expansion',
          animationTypeUpdate: 'transition',
          // Staggered so slices sweep in one after another instead of as a
          // single block. Capped so a long tail of tokens cannot stall the
          // reveal past the animation itself.
          animationDelay: (index: number) => Math.min(index, 12) * 45,
          data: this.data.map((d) => ({
            name: d.name,
            value: d.value,
            itemStyle: d.color ? { color: d.color } : undefined,
          })),
        },
      ],
    };
  }

  private renderCenter() {
    if (!this.showCenter) return nothing;
    const hovered = this.hovered;
    return html`
      <div
        part="center"
        class="center ${this.showLegend ? 'center--legend' : ''}"
        aria-hidden="true"
      >
        <span class="center-value"
          >${hovered ? `${hovered.percent}%` : compactNumber.format(this.visibleTotal)}</span
        >
        <span class="center-caption">${hovered ? hovered.name : this.centerLabel}</span>
      </div>
    `;
  }

  override render() {
    const size = this.size ? `width:${this.size}px;height:${this.size}px;` : '';
    return html`
      <div class="frame" style=${size}>
        <div part="chart" class="chart" role="img" aria-label=${this.chartAriaLabel}></div>
        ${this.renderCenter()}
      </div>
      <ul class="sr-only">
        ${this.data.map(
          (d) => html`<li>${d.name}: ${Math.round((d.value / this.total) * 100)}%</li>`,
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
