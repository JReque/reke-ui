import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './reke-combobox.js';
import type { RekeCombobox } from './reke-combobox.js';

type ComboboxArgs = {
  size: string;
  disabled: boolean;
  error: boolean;
  placeholder: string;
  label: string;
  value: string;
  emptyText: string;
};

const sampleOptions = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'lit', label: 'Lit' },
  { value: 'solid', label: 'Solid' },
  { value: 'qwik', label: 'Qwik' },
];

const meta: Meta<ComboboxArgs> = {
  title: 'Components/Combobox',
  component: 'reke-combobox',
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
    emptyText: { control: 'text' },
  },
  args: {
    size: 'md',
    disabled: false,
    error: false,
    placeholder: 'Buscar...',
    label: 'Framework',
    value: '',
    emptyText: 'Sin resultados',
  },
};

export default meta;
type Story = StoryObj<ComboboxArgs>;

export const Default: Story = {
  render: (args) => {
    const tpl = html`
      <div style="width: 280px;">
        <reke-combobox
          size=${args.size}
          ?disabled=${args.disabled}
          ?error=${args.error}
          placeholder=${args.placeholder}
          label=${args.label}
          emptyText=${args.emptyText}
        ></reke-combobox>
      </div>
    `;
    setTimeout(() => {
      const el = document.querySelector('reke-combobox') as RekeCombobox | null;
      if (el) el.options = sampleOptions;
    }, 0);
    return tpl;
  },
};

export const WithValue: Story = {
  render: () => {
    const tpl = html`
      <div style="width: 280px;">
        <reke-combobox label="Framework" value="vue"></reke-combobox>
      </div>
    `;
    setTimeout(() => {
      const el = document.querySelector('reke-combobox') as RekeCombobox | null;
      if (el) el.options = sampleOptions;
    }, 0);
    return tpl;
  },
};

export const WithImages: Story = {
  render: () => {
    const tpl = html`
      <div style="width: 280px;">
        <reke-combobox label="Token" placeholder="Buscar token..."></reke-combobox>
      </div>
    `;
    setTimeout(() => {
      const el = document.querySelector('reke-combobox') as RekeCombobox | null;
      if (el) {
        el.options = [
          {
            value: 'btc',
            label: 'Bitcoin',
            image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
          },
          {
            value: 'eth',
            label: 'Ethereum',
            image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
          },
          {
            value: 'sol',
            label: 'Solana',
            image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
          },
        ];
      }
    }, 0);
    return tpl;
  },
};

export const Multiselect: Story = {
  render: () => {
    const tpl = html`
      <div style="width: 280px;">
        <reke-combobox multiple label="Frameworks" placeholder="Buscar frameworks..."></reke-combobox>
      </div>
    `;
    setTimeout(() => {
      const el = document.querySelector('reke-combobox') as RekeCombobox | null;
      if (el) {
        el.options = sampleOptions;
        el.values = ['react', 'lit'];
      }
    }, 0);
    return tpl;
  },
};

export const Error: Story = {
  render: () => {
    const tpl = html`
      <div style="width: 280px;">
        <reke-combobox error label="Framework" placeholder="Pick one..."></reke-combobox>
      </div>
    `;
    setTimeout(() => {
      const el = document.querySelector('reke-combobox') as RekeCombobox | null;
      if (el) el.options = sampleOptions;
    }, 0);
    return tpl;
  },
};

export const Disabled: Story = {
  render: () => {
    const tpl = html`
      <div style="width: 280px;">
        <reke-combobox disabled label="Framework" placeholder="Cannot select"></reke-combobox>
      </div>
    `;
    setTimeout(() => {
      const el = document.querySelector('reke-combobox') as RekeCombobox | null;
      if (el) el.options = sampleOptions;
    }, 0);
    return tpl;
  },
};

export const AllSizes: Story = {
  render: () => {
    const tpl = html`
      <div style="display: flex; flex-direction: column; gap: 16px; width: 280px;">
        <reke-combobox size="sm" label="Small" placeholder="Small combobox"></reke-combobox>
        <reke-combobox size="md" label="Medium" placeholder="Medium combobox"></reke-combobox>
        <reke-combobox size="lg" label="Large" placeholder="Large combobox"></reke-combobox>
      </div>
    `;
    setTimeout(() => {
      document.querySelectorAll('reke-combobox').forEach((el) => {
        (el as RekeCombobox).options = sampleOptions;
      });
    }, 0);
    return tpl;
  },
};
