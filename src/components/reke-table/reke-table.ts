import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-table.styles.js';

export interface TableColumn {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export type TableRow = Record<string, unknown>;

/**
 * @tag reke-table
 * @summary A data table component with striped rows, sorting, and dense mode.
 *
 * @fires reke-row-click - Fired when a row is clicked. Detail: `{ row: TableRow, index: number }`.
 * @fires reke-sort - Fired when a column header is clicked for sorting. Detail: `{ key: string, direction: 'asc' | 'desc' }`.
 *
 * @csspart table - The native table element.
 * @csspart header - The thead element.
 * @csspart body - The tbody element.
 * @csspart row - Each tbody tr element.
 * @csspart cell - Each tbody td element.
 * @csspart header-cell - Each thead th element.
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

  @property({ reflect: true, attribute: 'sort-key' })
  sortKey = '';

  @property({ reflect: true, attribute: 'sort-direction' })
  sortDirection: 'asc' | 'desc' = 'asc';

  private handleHeaderClick(column: TableColumn) {
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

  override render() {
    const tableClasses = {
      table: true,
      'table--striped': this.striped,
      'table--dense': this.dense,
      'table--hoverable': this.hoverable,
      'table--bordered': this.bordered,
    };

    return html`
      <div class="table-wrapper">
        <table part="table" class=${classMap(tableClasses)} role="table">
          <thead part="header">
            <tr>
              ${this.columns.map(
                (col) => html`
                  <th
                    part="header-cell"
                    class="header-cell ${this.sortKey === col.key ? 'header-cell--sorted' : ''}"
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
            ${this.rows.map(
              (row, i) => html`
                <tr
                  part="row"
                  class="row"
                  @click=${() => this.handleRowClick(row, i)}
                >
                  ${this.columns.map(
                    (col) => html`
                      <td
                        part="cell"
                        class="cell"
                        data-align=${col.align || 'left'}
                      >
                        ${row[col.key] ?? ''}
                      </td>
                    `,
                  )}
                </tr>
              `,
            )}
            ${this.rows.length === 0
              ? html`
                  <tr class="row row--empty">
                    <td class="cell cell--empty" colspan=${this.columns.length}>
                      No data
                    </td>
                  </tr>
                `
              : nothing}
          </tbody>
        </table>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-table': RekeTable;
  }
}
