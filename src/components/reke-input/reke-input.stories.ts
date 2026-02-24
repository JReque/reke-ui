import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './reke-input.js';

type InputArgs = {
  size: string;
  disabled: boolean;
  error: boolean;
  placeholder: string;
  label: string;
};

const meta: Meta<InputArgs> = {
  title: 'Components/Input',
  component: 'reke-input',
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
  },
  args: {
    size: 'md',
    disabled: false,
    error: false,
    placeholder: 'Type something...',
    label: 'Label',
  },
};

export default meta;
type Story = StoryObj<InputArgs>;

export const Default: Story = {
  render: (args) => html`
    <reke-input
      size=${args.size}
      ?disabled=${args.disabled}
      ?error=${args.error}
      placeholder=${args.placeholder}
      label=${args.label}
    ></reke-input>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px; width: 300px;">
      <reke-input size="sm" placeholder="Small" label="Small"></reke-input>
      <reke-input size="md" placeholder="Medium" label="Medium"></reke-input>
      <reke-input size="lg" placeholder="Large" label="Large"></reke-input>
    </div>
  `,
};

export const Error: Story = {
  render: () => html`
    <reke-input
      error
      label="Email"
      placeholder="Enter email"
      style="width: 300px;"
    ></reke-input>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <reke-input
      disabled
      label="Disabled"
      placeholder="Cannot type"
      style="width: 300px;"
    ></reke-input>
  `,
};

export const Password: Story = {
  render: () => html`
    <reke-input
      type="password"
      label="Password"
      placeholder="Enter password"
      style="width: 300px;"
    ></reke-input>
  `,
};
