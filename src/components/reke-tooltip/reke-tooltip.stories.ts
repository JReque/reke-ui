import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './reke-tooltip.js';

type TooltipArgs = {
  text: string;
  position: string;
  delay: number;
};

const meta: Meta<TooltipArgs> = {
  title: 'Components/Tooltip',
  component: 'reke-tooltip',
  tags: ['autodocs'],
  argTypes: {
    text: { control: 'text' },
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    delay: { control: 'number' },
  },
  args: {
    text: 'Tooltip text',
    position: 'top',
    delay: 200,
  },
};

export default meta;
type Story = StoryObj<TooltipArgs>;

export const Default: Story = {
  render: (args) => html`
    <div style="padding: 64px; display: flex; justify-content: center;">
      <reke-tooltip text=${args.text} position=${args.position} delay=${args.delay}>
        <span style="color: #E5E5E5; cursor: default;">Hover me</span>
      </reke-tooltip>
    </div>
  `,
};

export const AllPositions: Story = {
  render: () => html`
    <div style="padding: 80px; display: flex; gap: 48px; align-items: center; justify-content: center;">
      <reke-tooltip text="Top tooltip" position="top">
        <span style="color: #E5E5E5; cursor: default;">Top</span>
      </reke-tooltip>
      <reke-tooltip text="Bottom tooltip" position="bottom">
        <span style="color: #E5E5E5; cursor: default;">Bottom</span>
      </reke-tooltip>
      <reke-tooltip text="Left tooltip" position="left">
        <span style="color: #E5E5E5; cursor: default;">Left</span>
      </reke-tooltip>
      <reke-tooltip text="Right tooltip" position="right">
        <span style="color: #E5E5E5; cursor: default;">Right</span>
      </reke-tooltip>
    </div>
  `,
};

export const OnButton: Story = {
  render: () => html`
    <div style="padding: 64px; display: flex; gap: 24px; align-items: center; justify-content: center;">
      <reke-tooltip text="Save your changes" position="top">
        <reke-button variant="primary">Save</reke-button>
      </reke-tooltip>
      <reke-tooltip text="Discard changes" position="bottom">
        <reke-button variant="secondary">Cancel</reke-button>
      </reke-tooltip>
      <reke-tooltip text="This action cannot be undone" position="right">
        <reke-button variant="danger">Delete</reke-button>
      </reke-tooltip>
    </div>
  `,
};
