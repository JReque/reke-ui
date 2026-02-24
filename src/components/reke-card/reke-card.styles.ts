import { tailwindStyles } from '../../shared/tailwind-styles.js';
import { css } from 'lit';

export const styles = [
  tailwindStyles,
  css`
    :host {
      display: block;
    }

    .card {
      border-radius: var(--reke-radius, 4px);
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      overflow: hidden;
    }

    /* === Variants === */

    .card--default {
      background: var(--reke-color-surface, #1A1A1A);
      border: 1px solid var(--reke-color-border, #252525);
    }

    .card--elevated {
      background: var(--reke-color-surface, #1A1A1A);
      border: 1px solid var(--reke-color-border, #252525);
      box-shadow: var(--reke-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.3));
    }

    .card--outlined {
      background: transparent;
      border: 1px solid var(--reke-color-border, #252525);
    }

    /* === Padding (applied to .card-body) === */

    .card--padding-none .card-body {
      padding: 0;
    }

    .card--padding-sm .card-body {
      padding: 12px;
    }

    .card--padding-md .card-body {
      padding: 16px;
    }

    .card--padding-lg .card-body {
      padding: 24px;
    }

    /* === Header === */

    .card-header {
      border-bottom: 1px solid var(--reke-color-border, #252525);
    }

    .card--padding-none .card-header {
      padding: 0;
    }

    .card--padding-sm .card-header {
      padding: 12px;
    }

    .card--padding-md .card-header {
      padding: 16px;
    }

    .card--padding-lg .card-header {
      padding: 24px;
    }

    /* === Footer === */

    .card-footer {
      border-top: 1px solid var(--reke-color-border, #252525);
    }

    .card--padding-none .card-footer {
      padding: 0;
    }

    .card--padding-sm .card-footer {
      padding: 12px;
    }

    .card--padding-md .card-footer {
      padding: 16px;
    }

    .card--padding-lg .card-footer {
      padding: 24px;
    }
  `,
];
