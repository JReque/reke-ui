import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './reke-file-upload.js';

type FileUploadArgs = {
  accept: string;
  hint: string;
  disabled: boolean;
  error: boolean;
  errorMessage: string;
  compact: boolean;
};

const meta: Meta<FileUploadArgs> = {
  title: 'Components/FileUpload',
  component: 'reke-file-upload',
  tags: ['autodocs'],
  argTypes: {
    accept: { control: 'text' },
    hint: { control: 'text' },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    errorMessage: { control: 'text' },
    compact: { control: 'boolean' },
  },
  args: {
    accept: '.csv,.xlsx',
    hint: 'max 10MB per file',
    disabled: false,
    error: false,
    errorMessage: '',
    compact: false,
  },
};

export default meta;
type Story = StoryObj<FileUploadArgs>;

export const Default: Story = {
  render: (args) => html`
    <div style="width: 480px;">
      <reke-file-upload
        accept=${args.accept}
        hint=${args.hint}
        ?disabled=${args.disabled}
        ?error=${args.error}
        error-message=${args.errorMessage}
        ?compact=${args.compact}
      ></reke-file-upload>
    </div>
  `,
};

export const Compact: Story = {
  render: () => html`
    <div style="width: 480px;">
      <reke-file-upload
        compact
        accept=".csv,.xlsx"
        hint="max 10MB"
      ></reke-file-upload>
    </div>
  `,
};

export const ErrorState: Story = {
  render: () => html`
    <div style="width: 480px;">
      <reke-file-upload
        error
        error-message="// error: formato no soportado"
        accept=".csv"
      ></reke-file-upload>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div style="width: 480px;">
      <reke-file-upload
        disabled
        hint="Upload not available"
      ></reke-file-upload>
    </div>
  `,
};
