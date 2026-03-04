import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './reke-dialog.js';

type DialogArgs = {
  open: boolean;
  heading: string;
  variant: string;
  position: string;
};

const meta: Meta<DialogArgs> = {
  title: 'Components/Dialog',
  component: 'reke-dialog',
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean' },
    heading: { control: 'text' },
    variant: {
      control: 'select',
      options: ['modal', 'drawer'],
    },
    position: {
      control: 'select',
      options: ['right', 'left'],
    },
  },
  args: {
    open: true,
    heading: 'Dialog Title',
    variant: 'modal',
    position: 'right',
  },
};

export default meta;
type Story = StoryObj<DialogArgs>;

export const Default: Story = {
  render: (args) => html`
    <reke-dialog .open=${args.open} heading=${args.heading} variant=${args.variant} position=${args.position}>
      <p style="margin: 0; color: #A3A3A3;">
        This is the dialog body content. You can place any content here including
        text, forms, or other components.
      </p>
    </reke-dialog>
  `,
};

export const WithFooter: Story = {
  render: (args) => html`
    <reke-dialog .open=${args.open} heading=${args.heading}>
      <p style="margin: 0; color: #A3A3A3;">
        Are you sure you want to proceed with this action?
      </p>
      <div slot="footer">
        <reke-button variant="secondary">Cancel</reke-button>
        <reke-button variant="primary">Confirm</reke-button>
      </div>
    </reke-dialog>
  `,
};

export const DrawerRight: Story = {
  args: {
    variant: 'drawer',
    position: 'right',
    heading: 'Settings',
  },
  render: (args) => html`
    <reke-dialog .open=${args.open} heading=${args.heading} variant="drawer" position="right">
      <p style="margin: 0; color: #A3A3A3;">
        Drawer panel sliding from the right side. Useful for settings, details, or secondary navigation.
      </p>
      <div slot="footer">
        <reke-button variant="ghost">Cancel</reke-button>
        <reke-button variant="primary">Save</reke-button>
      </div>
    </reke-dialog>
  `,
};

export const DrawerLeft: Story = {
  args: {
    variant: 'drawer',
    position: 'left',
    heading: 'Navigation',
  },
  render: (args) => html`
    <reke-dialog .open=${args.open} heading=${args.heading} variant="drawer" position="left">
      <p style="margin: 0; color: #A3A3A3;">
        Drawer panel sliding from the left side. Useful for navigation menus or sidebars.
      </p>
    </reke-dialog>
  `,
};

export const Closed: Story = {
  args: {
    open: false,
    heading: 'Hidden Dialog',
  },
  render: (args) => html`
    <reke-dialog .open=${args.open} heading=${args.heading}>
      <p style="margin: 0; color: #A3A3A3;">This dialog is not visible.</p>
    </reke-dialog>
  `,
};
