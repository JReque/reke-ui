import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './reke-pie-chart.js';
import type { PieChartDatum } from './reke-pie-chart.js';

type PieChartArgs = {
  variant: 'pie' | 'donut';
  showLegend: boolean;
  loading: boolean;
  size: number;
};

const SAMPLE: PieChartDatum[] = [
  { name: 'Chrome', value: 62 },
  { name: 'Firefox', value: 18 },
  { name: 'Safari', value: 12 },
  { name: 'Edge', value: 8 },
];

const meta: Meta<PieChartArgs> = {
  title: 'Components/PieChart',
  component: 'reke-pie-chart',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['pie', 'donut'] },
    showLegend: { control: 'boolean' },
    loading: { control: 'boolean' },
    size: { control: { type: 'number', min: 160, max: 480, step: 20 } },
  },
  args: {
    variant: 'donut',
    showLegend: true,
    loading: false,
    size: 280,
  },
};

export default meta;
type Story = StoryObj<PieChartArgs>;

export const Default: Story = {
  render: (args) => html`
    <reke-pie-chart
      variant=${args.variant}
      ?show-legend=${args.showLegend}
      ?loading=${args.loading}
      size=${args.size}
      label="Browser share"
      .data=${SAMPLE}
    ></reke-pie-chart>
  `,
};

export const Pie: Story = {
  args: { variant: 'pie' },
  render: (args) => html`
    <reke-pie-chart
      variant=${args.variant}
      ?show-legend=${args.showLegend}
      size=${args.size}
      label="Browser share"
      .data=${SAMPLE}
    ></reke-pie-chart>
  `,
};

export const Loading: Story = {
  args: { loading: true },
  render: (args) => html`
    <reke-pie-chart
      variant=${args.variant}
      ?loading=${args.loading}
      size=${args.size}
      label="Loading data"
      .data=${SAMPLE}
    ></reke-pie-chart>
  `,
};

export const CustomPalette: Story = {
  render: (args) => html`
    <reke-pie-chart
      variant=${args.variant}
      ?show-legend=${args.showLegend}
      size=${args.size}
      label="Custom palette"
      .palette=${['#F472B6', '#818CF8', '#34D399', '#FBBF24']}
      .data=${SAMPLE}
    ></reke-pie-chart>
  `,
};
