import { tailwindStyles } from '../../shared/tailwind-styles.js';
import { css } from 'lit';

export const styles = [
  tailwindStyles,
  css`
    :host {
      display: inline-block;
    }

    :host([disabled]) {
      pointer-events: none;
      opacity: 0.5;
    }

    .label {
      display: block;
      margin-bottom: var(--reke-space-2xs, 6px);
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: var(--reke-font-size-xs, 12px);
      color: var(--reke-color-text-label, #8A8A8A);
    }

    .input {
      display: block;
      width: 100%;
      background-color: var(--reke-color-surface, #1A1A1A);
      color: var(--reke-color-text, #E5E5E5);
      border: 1px solid var(--reke-color-border, #252525);
      border-radius: var(--reke-radius, 4px);
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.15s ease;
    }

    .input::placeholder {
      color: var(--reke-color-text-muted, #525252);
    }

    .input:focus-visible {
      border-color: var(--reke-color-primary, #22C55E);
      outline: 2px solid var(--reke-color-primary, #22C55E);
      outline-offset: -1px;
    }

    .input--error {
      border-color: var(--reke-color-danger, #EF4444);
    }

    .input--error:focus-visible {
      border-color: var(--reke-color-danger, #EF4444);
      outline-color: var(--reke-color-danger, #EF4444);
    }

    /* === Sizes === */

    .input--xs {
      padding: var(--reke-space-2xs, 6px) var(--reke-space-xs, 8px);
      font-size: var(--reke-font-size-2xs, 11px);
    }

    .input--sm {
      padding: var(--reke-space-xs, 8px) var(--reke-space-sm, 12px);
      font-size: var(--reke-font-size-xs, 12px);
    }

    .input--md {
      padding: var(--reke-space-sm, 12px) var(--reke-space-md, 16px);
      font-size: var(--reke-font-size-sm, 13px);
    }

    .input--lg {
      padding: var(--reke-space-md, 16px) var(--reke-space-lg, 20px);
      font-size: var(--reke-font-size-md, 14px);
    }
  `,
];
