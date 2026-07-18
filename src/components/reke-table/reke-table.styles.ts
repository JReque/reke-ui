import { css } from 'lit';
import { tailwindStyles } from '../../shared/tailwind-styles.js';

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

    /* === Expand toggle column (opt-in via expandable prop) === */

    .expand-toggle-header-cell {
      width: 40px;
      padding: 12px 8px;
      border-bottom: 1px solid var(--reke-color-border, #252525);
      background: var(--reke-color-surface, #1A1A1A);
    }

    .expand-toggle-cell {
      width: 40px;
      padding: 8px 4px 8px 8px;
      text-align: center;
      vertical-align: middle;
    }

    .expand-toggle-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      padding: 0;
      background: transparent;
      border: none;
      border-radius: var(--reke-radius, 4px);
      color: var(--reke-color-text-muted, #525252);
      cursor: pointer;
      font: inherit;
      line-height: 1;
    }

    .expand-toggle-button:hover {
      color: var(--reke-color-text, #E5E5E5);
      background: color-mix(in srgb, var(--reke-color-surface, #1A1A1A) 75%, var(--reke-color-border, #252525));
    }

    .expand-toggle-button:focus-visible {
      outline: 2px solid var(--reke-color-primary, #22C55E);
      outline-offset: 2px;
    }

    .expand-toggle-chevron {
      display: inline-block;
      font-size: 10px;
      transition: transform 120ms ease;
      transform: rotate(0deg);
    }

    .expand-toggle-button--expanded .expand-toggle-chevron {
      transform: rotate(90deg);
    }

    .table--dense .expand-toggle-header-cell {
      padding: 8px 6px;
    }

    .table--dense .expand-toggle-cell {
      padding: 4px 4px 4px 6px;
    }

    /* === Expanded row === */

    /* NOTE: the tr/td keep native table display so colspan spans the full
       table width. The collapse animation lives on .expand-inner only —
       putting display:grid on the tr breaks colspan and shrinks the cell to
       content width. */
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

    .expand-row--collapsed .expand-content {
      padding-top: 0;
      padding-bottom: 0;
    }

    /* Grid-rows reveal. The animated track lives on .expand-grid; the SINGLE
       real grid item (.expand-inner) carries overflow:hidden + min-height:0 so
       0fr actually clips it to zero. The content host uses display:contents, so
       it must NOT be the grid item — .expand-inner is. */
    .expand-grid {
      display: grid;
      grid-template-rows: 1fr;
      transition: grid-template-rows 200ms ease;
    }

    .expand-row--collapsed .expand-grid {
      grid-template-rows: 0fr;
    }

    .expand-inner {
      overflow: hidden;
      min-height: 0;
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
