import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './reke-progress.js';
import type { RekeProgressSegment } from './reke-progress.js';

type ProgressArgs = {
  value: number;
  color: string;
  segments: RekeProgressSegment[];
  indeterminate: boolean;
};

const meta: Meta<ProgressArgs> = {
  title: 'Components/Progress',
  component: 'reke-progress',
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    color: { control: 'color' },
    segments: { control: 'object' },
    indeterminate: { control: 'boolean' },
  },
  args: {
    value: 40,
    color: '',
    segments: [],
    indeterminate: false,
  },
};

export default meta;
type Story = StoryObj<ProgressArgs>;

export const Default: Story = {
  render: (args) => html`
    <reke-progress
      aria-label="Progress"
      .value=${args.value}
      color=${args.color}
      .segments=${args.segments}
      ?indeterminate=${args.indeterminate}
    ></reke-progress>
  `,
};

export const MultiSegment: Story = {
  args: {
    segments: [
      { value: 10, color: '#22C55E' },
      { value: 20, color: '#3B82F6' },
      { value: 60, color: '#F59E0B' },
    ],
  },
  render: (args) => html`
    <reke-progress aria-label="Storage usage" .segments=${args.segments}></reke-progress>
  `,
};

export const Indeterminate: Story = {
  args: { indeterminate: true },
  render: (args) => html`
    <reke-progress aria-label="Loading" ?indeterminate=${args.indeterminate}></reke-progress>
  `,
};

export const CustomColor: Story = {
  args: { value: 65, color: '#A855F7' },
  render: (args) => html`
    <reke-progress
      aria-label="Custom color progress"
      .value=${args.value}
      color=${args.color}
    ></reke-progress>
  `,
};
