import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './reke-card.js';

type CardArgs = {
  variant: string;
  padding: string;
};

const meta: Meta<CardArgs> = {
  title: 'Components/Card',
  component: 'reke-card',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined'],
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
  args: {
    variant: 'default',
    padding: 'md',
  },
};

export default meta;
type Story = StoryObj<CardArgs>;

export const Default: Story = {
  render: (args) => html`
    <reke-card variant=${args.variant} padding=${args.padding}>
      <p style="margin: 0; color: #E5E5E5;">This is a basic card with some text content inside.</p>
    </reke-card>
  `,
};

export const WithHeader: Story = {
  render: (args) => html`
    <reke-card variant=${args.variant} padding=${args.padding}>
      <span slot="header" style="color: #E5E5E5; font-weight: 500;">Card Title</span>
      <p style="margin: 0; color: #A3A3A3;">Card body content goes here.</p>
    </reke-card>
  `,
};

export const WithHeaderAndFooter: Story = {
  render: (args) => html`
    <reke-card variant=${args.variant} padding=${args.padding}>
      <span slot="header" style="color: #E5E5E5; font-weight: 500;">Card Title</span>
      <p style="margin: 0; color: #A3A3A3;">Card body content with header and footer.</p>
      <span slot="footer" style="color: #737373; font-size: 12px;">Last updated: just now</span>
    </reke-card>
  `,
};

export const AllVariants: Story = {
  args: {
    variant: "elevated",
    padding: "sm"
  },

  render: () => html`
    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
      <reke-card variant="default" style="flex: 1; min-width: 200px;">
        <span slot="header" style="color: #E5E5E5; font-weight: 500;">Default</span>
        <p style="margin: 0; color: #A3A3A3;">Default variant card.</p>
      </reke-card>
      <reke-card variant="elevated" style="flex: 1; min-width: 200px;">
        <span slot="header" style="color: #E5E5E5; font-weight: 500;">Elevated</span>
        <p style="margin: 0; color: #A3A3A3;">Elevated variant card.</p>
      </reke-card>
      <reke-card variant="outlined" style="flex: 1; min-width: 200px;">
        <span slot="header" style="color: #E5E5E5; font-weight: 500;">Outlined</span>
        <p style="margin: 0; color: #A3A3A3;">Outlined variant card.</p>
      </reke-card>
    </div>
  `
};

export const Elevated: Story = {
  args: { variant: 'elevated' },
  render: (args) => html`
    <reke-card variant=${args.variant} padding=${args.padding}>
      <span slot="header" style="color: #E5E5E5; font-weight: 500;">Elevated Card</span>
      <p style="margin: 0; color: #A3A3A3;">This card has a shadow to appear elevated above the surface.</p>
    </reke-card>
  `,
};
