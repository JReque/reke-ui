import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './reke-toggle.js';

type ToggleArgs = {
  checked: boolean;
  disabled: boolean;
  label: string;
  labelHidden: boolean;
};

const meta: Meta<ToggleArgs> = {
  title: 'Components/Toggle',
  component: 'reke-toggle',
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    labelHidden: { control: 'boolean' },
  },
  args: {
    checked: false,
    disabled: false,
    label: '',
    labelHidden: false,
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

/**
 * Dense UIs (table rows, list items) need a bare switch, but a switch with no
 * name is unusable with a screen reader. `label-hidden` keeps the name and drops
 * the text — never omit `label` to hide it.
 */
export const HiddenLabel: Story = {
  args: { label: 'Pause alert', labelHidden: true },
  render: (args) => html`
    <div style="display: flex; gap: 16px; align-items: center;">
      <reke-toggle
        ?checked=${args.checked}
        ?disabled=${args.disabled}
        label=${args.label}
        ?label-hidden=${args.labelHidden}
      ></reke-toggle>
      <span style="color: #737373; font-size: 12px;">
        Announced as “${args.label}”, rendered without text.
      </span>
    </div>
  `,
};
