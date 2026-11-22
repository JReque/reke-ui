import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './reke-bar-chart.js';
import type { BarChartSeries } from './reke-bar-chart.js';

type BarChartArgs = {
  stacked: boolean;
  showLegend: boolean;
  loading: boolean;
};

const CATEGORIES = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];

const SERIES: BarChartSeries[] = [
  { name: 'USDC', data: [294.57, 0, 0, 0, 0, 1311.69] },
  { name: 'USDT', data: [863.12, 0, 0, 197.09, 123.99, 1042.47] },
];

const meta: Meta<BarChartArgs> = {
  title: 'Components/BarChart',
  component: 'reke-bar-chart',
  tags: ['autodocs'],
  argTypes: {
    stacked: { control: 'boolean' },
    showLegend: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: {
    stacked: false,
    showLegend: true,
    loading: false,
  },
  render: (args) => html`
    <div style="width: 560px;">
      <reke-bar-chart
        label="Monthly stablecoin purchases"
        .categories=${CATEGORIES}
        .series=${SERIES}
        ?stacked=${args.stacked}
        ?show-legend=${args.showLegend}
        ?loading=${args.loading}
      ></reke-bar-chart>
    </div>
  `,
};

export default meta;
type Story = StoryObj<BarChartArgs>;

export const Grouped: Story = {};

export const Stacked: Story = { args: { stacked: true } };

export const Loading: Story = { args: { loading: true } };

const NET_SERIES: BarChartSeries[] = [
  { name: 'USDC', data: [294.57, 0, -120, 0, 0, 1311.69] },
  { name: 'USDT', data: [863.12, -218, 0, 197.09, -491, 1042.47] },
  { name: 'Cumulative', data: [1157.69, 939.69, 819.69, 1016.78, 525.78, 2879.94], type: 'line' },
];

export const LightTheme: Story = {
  args: { stacked: true },
  render: (args) => html`
    <div data-reke-theme="light" style="width: 560px; background:#FFFFFF; padding:16px;">
      <reke-bar-chart
        label="Monthly stablecoin purchases"
        .categories=${CATEGORIES}
        .series=${SERIES}
        ?stacked=${args.stacked}
        ?show-legend=${args.showLegend}
        ?loading=${args.loading}
      ></reke-bar-chart>
    </div>
  `,
};

const DAYS = Array.from({ length: 365 }, (_, i) =>
  new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10),
);

/** 365 daily bars with `max-visible=60`: opens on the latest 60 and scrolls. */
export const ScrollableDaily: Story = {
  args: { stacked: true },
  render: (args) => html`
    <div style="width: 720px;">
      <reke-bar-chart
        label="Daily net inflows"
        .categories=${DAYS}
        .series=${[
          { name: 'USDT', data: DAYS.map((_, i) => Math.round(Math.sin(i / 9) * 300)) },
          { name: 'USDC', data: DAYS.map((_, i) => (i % 7 === 0 ? 150 : 0)) },
        ]}
        max-visible="60"
        ?stacked=${args.stacked}
        ?show-legend=${args.showLegend}
        ?loading=${args.loading}
      ></reke-bar-chart>
    </div>
  `,
};

/** Net buys - sells per month (bars go below zero) with a running total line. */
export const NetWithCumulativeLine: Story = {
  args: { stacked: true },
  render: (args) => html`
    <div style="width: 560px;">
      <reke-bar-chart
        label="Net stablecoin inflows"
        .categories=${CATEGORIES}
        .series=${NET_SERIES}
        ?stacked=${args.stacked}
        ?show-legend=${args.showLegend}
        ?loading=${args.loading}
      ></reke-bar-chart>
    </div>
  `,
};
