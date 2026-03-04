import { tailwindStyles } from '../../shared/tailwind-styles.js';
import { css } from 'lit';

export const styles = [
  tailwindStyles,
  css`
    :host {
      display: block;
    }

    /* === Container (wraps toolbar + table + footer) === */

    .table-container {
      border: 1px solid var(--reke-color-border, #252525);
      border-radius: var(--reke-radius, 4px);
      overflow: hidden;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: 13px;
      color: var(--reke-color-text, #E5E5E5);
      background: var(--reke-color-surface, #1A1A1A);
    }

    /* === Toolbar === */

    .table-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--reke-color-border, #252525);
      background: var(--reke-color-surface, #1A1A1A);
    }

    /* === Footer === */

    .table-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-top: 1px solid var(--reke-color-border, #252525);
      background: var(--reke-color-surface, #1A1A1A);
      font-size: 12px;
      color: var(--reke-color-text-muted, #525252);
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

    .header-cell--no-sort {
      cursor: default;
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

    .header-cell--no-sort:hover {
      color: var(--reke-color-text-muted, #525252);
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

    .row--expanded {
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

    /* === Expanded row === */

    .expand-row {
      background: var(--reke-color-surface, #1A1A1A);
      border-bottom: 1px solid var(--reke-color-border, #252525);
    }

    .expand-row:last-child {
      border-bottom: none;
    }

    .expand-content {
      padding: 0 16px 16px 16px;
    }

    /* === Modifiers === */

    .table--striped .row--even {
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

    .table--dense .expand-content {
      padding: 0 12px 12px 12px;
    }

    .table--bordered .cell,
    .table--bordered .header-cell {
      border-right: 1px solid var(--reke-color-border, #252525);
    }

    .table--bordered .cell:last-child,
    .table--bordered .header-cell:last-child {
      border-right: none;
    }

    /* === Borderless (for embedding inside cards/containers) === */

    :host([borderless]) .table-container {
      border: none;
      border-radius: 0;
    }
  `,
];
