import { tailwindStyles } from '../../shared/tailwind-styles.js';
import { css } from 'lit';

export const styles = [
  tailwindStyles,
  css`
    :host {
      display: inline-block;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-weight: var(--reke-font-weight-medium, 500);
      border-radius: 9999px;
      border: 1px solid transparent;
      line-height: 1;
      white-space: nowrap;
      box-sizing: border-box;
    }

    /* === Sizes === */

    .badge--sm {
      padding: 2px 8px;
      font-size: 11px;
    }

    .badge--md {
      padding: 4px 12px;
      font-size: 12px;
    }

    /* === Variants === */

    .badge--default {
      background-color: var(--reke-color-surface, #1A1A1A);
      color: var(--reke-color-text, #E5E5E5);
      border-color: var(--reke-color-border, #252525);
    }

    .badge--primary {
      background-color: color-mix(in srgb, var(--reke-color-primary, #22C55E) 15%, transparent);
      color: var(--reke-color-primary, #22C55E);
      border-color: color-mix(in srgb, var(--reke-color-primary, #22C55E) 30%, transparent);
    }

    .badge--secondary {
      background-color: color-mix(in srgb, var(--reke-color-secondary, #3B82F6) 15%, transparent);
      color: var(--reke-color-secondary, #3B82F6);
      border-color: color-mix(in srgb, var(--reke-color-secondary, #3B82F6) 30%, transparent);
    }

    .badge--danger {
      background-color: color-mix(in srgb, var(--reke-color-danger, #EF4444) 15%, transparent);
      color: var(--reke-color-danger, #EF4444);
      border-color: color-mix(in srgb, var(--reke-color-danger, #EF4444) 30%, transparent);
    }

    .badge--warning {
      background-color: color-mix(in srgb, var(--reke-color-warning, #F59E0B) 15%, transparent);
      color: var(--reke-color-warning, #F59E0B);
      border-color: color-mix(in srgb, var(--reke-color-warning, #F59E0B) 30%, transparent);
    }

    .badge--success {
      background-color: color-mix(in srgb, var(--reke-color-primary, #22C55E) 15%, transparent);
      color: var(--reke-color-primary, #22C55E);
      border-color: color-mix(in srgb, var(--reke-color-primary, #22C55E) 30%, transparent);
    }
  `,
];
