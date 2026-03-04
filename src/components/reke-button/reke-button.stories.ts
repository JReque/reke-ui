import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './reke-button.js';

type ButtonArgs = {
  variant: string;
  size: string;
  disabled: boolean;
  loading: boolean;
};

const meta: Meta<ButtonArgs> = {
  title: 'Components/Button',
  component: 'reke-button',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'ghost',
        'danger',
        'danger-outline',
        'icon-only',
      ],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
  },
};

export default meta;
type Story = StoryObj<ButtonArgs>;

export const Primary: Story = {
  render: (args) => html`
    <reke-button
      variant=${args.variant}
      size=${args.size}
      ?disabled=${args.disabled}
      ?loading=${args.loading}
    >
      Primary Button
    </reke-button>
  `,
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
  render: (args) => html`
    <reke-button variant=${args.variant} size=${args.size}>
      Secondary Button
    </reke-button>
  `,
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
  render: (args) => html`
    <reke-button variant=${args.variant} size=${args.size}>
      Ghost Button
    </reke-button>
  `,
};

export const Danger: Story = {
  args: { variant: 'danger' },
  render: (args) => html`
    <reke-button variant=${args.variant} size=${args.size}>
      Delete Item
    </reke-button>
  `,
};

export const DangerOutline: Story = {
  args: { variant: 'danger-outline' },
  render: (args) => html`
    <reke-button variant=${args.variant} size=${args.size}>
      Remove
    </reke-button>
  `,
};

export const IconOnly: Story = {
  args: { variant: 'icon-only' },
  render: (args) => html`
    <reke-button variant=${args.variant} size=${args.size}>
      ⚙
    </reke-button>
  `,
};

export const AllVariants: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
      <reke-button variant="primary">Primary</reke-button>
      <reke-button variant="secondary">Secondary</reke-button>
      <reke-button variant="ghost">Ghost</reke-button>
      <reke-button variant="danger">Danger</reke-button>
      <reke-button variant="danger-outline">Danger Outline</reke-button>
      <reke-button variant="icon-only">⚙</reke-button>
    </div>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; align-items: center;">
      <reke-button size="xs">Extra Small</reke-button>
      <reke-button size="sm">Small</reke-button>
      <reke-button size="md">Medium</reke-button>
      <reke-button size="lg">Large</reke-button>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; align-items: center;">
      <reke-button variant="primary" disabled>Disabled Primary</reke-button>
      <reke-button variant="secondary" disabled>Disabled Secondary</reke-button>
      <reke-button variant="danger" disabled>Disabled Danger</reke-button>
    </div>
  `,
};

export const Loading: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; align-items: center;">
      <reke-button variant="primary" loading>Loading</reke-button>
      <reke-button variant="secondary" loading>Loading</reke-button>
      <reke-button variant="danger" loading>Loading</reke-button>
    </div>
  `,
};

export const WithPrefixSuffix: Story = {
  render: () => html`
    <div style="display: flex; gap: 12px; align-items: center;">
      <reke-button variant="primary">
        <span slot="prefix">→</span>
        With Prefix
      </reke-button>
      <reke-button variant="secondary">
        With Suffix
        <span slot="suffix">↗</span>
      </reke-button>
    </div>
  `,
};
