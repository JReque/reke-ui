import { tailwindStyles } from '../../shared/tailwind-styles.js';
import { css } from 'lit';

export const styles = [
  tailwindStyles,
  css`
    :host {
      display: block;
    }

    .table-wrapper {
      overflow-x: auto;
      border: 1px solid var(--reke-color-border, #252525);
      border-radius: var(--reke-radius, 4px);
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: 13px;
      color: var(--reke-color-text, #E5E5E5);
      background: var(--reke-color-surface, #1A1A1A);
    }

    /* === Header === */

    thead {
      background: var(--reke-color-surface, #1A1A1A);
    }

    .header-cell {
      padding: 12px 16px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--reke-color-text-muted, #525252);
      border-bottom: 1px solid var(--reke-color-border, #252525);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
    }

    .header-cell[data-align='left'] {
      text-align: left;
    }

    .header-cell[data-align='center'] {
      text-align: center;
    }

    .header-cell[data-align='right'] {
      text-align: right;
    }

    .header-cell:hover {
      color: var(--reke-color-text, #E5E5E5);
    }

    .header-cell--sorted {
      color: var(--reke-color-primary, #22C55E);
    }

    .header-content {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .sort-indicator {
      font-size: 10px;
    }

    /* === Body === */

    .row {
      border-bottom: 1px solid var(--reke-color-border, #252525);
    }

    .row:last-child {
      border-bottom: none;
    }

    .cell {
      padding: 12px 16px;
    }

    .cell[data-align='left'] {
      text-align: left;
    }

    .cell[data-align='center'] {
      text-align: center;
    }

    .cell[data-align='right'] {
      text-align: right;
    }

    .cell--empty {
      text-align: center;
      color: var(--reke-color-text-muted, #525252);
      padding: 24px 16px;
    }

    /* === Modifiers === */

    .table--striped .row:nth-child(even) {
      background: color-mix(in srgb, var(--reke-color-surface, #1A1A1A) 85%, var(--reke-color-border, #252525));
    }

    .table--hoverable .row:hover {
      background: color-mix(in srgb, var(--reke-color-surface, #1A1A1A) 75%, var(--reke-color-border, #252525));
      cursor: pointer;
    }

    .table--dense .header-cell {
      padding: 8px 12px;
    }

    .table--dense .cell {
      padding: 6px 12px;
      font-size: 12px;
    }

    .table--bordered .cell,
    .table--bordered .header-cell {
      border-right: 1px solid var(--reke-color-border, #252525);
    }

    .table--bordered .cell:last-child,
    .table--bordered .header-cell:last-child {
      border-right: none;
    }
  `,
];
