import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './reke-textarea.js';

type TextareaArgs = {
  size: string;
  disabled: boolean;
  error: boolean;
  placeholder: string;
  label: string;
  rows: number;
};

const meta: Meta<TextareaArgs> = {
  title: 'Components/Textarea',
  component: 'reke-textarea',
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
    rows: { control: 'number' },
  },
  args: {
    size: 'md',
    disabled: false,
    error: false,
    placeholder: 'Type something...',
    label: 'Label',
    rows: 4,
  },
};

export default meta;
type Story = StoryObj<TextareaArgs>;

export const Default: Story = {
  render: (args) => html`
    <reke-textarea
      size=${args.size}
      ?disabled=${args.disabled}
      ?error=${args.error}
      placeholder=${args.placeholder}
      label=${args.label}
      rows=${args.rows}
      style="width: 300px;"
    ></reke-textarea>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px; width: 300px;">
      <reke-textarea size="sm" placeholder="Small" label="Small" rows="3"></reke-textarea>
      <reke-textarea size="md" placeholder="Medium" label="Medium" rows="4"></reke-textarea>
      <reke-textarea size="lg" placeholder="Large" label="Large" rows="5"></reke-textarea>
    </div>
  `,
};

export const Error: Story = {
  render: () => html`
    <reke-textarea
      error
      label="Description"
      placeholder="Enter description"
      style="width: 300px;"
    ></reke-textarea>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <reke-textarea
      disabled
      label="Disabled"
      placeholder="Cannot type"
      style="width: 300px;"
    ></reke-textarea>
  `,
};
