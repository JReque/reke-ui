import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './reke-toggle.js';

type ToggleArgs = {
  checked: boolean;
  disabled: boolean;
  label: string;
};

const meta: Meta<ToggleArgs> = {
  title: 'Components/Toggle',
  component: 'reke-toggle',
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    checked: false,
    disabled: false,
    label: '',
  },
};

export default meta;
type Story = StoryObj<ToggleArgs>;

export const Default: Story = {
  render: (args) => html`
    <reke-toggle
      ?checked=${args.checked}
      ?disabled=${args.disabled}
      label=${args.label}
    ></reke-toggle>
  `,
};

export const Checked: Story = {
  args: { checked: true },
  render: (args) => html`
    <reke-toggle
      ?checked=${args.checked}
      ?disabled=${args.disabled}
      label=${args.label}
    ></reke-toggle>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; gap: 16px; align-items: center;">
      <reke-toggle disabled label="Off disabled"></reke-toggle>
      <reke-toggle checked disabled label="On disabled"></reke-toggle>
    </div>
  `,
};

export const WithLabel: Story = {
  args: { label: 'Enable notifications' },
  render: (args) => html`
    <reke-toggle
      ?checked=${args.checked}
      ?disabled=${args.disabled}
      label=${args.label}
    ></reke-toggle>
  `,
};
