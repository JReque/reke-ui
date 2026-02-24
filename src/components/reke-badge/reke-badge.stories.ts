import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './reke-badge.js';

type BadgeArgs = {
  variant: string;
  size: string;
};

const meta: Meta<BadgeArgs> = {
  title: 'Components/Badge',
  component: 'reke-badge',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'danger', 'warning', 'success'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
  args: {
    variant: 'default',
    size: 'md',
  },
};

export default meta;
type Story = StoryObj<BadgeArgs>;

export const Default: Story = {
  render: (args) => html`
    <reke-badge variant=${args.variant} size=${args.size}>
      Badge
    </reke-badge>
  `,
};

export const AllVariants: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
      <reke-badge variant="default">Default</reke-badge>
      <reke-badge variant="primary">Primary</reke-badge>
      <reke-badge variant="secondary">Secondary</reke-badge>
      <reke-badge variant="danger">Danger</reke-badge>
      <reke-badge variant="warning">Warning</reke-badge>
      <reke-badge variant="success">Success</reke-badge>
    </div>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; align-items: center;">
      <reke-badge size="sm">Small</reke-badge>
      <reke-badge size="md">Medium</reke-badge>
    </div>
  `,
};

export const Primary: Story = {
  args: { variant: 'primary' },
  render: (args) => html`
    <reke-badge variant=${args.variant} size=${args.size}>
      Active
    </reke-badge>
  `,
};

export const Danger: Story = {
  args: { variant: 'danger' },
  render: (args) => html`
    <reke-badge variant=${args.variant} size=${args.size}>
      Error
    </reke-badge>
  `,
};
