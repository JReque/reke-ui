import { html, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-table.styles.js';

export interface TableColumn {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  /** Set to false to disable sorting on this column. Default: true. */
  sortable?: boolean;
  /** Custom render function for cell content. Falls back to row[col.key] if omitted. */
  render?: (value: unknown, row: TableRow, index: number) => TemplateResult | string;
}

export type TableRow = Record<string, unknown>;

export type ExpandedRowRenderer = (row: TableRow, index: number) => TemplateResult;

/**
 * @tag reke-table
 * @summary A data table with custom cell rendering, expandable rows, and toolbar/footer slots.
 *
 * @slot toolbar - Toolbar area above the table (search, filters, title).
 * @slot footer - Footer area below the table (pagination, record count).
 * @slot empty - Custom empty state content (replaces default "No data").
 *
 * @fires reke-row-click - Fired when a row is clicked. Detail: `{ row: TableRow, index: number }`.
 * @fires reke-sort - Fired when a sortable header is clicked. Detail: `{ key: string, direction: 'asc' | 'desc' }`.
 * @fires reke-row-expand - Fired when a row is expanded or collapsed. Detail: `{ row: TableRow, index: number, expanded: boolean }`.
 *
 * @csspart table - The native table element.
 * @csspart header - The thead element.
 * @csspart body - The tbody element.
 * @csspart row - Each tbody data tr element.
 * @csspart cell - Each tbody td element.
 * @csspart header-cell - Each thead th element.
 * @csspart toolbar - The toolbar wrapper div.
 * @csspart footer - The footer wrapper div.
 * @csspart expand-row - The tr for expanded content.
 * @csspart expand-content - The td spanning all columns in the expanded row.
 *
 * @cssprop [--reke-color-surface=#1A1A1A] - Table background.
 * @cssprop [--reke-color-border=#252525] - Border and row divider color.
 * @cssprop [--reke-color-text=#E5E5E5] - Cell text color.
 * @cssprop [--reke-color-text-muted=#525252] - Header text color.
 */
@customElement('reke-table')
export class RekeTable extends RekeElement {
  static override styles = styles;

  @property({ attribute: false })
  columns: TableColumn[] = [];

  @property({ attribute: false })
  rows: TableRow[] = [];

  @property({ type: Boolean, reflect: true })
  striped = false;

  @property({ type: Boolean, reflect: true })
  dense = false;

  @property({ type: Boolean, reflect: true })
  hoverable = false;

  @property({ type: Boolean, reflect: true })
  bordered = false;

  @property({ type: Boolean, reflect: true })
  borderless = false;

  @property({ reflect: true, attribute: 'sort-key' })
  sortKey = '';

  @property({ reflect: true, attribute: 'sort-direction' })
  sortDirection: 'asc' | 'desc' = 'asc';

  /** When set, rows become expandable with a chevron toggle. */
  @property({ attribute: false })
  expandedRowRender: ExpandedRowRenderer | null = null;

  /** Set of row indices currently expanded. */
  @property({ attribute: false })
  expandedRows: Set<number> = new Set();

  @state() private _hasToolbar = false;
  @state() private _hasFooter = false;

  private handleHeaderClick(column: TableColumn) {
    if (column.sortable === false) return;

    if (this.sortKey === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = column.key;
      this.sortDirection = 'asc';
    }
    this.emit('reke-sort', { key: this.sortKey, direction: this.sortDirection });
  }

  private handleRowClick(row: TableRow, index: number) {
    this.emit('reke-row-click', { row, index });
  }

  /** Toggle expand state for a row at the given index. */
  toggleExpand(index: number) {
    const newSet = new Set(this.expandedRows);
    const row = this.rows[index];
    const expanding = !newSet.has(index);
    if (expanding) {
      newSet.add(index);
    } else {
      newSet.delete(index);
    }
    this.expandedRows = newSet;
    this.emit('reke-row-expand', { row, index, expanded: expanding });
  }

  /** Check whether a row at the given index is currently expanded. */
  isRowExpanded(index: number): boolean {
    return this.expandedRows.has(index);
  }

  private _onToolbarSlotChange(e: Event) {
    const el = e.target as HTMLSlotElement;
    this._hasToolbar = el.assignedNodes({ flatten: true }).length > 0;
  }

  private _onFooterSlotChange(e: Event) {
    const el = e.target as HTMLSlotElement;
    this._hasFooter = el.assignedNodes({ flatten: true }).length > 0;
  }

  private _renderRow(row: TableRow, i: number) {
    const isExpanded = this.expandedRows.has(i);

    return html`
      <tr
        part="row"
        class="row ${i % 2 === 1 ? 'row--even' : ''} ${isExpanded ? 'row--expanded' : ''}"
        @click=${() => this.handleRowClick(row, i)}
      >
        ${this.columns.map(
          (col) => html`
            <td
              part="cell"
              class="cell"
              data-align=${col.align || 'left'}
            >
              ${col.render ? col.render(row[col.key], row, i) : (row[col.key] ?? '')}
            </td>
          `,
        )}
      </tr>
      ${this.expandedRowRender && isExpanded
        ? html`
            <tr part="expand-row" class="expand-row">
              <td part="expand-content" class="expand-content" colspan=${this.columns.length}>
                ${this.expandedRowRender(row, i)}
              </td>
            </tr>
          `
        : nothing}
    `;
  }

  override render() {
    const tableClasses = {
      table: true,
      'table--striped': this.striped,
      'table--dense': this.dense,
      'table--hoverable': this.hoverable,
      'table--bordered': this.bordered,
    };

    return html`
      <div class="table-container">
        ${this._hasToolbar
          ? html`
              <div part="toolbar" class="table-toolbar">
                <slot name="toolbar" @slotchange=${this._onToolbarSlotChange}></slot>
              </div>
            `
          : html`<slot name="toolbar" @slotchange=${this._onToolbarSlotChange} style="display:none"></slot>`}

        <div class="table-wrapper">
          <table part="table" class=${classMap(tableClasses)} role="table">
            <thead part="header">
              <tr>
                ${this.columns.map(
                  (col) => html`
                    <th
                      part="header-cell"
                      class="header-cell ${this.sortKey === col.key ? 'header-cell--sorted' : ''} ${col.sortable === false ? 'header-cell--no-sort' : ''}"
                      style=${col.width ? `width: ${col.width}` : ''}
                      data-align=${col.align || 'left'}
                      @click=${() => this.handleHeaderClick(col)}
                    >
                      <span class="header-content">
                        ${col.header}
                        ${this.sortKey === col.key
                          ? html`<span class="sort-indicator" aria-hidden="true">${this.sortDirection === 'asc' ? '↑' : '↓'}</span>`
                          : nothing}
                      </span>
                    </th>
                  `,
                )}
              </tr>
            </thead>
            <tbody part="body">
              ${this.rows.map((row, i) => this._renderRow(row, i))}
              ${this.rows.length === 0
                ? html`
                    <tr class="row row--empty">
                      <td class="cell cell--empty" colspan=${this.columns.length}>
                        <slot name="empty">No data</slot>
                      </td>
                    </tr>
                  `
                : nothing}
            </tbody>
          </table>
        </div>

        ${this._hasFooter
          ? html`
              <div part="footer" class="table-footer">
                <slot name="footer" @slotchange=${this._onFooterSlotChange}></slot>
              </div>
            `
          : html`<slot name="footer" @slotchange=${this._onFooterSlotChange} style="display:none"></slot>`}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-table': RekeTable;
  }
}
