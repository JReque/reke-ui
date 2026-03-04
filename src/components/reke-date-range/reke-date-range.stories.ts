import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './reke-date-range.js';

type DateRangeArgs = {
  mode: string;
  disabled: boolean;
  error: boolean;
  label: string;
  value: string;
  from: string;
  to: string;
  min: string;
  max: string;
  placeholder: string;
};

const meta: Meta<DateRangeArgs> = {
  title: 'Components/DateRange',
  component: 'reke-date-range',
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'range'],
    },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    label: { control: 'text' },
    value: { control: 'text' },
    from: { control: 'text' },
    to: { control: 'text' },
    min: { control: 'text' },
    max: { control: 'text' },
    placeholder: { control: 'text' },
  },
  args: {
    mode: 'range',
    disabled: false,
    error: false,
    label: 'Period',
    value: '',
    from: '2024-01-01',
    to: '2024-12-31',
    min: '',
    max: '',
    placeholder: '',
  },
};

export default meta;
type Story = StoryObj<DateRangeArgs>;

export const Default: Story = {
  render: (args) => html`
    <reke-date-range
      mode=${args.mode}
      ?disabled=${args.disabled}
      ?error=${args.error}
      label=${args.label}
      from=${args.from}
      to=${args.to}
      value=${args.value}
      min=${args.min}
      max=${args.max}
      placeholder=${args.placeholder}
    ></reke-date-range>
  `,
};

export const SingleDate: Story = {
  render: () => html`
    <reke-date-range
      mode="single"
      label="Date"
      value="2024-06-15"
    ></reke-date-range>
  `,
};

export const SingleDateEmpty: Story = {
  render: () => html`
    <reke-date-range
      mode="single"
      label="Select date"
    ></reke-date-range>
  `,
};

export const RangeWithDates: Story = {
  render: () => html`
    <reke-date-range
      label="Period"
      from="2024-03-01"
      to="2024-03-15"
    ></reke-date-range>
  `,
};

export const RangeEmpty: Story = {
  render: () => html`
    <reke-date-range label="Date range"></reke-date-range>
  `,
};

export const WithMinMax: Story = {
  render: () => html`
    <reke-date-range
      mode="single"
      label="Booking date"
      min="2024-06-01"
      max="2024-06-30"
    ></reke-date-range>
  `,
};

export const Error: Story = {
  render: () => html`
    <reke-date-range
      error
      label="Invalid range"
      from="2024-12-31"
      to="2024-01-01"
    ></reke-date-range>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <reke-date-range
      disabled
      label="Locked"
      from="2024-01-01"
      to="2024-12-31"
    ></reke-date-range>
  `,
};

export const BothModes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <reke-date-range
        mode="single"
        label="Single date"
        value="2024-06-15"
      ></reke-date-range>
      <reke-date-range
        label="Date range"
        from="2024-03-01"
        to="2024-03-15"
      ></reke-date-range>
    </div>
  `,
};
