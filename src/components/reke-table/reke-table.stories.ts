import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './reke-table.js';

type TableArgs = {
  striped: boolean;
  dense: boolean;
  hoverable: boolean;
  bordered: boolean;
};

const sampleColumns = [
  { key: 'id', header: 'ID', width: '60px', align: 'center' as const },
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Role' },
  { key: 'status', header: 'Status', align: 'center' as const },
];

const sampleRows = [
  { id: '001', name: 'Alice Johnson', role: 'Engineer', status: 'Active' },
  { id: '002', name: 'Bob Smith', role: 'Designer', status: 'Active' },
  { id: '003', name: 'Carol White', role: 'Manager', status: 'Away' },
  { id: '004', name: 'Dave Brown', role: 'Engineer', status: 'Active' },
  { id: '005', name: 'Eve Davis', role: 'QA Lead', status: 'Offline' },
];

const meta: Meta<TableArgs> = {
  title: 'Components/Table',
  component: 'reke-table',
  tags: ['autodocs'],
  argTypes: {
    striped: { control: 'boolean' },
    dense: { control: 'boolean' },
    hoverable: { control: 'boolean' },
    bordered: { control: 'boolean' },
  },
  args: {
    striped: false,
    dense: false,
    hoverable: false,
    bordered: false,
  },
};

export default meta;
type Story = StoryObj<TableArgs>;

export const Default: Story = {
  render: (args) => {
    const id = 'table-default-' + Math.random().toString(36).slice(2, 8);
    setTimeout(() => {
      const el = document.getElementById(id) as any;
      if (el) {
        el.columns = sampleColumns;
        el.rows = sampleRows;
      }
    });
    return html`
      <reke-table
        id=${id}
        ?striped=${args.striped}
        ?dense=${args.dense}
        ?hoverable=${args.hoverable}
        ?bordered=${args.bordered}
      ></reke-table>
    `;
  },
};

export const Striped: Story = {
  args: { striped: true },
  render: (args) => {
    const id = 'table-striped-' + Math.random().toString(36).slice(2, 8);
    setTimeout(() => {
      const el = document.getElementById(id) as any;
      if (el) {
        el.columns = sampleColumns;
        el.rows = sampleRows;
      }
    });
    return html`
      <reke-table
        id=${id}
        ?striped=${args.striped}
        ?dense=${args.dense}
        ?hoverable=${args.hoverable}
        ?bordered=${args.bordered}
      ></reke-table>
    `;
  },
};

export const DenseHoverable: Story = {
  args: { dense: true, hoverable: true },
  render: (args) => {
    const id = 'table-dense-' + Math.random().toString(36).slice(2, 8);
    setTimeout(() => {
      const el = document.getElementById(id) as any;
      if (el) {
        el.columns = sampleColumns;
        el.rows = sampleRows;
      }
    });
    return html`
      <reke-table
        id=${id}
        ?striped=${args.striped}
        ?dense=${args.dense}
        ?hoverable=${args.hoverable}
        ?bordered=${args.bordered}
      ></reke-table>
    `;
  },
};

export const Bordered: Story = {
  args: { bordered: true, striped: true },
  render: (args) => {
    const id = 'table-bordered-' + Math.random().toString(36).slice(2, 8);
    setTimeout(() => {
      const el = document.getElementById(id) as any;
      if (el) {
        el.columns = sampleColumns;
        el.rows = sampleRows;
      }
    });
    return html`
      <reke-table
        id=${id}
        ?striped=${args.striped}
        ?dense=${args.dense}
        ?hoverable=${args.hoverable}
        ?bordered=${args.bordered}
      ></reke-table>
    `;
  },
};

export const Empty: Story = {
  render: () => {
    const id = 'table-empty-' + Math.random().toString(36).slice(2, 8);
    setTimeout(() => {
      const el = document.getElementById(id) as any;
      if (el) {
        el.columns = sampleColumns;
        el.rows = [];
      }
    });
    return html`<reke-table id=${id}></reke-table>`;
  },
};
