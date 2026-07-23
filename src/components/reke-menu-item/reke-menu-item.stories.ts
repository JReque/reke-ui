import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './reke-menu-item.js';

const meta: Meta = {
  title: 'Components/MenuItem',
  component: 'reke-menu-item',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'danger'] },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Playground: Story = {
  args: { variant: 'default', disabled: false },
  render: (args) => html`
    <div role="menu" aria-label="Demo" style="width:180px">
      <reke-menu-item variant=${args.variant} ?disabled=${args.disabled}>Menu item</reke-menu-item>
    </div>
  `,
};

export const Variants: Story = {
  render: () => html`
    <div role="menu" aria-label="Demo" style="width:180px">
      <reke-menu-item>Default</reke-menu-item>
      <reke-menu-item variant="danger">Danger</reke-menu-item>
      <reke-menu-item disabled>Disabled</reke-menu-item>
    </div>
  `,
};
