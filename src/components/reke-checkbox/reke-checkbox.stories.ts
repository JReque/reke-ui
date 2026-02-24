import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './reke-checkbox.js';

type CheckboxArgs = {
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  label: string;
};

const meta: Meta<CheckboxArgs> = {
  title: 'Components/Checkbox',
  component: 'reke-checkbox',
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    checked: false,
    indeterminate: false,
    disabled: false,
    label: '',
  },
};

export default meta;
type Story = StoryObj<CheckboxArgs>;

export const Default: Story = {
  render: (args) => html`
    <reke-checkbox
      ?checked=${args.checked}
      ?indeterminate=${args.indeterminate}
      ?disabled=${args.disabled}
      label=${args.label}
    ></reke-checkbox>
  `,
};

export const Checked: Story = {
  args: { checked: true },
  render: (args) => html`
    <reke-checkbox
      ?checked=${args.checked}
      label="Checked option"
    ></reke-checkbox>
  `,
};

export const Indeterminate: Story = {
  args: { indeterminate: true },
  render: (args) => html`
    <reke-checkbox
      ?indeterminate=${args.indeterminate}
      label="Indeterminate"
    ></reke-checkbox>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <reke-checkbox disabled label="Disabled unchecked"></reke-checkbox>
      <reke-checkbox disabled checked label="Disabled checked"></reke-checkbox>
    </div>
  `,
};

export const WithLabel: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <reke-checkbox label="Accept terms and conditions"></reke-checkbox>
      <reke-checkbox label="Subscribe to newsletter" checked></reke-checkbox>
      <reke-checkbox label="Remember me"></reke-checkbox>
    </div>
  `,
};
