import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './reke-alert.js';

type AlertArgs = {
  variant: string;
  dismissible: boolean;
};

const meta: Meta<AlertArgs> = {
  title: 'Components/Alert',
  component: 'reke-alert',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
    },
    dismissible: { control: 'boolean' },
  },
  args: {
    variant: 'info',
    dismissible: false,
  },
};

export default meta;
type Story = StoryObj<AlertArgs>;

export const Default: Story = {
  render: (args) => html`
    <reke-alert variant=${args.variant} ?dismissible=${args.dismissible}>
      $ info: UPDATE  &#8505;  Nueva versión v2.1.0 disponible
    </reke-alert>
  `,
};

export const Success: Story = {
  render: () => html`
    <reke-alert variant="success">
      $ deploy --production  &#10003;  Build completado exitosamente
    </reke-alert>
  `,
};

export const Error: Story = {
  render: () => html`
    <reke-alert variant="error">
      $ error: FATAL  &#10007;  Conexión a base de datos fallida
    </reke-alert>
  `,
};

export const Warning: Story = {
  render: () => html`
    <reke-alert variant="warning">
      $ warn: DEPRECATED  &#9888;  API v1 será removida en próxima versión
    </reke-alert>
  `,
};

export const Info: Story = {
  render: () => html`
    <reke-alert variant="info">
      $ info: UPDATE  &#8505;  Nueva versión v2.1.0 disponible
    </reke-alert>
  `,
};

export const AllVariants: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <reke-alert variant="success">$ deploy --production  &#10003;  Build completado exitosamente</reke-alert>
      <reke-alert variant="error">$ error: FATAL  &#10007;  Conexión a base de datos fallida</reke-alert>
      <reke-alert variant="warning">$ warn: DEPRECATED  &#9888;  API v1 será removida en próxima versión</reke-alert>
      <reke-alert variant="info">$ info: UPDATE  &#8505;  Nueva versión v2.1.0 disponible</reke-alert>
    </div>
  `,
};

export const Dismissible: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <reke-alert variant="success" dismissible>Dismissible success alert</reke-alert>
      <reke-alert variant="error" dismissible>Dismissible error alert</reke-alert>
    </div>
  `,
};
