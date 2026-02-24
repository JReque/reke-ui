import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './reke-select.js';
import type { RekeSelect } from './reke-select.js';

type SelectArgs = {
  size: string;
  disabled: boolean;
  error: boolean;
  placeholder: string;
  label: string;
  value: string;
};

const sampleOptions = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'lit', label: 'Lit' },
];

const meta: Meta<SelectArgs> = {
  title: 'Components/Select',
  component: 'reke-select',
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    placeholder: { control: 'text' },
    label: { control: 'text' },
    value: { control: 'text' },
  },
  args: {
    size: 'md',
    disabled: false,
    error: false,
    placeholder: 'Select...',
    label: 'Framework',
    value: '',
  },
};

export default meta;
type Story = StoryObj<SelectArgs>;

export const Default: Story = {
  render: (args) => {
    const tpl = html`
      <div style="width: 280px;">
        <reke-select
          size=${args.size}
          ?disabled=${args.disabled}
          ?error=${args.error}
          placeholder=${args.placeholder}
          label=${args.label}
        ></reke-select>
      </div>
    `;
    setTimeout(() => {
      const el = document.querySelector('reke-select') as RekeSelect | null;
      if (el) el.options = sampleOptions;
    }, 0);
    return tpl;
  },
};

export const WithValue: Story = {
  render: () => {
    const tpl = html`
      <div style="width: 280px;">
        <reke-select
          label="Framework"
          value="vue"
        ></reke-select>
      </div>
    `;
    setTimeout(() => {
      const el = document.querySelector('reke-select') as RekeSelect | null;
      if (el) el.options = sampleOptions;
    }, 0);
    return tpl;
  },
};

export const Error: Story = {
  render: () => {
    const tpl = html`
      <div style="width: 280px;">
        <reke-select
          error
          label="Framework"
          placeholder="Pick one..."
        ></reke-select>
      </div>
    `;
    setTimeout(() => {
      const el = document.querySelector('reke-select') as RekeSelect | null;
      if (el) el.options = sampleOptions;
    }, 0);
    return tpl;
  },
};

export const Disabled: Story = {
  render: () => {
    const tpl = html`
      <div style="width: 280px;">
        <reke-select
          disabled
          label="Framework"
          placeholder="Cannot select"
        ></reke-select>
      </div>
    `;
    setTimeout(() => {
      const el = document.querySelector('reke-select') as RekeSelect | null;
      if (el) el.options = sampleOptions;
    }, 0);
    return tpl;
  },
};

export const AllSizes: Story = {
  render: () => {
    const tpl = html`
      <div style="display: flex; flex-direction: column; gap: 16px; width: 280px;">
        <reke-select size="sm" label="Small" placeholder="Small select"></reke-select>
        <reke-select size="md" label="Medium" placeholder="Medium select"></reke-select>
        <reke-select size="lg" label="Large" placeholder="Large select"></reke-select>
      </div>
    `;
    setTimeout(() => {
      document.querySelectorAll('reke-select').forEach((el) => {
        (el as RekeSelect).options = sampleOptions;
      });
    }, 0);
    return tpl;
  },
};
