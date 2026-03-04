import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './reke-table.js';
import type { RekeTable, TableColumn, TableRow } from './reke-table.js';

type TableArgs = {
  striped: boolean;
  dense: boolean;
  hoverable: boolean;
  bordered: boolean;
};

const sampleColumns: TableColumn[] = [
  { key: 'id', header: 'ID', width: '60px', align: 'center' },
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Role' },
  { key: 'status', header: 'Status', align: 'center' },
];

const sampleRows: TableRow[] = [
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

function setProps(id: string, columns: TableColumn[], rows: TableRow[], extra?: (el: RekeTable) => void) {
  setTimeout(() => {
    const el = document.getElementById(id) as unknown as RekeTable | null;
    if (el) {
      el.columns = columns;
      el.rows = rows;
      if (extra) extra(el);
    }
  });
}

export const Default: Story = {
  render: (args) => {
    const id = 'table-default-' + Math.random().toString(36).slice(2, 8);
    setProps(id, sampleColumns, sampleRows);
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
    setProps(id, sampleColumns, sampleRows);
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
    setProps(id, sampleColumns, sampleRows);
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
    setProps(id, sampleColumns, sampleRows);
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
    setProps(id, sampleColumns, []);
    return html`<reke-table id=${id}></reke-table>`;
  },
};

// --- Rich cell rendering ---

const statusColor: Record<string, string> = {
  Active: '#22C55E',
  Away: '#F59E0B',
  Offline: '#525252',
};

const richColumns: TableColumn[] = [
  { key: 'id', header: 'ID', width: '60px', align: 'center' },
  {
    key: 'name',
    header: 'User',
    render: (_, row) => html`
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="
          width: 28px; height: 28px; border-radius: 50%;
          background: #252525; display: flex; align-items: center;
          justify-content: center; font-size: 11px; font-weight: 600;
          color: #E5E5E5;
        ">${(row.name as string).slice(0, 2).toUpperCase()}</div>
        <span>${row.name}</span>
      </div>
    `,
  },
  { key: 'role', header: 'Role' },
  {
    key: 'status',
    header: 'Status',
    align: 'center',
    render: (val) => {
      const color = statusColor[val as string] ?? '#525252';
      return html`
        <span style="display: inline-flex; align-items: center; gap: 6px;">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: ${color};"></span>
          ${val}
        </span>
      `;
    },
  },
  {
    key: 'actions',
    header: '',
    width: '80px',
    sortable: false,
    align: 'right',
    render: () => html`
      <button style="background: none; border: none; color: #525252; cursor: pointer; font-size: 16px;">&#x2026;</button>
    `,
  },
];

export const CustomCellRendering: Story = {
  args: { hoverable: true },
  render: (args) => {
    const id = 'table-custom-' + Math.random().toString(36).slice(2, 8);
    setProps(id, richColumns, sampleRows);
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

// --- Trades table (Pencil TradesRichTable design) ---

const exchangeColors: Record<string, { bg: string; text: string }> = {
  mexc: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' },
  binance: { bg: 'rgba(59,130,246,0.1)', text: '#3B82F6' },
  kraken: { bg: 'rgba(168,85,247,0.1)', text: '#A855F7' },
};

const tradeRows: TableRow[] = [
  {
    pair: 'INJ/USDT', dateRange: '01/12 — 31/12', ops: 4,
    buyCount: 3, buyAvg: '$20.04', buyTotal: '$58.12',
    sellCount: 1, sellAvg: '$22.50', sellTotal: '$22.50',
    pnl: '+$4.38 (+7.52%)', pnlPositive: true, curr: 'curr $21.82',
    exchange: 'mexc',
    trades: [
      { date: '31/12/2024', side: 'BUY', qty: '0.4900', price: '$20.04', total: '$9.82', fee: '0.0049 USDT' },
      { date: '28/12/2024', side: 'BUY', qty: '0.3200', price: '$19.80', total: '$6.34', fee: '0.0032 USDT' },
      { date: '15/12/2024', side: 'BUY', qty: '0.5500', price: '$20.32', total: '$11.18', fee: '0.0056 USDT' },
      { date: '22/12/2024', side: 'SELL', qty: '0.3000', price: '$22.50', total: '$6.75', fee: '0.0034 USDT' },
    ],
  },
  {
    pair: 'BTC/USDT', dateRange: '15/12 — 30/12', ops: 3,
    buyCount: 2, buyAvg: '$93,200', buyTotal: '$466.00',
    sellCount: 1, sellAvg: '$93,450', sellTotal: '$233.63',
    pnl: '-$12.45 (-2.67%)', pnlPositive: false, curr: 'curr $94,120',
    exchange: 'binance',
    trades: [
      { date: '30/12/2024', side: 'BUY', qty: '0.0050', price: '$93,000', total: '$465', fee: '0.23 USDT' },
      { date: '22/12/2024', side: 'BUY', qty: '0.0001', price: '$93,400', total: '$9.34', fee: '0.005 USDT' },
      { date: '15/12/2024', side: 'SELL', qty: '0.0025', price: '$93,450', total: '$233.63', fee: '0.12 USDT' },
    ],
  },
  {
    pair: 'ETH/USDT', dateRange: '10/12 — 28/12', ops: 2,
    buyCount: 1, buyAvg: '$3,180', buyTotal: '$318.00',
    sellCount: 1, sellAvg: '$3,220', sellTotal: '$322.00',
    pnl: '+$4.00 (+1.26%)', pnlPositive: true, curr: 'curr $3,195',
    exchange: 'binance',
    trades: [
      { date: '10/12/2024', side: 'BUY', qty: '0.1000', price: '$3,180', total: '$318', fee: '0.16 USDT' },
      { date: '28/12/2024', side: 'SELL', qty: '0.1000', price: '$3,220', total: '$322', fee: '0.16 USDT' },
    ],
  },
  {
    pair: 'SOL/USDT', dateRange: '05/12 — 20/12', ops: 3,
    buyCount: 2, buyAvg: '$107.31', buyTotal: '$214.62',
    sellCount: 1, sellAvg: '$110.50', sellTotal: '$110.50',
    pnl: '+$6.38 (+2.97%)', pnlPositive: true, curr: 'curr $108.20',
    exchange: 'mexc',
    trades: [
      { date: '05/12/2024', side: 'BUY', qty: '1.0000', price: '$106.12', total: '$106.12', fee: '0.053 USDT' },
      { date: '12/12/2024', side: 'BUY', qty: '1.0000', price: '$108.50', total: '$108.50', fee: '0.054 USDT' },
      { date: '20/12/2024', side: 'SELL', qty: '1.0000', price: '$110.50', total: '$110.50', fee: '0.055 USDT' },
    ],
  },
];

const subTradeColumns: TableColumn[] = [
  { key: 'date', header: 'fecha', width: '100px' },
  {
    key: 'side', header: 'side', width: '60px',
    render: (val) => {
      const isBuy = val === 'BUY';
      return html`
        <span style="
          padding: 2px 8px; border-radius: 4px; font-size: 9px; font-weight: 500;
          background: ${isBuy ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)'};
          color: ${isBuy ? '#22C55E' : '#EF4444'};
        ">${val}</span>
      `;
    },
  },
  { key: 'qty', header: 'qty', width: '100px' },
  { key: 'price', header: 'price', width: '100px' },
  { key: 'total', header: 'total', width: '100px' },
  { key: 'fee', header: 'fee' },
];

export const ExpandableRows: Story = {
  args: { hoverable: true },
  render: (args) => {
    const id = 'table-expand-' + Math.random().toString(36).slice(2, 8);
    setProps(id, [], tradeRows, (el) => {
      const makeColumns = (): TableColumn[] => [
        {
          key: 'ticker', header: 'ticker', width: '200px',
          render: (_, row) => html`
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <span style="font-weight: 500; font-size: 13px;">${row.pair}</span>
              <span style="font-size: 10px; color: #525252;">${row.dateRange} · ${row.ops} ops</span>
            </div>
          `,
        },
        {
          key: 'buys', header: 'compras',
          render: (_, row) => html`
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <span style="color: #22C55E; font-size: 11px;">${row.buyCount} buys · avg ${row.buyAvg}</span>
              <span style="font-size: 10px; color: #525252;">total ${row.buyTotal}</span>
            </div>
          `,
        },
        {
          key: 'sells', header: 'ventas',
          render: (_, row) => html`
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <span style="color: #EF4444; font-size: 11px;">${row.sellCount} sell · avg ${row.sellAvg}</span>
              <span style="font-size: 10px; color: #525252;">total ${row.sellTotal}</span>
            </div>
          `,
        },
        {
          key: 'pnl', header: 'pnl', width: '200px',
          render: (_, row) => html`
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <span style="font-weight: 500; font-size: 12px; color: ${row.pnlPositive ? '#22C55E' : '#EF4444'};">${row.pnl}</span>
              <span style="font-size: 10px; color: #525252;">${row.curr}</span>
            </div>
          `,
        },
        {
          key: 'exchange', header: 'exchange', width: '140px', sortable: false, align: 'right' as const,
          render: (val, _row, i) => {
            const ex = (val as string).toLowerCase();
            const colors = exchangeColors[ex] ?? { bg: 'rgba(82,82,82,0.1)', text: '#525252' };
            const expanded = el.isRowExpanded(i);
            return html`
              <div style="display: flex; align-items: center; justify-content: flex-end; gap: 12px;">
                <span style="
                  padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: 500;
                  background: ${colors.bg}; color: ${colors.text};
                ">${ex}</span>
                <button
                  @click=${(e: Event) => { e.stopPropagation(); el.toggleExpand(i); }}
                  aria-expanded=${expanded}
                  aria-label=${expanded ? 'Collapse row' : 'Expand row'}
                  style="
                    background: none; border: none; cursor: pointer; padding: 0;
                    color: ${expanded ? '#22C55E' : '#525252'}; font-size: 16px; line-height: 1;
                  "
                >${expanded ? '\u25B2' : '\u25BC'}</button>
              </div>
            `;
          },
        },
      ];

      el.columns = makeColumns();

      el.expandedRowRender = (row: TableRow) => html`
        <div style="
          background: #111112;
          border-left: 2px solid rgba(34,197,94,0.19);
          padding: 0 0 0 16px;
        ">
          <reke-table
            borderless
            dense
            .columns=${subTradeColumns}
            .rows=${(row.trades as TableRow[])}
          ></reke-table>
        </div>
      `;

      // Re-render columns when expand state changes to update chevron
      el.addEventListener('reke-row-expand', () => {
        el.columns = makeColumns();
      });
    });
    return html`
      <reke-table
        id=${id}
        ?striped=${args.striped}
        ?dense=${args.dense}
        ?hoverable=${args.hoverable}
        ?bordered=${args.bordered}
      >
        <div slot="toolbar" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="color: #22C55E; font-size: 16px;">&#x2197;</span>
            <span style="color: #E5E5E5; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 500;">trades.findAll()</span>
            <span style="
              padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: 500;
              background: rgba(34,197,94,0.08); color: #22C55E;
            ">1,247 records</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <div style="
              display: flex; align-items: center; gap: 8px;
              background: #0F0F10; border: 1px solid #252525; border-radius: 4px; padding: 8px 12px;
            ">
              <span style="color: #525252; font-size: 14px;">&#x1F50D;</span>
              <span style="color: #3B3B3B; font-family: 'JetBrains Mono', monospace; font-size: 11px;">search()</span>
            </div>
            <div style="
              display: flex; align-items: center; gap: 6px;
              border: 1px solid #252525; border-radius: 4px; padding: 8px 12px;
            ">
              <span style="color: #525252; font-size: 14px;">&#x2630;</span>
              <span style="color: #525252; font-family: 'JetBrains Mono', monospace; font-size: 11px;">filter()</span>
            </div>
          </div>
        </div>
        <div slot="footer" style="display: flex; align-items: center; justify-content: space-between; width: 100%; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #3B3B3B;">
          <span>// mostrando 4 tickers · 14 operaciones</span>
          <div style="display: flex; gap: 4px;">
            <span style="background: #22C55E; color: #0A0A0B; padding: 6px 10px; border-radius: 4px; font-weight: 600;">1</span>
            <span style="color: #525252; padding: 6px 10px; border-radius: 4px;">2</span>
            <span style="color: #525252; padding: 6px 10px; border-radius: 4px;">&gt;</span>
          </div>
        </div>
      </reke-table>
    `;
  },
};

export const WithToolbarAndFooter: Story = {
  args: { hoverable: true, striped: true },
  render: (args) => {
    const id = 'table-toolbar-' + Math.random().toString(36).slice(2, 8);
    setProps(id, richColumns, sampleRows);
    return html`
      <reke-table
        id=${id}
        ?striped=${args.striped}
        ?dense=${args.dense}
        ?hoverable=${args.hoverable}
        ?bordered=${args.bordered}
      >
        <div slot="toolbar" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #525252; font-family: monospace; font-size: 13px;">users.findAll()</span>
            <span style="
              padding: 2px 8px; border-radius: 4px; font-size: 11px;
              background: rgba(34,197,94,0.1); color: #22C55E;
            ">128 records</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <input type="text" placeholder="Search..." style="
              background: #0A0A0B; border: 1px solid #252525; border-radius: 4px;
              padding: 4px 8px; color: #E5E5E5; font-size: 12px; font-family: monospace;
            " />
            <button style="
              background: #0A0A0B; border: 1px solid #252525; border-radius: 4px;
              padding: 4px 8px; color: #525252; cursor: pointer; font-size: 12px;
            ">Filter</button>
          </div>
        </div>
        <div slot="footer" style="display: flex; align-items: center; justify-content: space-between; width: 100%; font-family: monospace; font-size: 12px; color: #525252;">
          <span>// mostrando 1-5 de 128</span>
          <div style="display: flex; gap: 4px;">
            <button style="background: none; border: 1px solid #252525; border-radius: 4px; padding: 2px 8px; color: #525252; cursor: pointer;">&#xAB;</button>
            <button style="background: #22C55E; border: none; border-radius: 4px; padding: 2px 8px; color: #0A0A0B; font-weight: 700; cursor: pointer;">1</button>
            <button style="background: none; border: 1px solid #252525; border-radius: 4px; padding: 2px 8px; color: #525252; cursor: pointer;">2</button>
            <button style="background: none; border: 1px solid #252525; border-radius: 4px; padding: 2px 8px; color: #525252; cursor: pointer;">3</button>
            <span style="color: #3B3B3B;">...</span>
            <button style="background: none; border: 1px solid #252525; border-radius: 4px; padding: 2px 8px; color: #525252; cursor: pointer;">26</button>
            <button style="background: none; border: 1px solid #252525; border-radius: 4px; padding: 2px 8px; color: #525252; cursor: pointer;">&#xBB;</button>
          </div>
        </div>
      </reke-table>
    `;
  },
};
