import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './reke-toast.js';

type ToastArgs = {
  variant: string;
  message: string;
  action: string;
  duration: number;
};

const meta: Meta<ToastArgs> = {
  title: 'Components/Toast',
  component: 'reke-toast',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
    },
    message: { control: 'text' },
    action: { control: 'text' },
    duration: { control: 'number' },
  },
  args: {
    variant: 'success',
    message: 'Cambios guardados exitosamente',
    action: '',
    duration: 0,
  },
};

export default meta;
type Story = StoryObj<ToastArgs>;

export const Default: Story = {
  render: (args) => html`
    <div style="width: 480px;">
      <reke-toast
        variant=${args.variant}
        message=${args.message}
        action=${args.action}
        duration=${args.duration}
      ></reke-toast>
    </div>
  `,
};

export const Success: Story = {
  render: () => html`
    <div style="width: 480px;">
      <reke-toast
        variant="success"
        message="Cambios guardados exitosamente"
      ></reke-toast>
    </div>
  `,
};

export const ErrorWithAction: Story = {
  render: () => html`
    <div style="width: 480px;">
      <reke-toast
        variant="error"
        message="Error de conexión"
        action="reintentar()"
      ></reke-toast>
    </div>
  `,
};

export const AllVariants: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px; width: 480px;">
      <reke-toast variant="success" message="Deploy completado exitosamente"></reke-toast>
      <reke-toast variant="error" message="Error de conexión a la base de datos" action="reintentar()"></reke-toast>
      <reke-toast variant="warning" message="API rate limit al 80%"></reke-toast>
      <reke-toast variant="info" message="Nueva versión disponible v2.1.0"></reke-toast>
    </div>
  `,
};
