import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './reke-chip.js';

type ChipArgs = {
  color: string;
  active: boolean;
  dismissible: boolean;
  disabled: boolean;
};

const meta: Meta<ChipArgs> = {
  title: 'Components/Chip',
  component: 'reke-chip',
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'warning'],
    },
    active: { control: 'boolean' },
    dismissible: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    color: 'primary',
    active: false,
    dismissible: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<ChipArgs>;

export const Default: Story = {
  render: (args) => html`
    <reke-chip
      color=${args.color}
      ?active=${args.active}
      ?dismissible=${args.dismissible}
      ?disabled=${args.disabled}
    >
      Filter
    </reke-chip>
  `,
};

export const Active: Story = {
  args: { active: true },
  render: (args) => html`
    <reke-chip color=${args.color} active>Active Chip</reke-chip>
  `,
};

export const AllColors: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <reke-chip color="primary" active>Primary</reke-chip>
      <reke-chip color="secondary" active>Secondary</reke-chip>
      <reke-chip color="danger" active>Danger</reke-chip>
      <reke-chip color="warning" active>Warning</reke-chip>
    </div>
  `,
};

export const InactiveVsActive: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <reke-chip color="primary">Inactive</reke-chip>
      <reke-chip color="primary" active>Active</reke-chip>
      <reke-chip color="secondary">Inactive</reke-chip>
      <reke-chip color="secondary" active>Active</reke-chip>
    </div>
  `,
};

export const Dismissible: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <reke-chip dismissible>Removable</reke-chip>
      <reke-chip color="primary" active dismissible>Active Tag</reke-chip>
      <reke-chip color="danger" active dismissible>Error</reke-chip>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <reke-chip disabled>Disabled</reke-chip>
      <reke-chip active disabled>Active Disabled</reke-chip>
      <reke-chip dismissible disabled>Dismissible Disabled</reke-chip>
    </div>
  `,
};

export const SavedViews: Story = {
  name: 'Example: Saved Views',
  render: () => html`
    <div style="display: flex; gap: 6px; align-items: center;">
      <reke-chip color="primary" active dismissible>All trades</reke-chip>
      <reke-chip color="primary" dismissible>Binance only</reke-chip>
      <reke-chip color="primary" dismissible>Last 30 days</reke-chip>
    </div>
  `,
};

export const ExchangeFilters: Story = {
  name: 'Example: Exchange Filters',
  render: () => html`
    <div style="display: flex; gap: 6px; align-items: center;">
      <reke-chip color="secondary" active>All</reke-chip>
      <reke-chip color="secondary">Binance</reke-chip>
      <reke-chip color="secondary">MEXC</reke-chip>
    </div>
  `,
};
