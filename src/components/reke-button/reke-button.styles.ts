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

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--reke-space-xs, 8px);
      border: 1px solid transparent;
      border-radius: var(--reke-radius, 4px);
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-weight: var(--reke-font-weight-medium, 500);
      cursor: pointer;
      transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
      text-decoration: none;
      line-height: 1;
      white-space: nowrap;
      box-sizing: border-box;
    }

    .button:focus-visible {
      outline: 2px solid var(--reke-color-primary, #22C55E);
      outline-offset: 2px;
    }

    /* === Sizes === */

    .button--xs {
      padding: var(--reke-space-2xs, 6px) var(--reke-space-xs, 8px);
      font-size: var(--reke-font-size-2xs, 11px);
    }

    .button--sm {
      padding: var(--reke-space-xs, 8px) var(--reke-space-md, 16px);
      font-size: var(--reke-font-size-xs, 12px);
    }

    .button--md {
      padding: var(--reke-space-sm, 12px) var(--reke-space-xl, 24px);
      font-size: var(--reke-font-size-sm, 13px);
    }

    .button--lg {
      padding: var(--reke-space-md, 16px) var(--reke-space-2xl, 28px);
      font-size: var(--reke-font-size-md, 14px);
    }

    /* === Variants === */

    .button--primary {
      background-color: var(--reke-color-primary, #22C55E);
      color: var(--reke-color-on-primary, #0A0A0B);
      border-color: var(--reke-color-primary, #22C55E);
    }

    .button--primary:hover {
      background-color: color-mix(in srgb, var(--reke-color-primary, #22C55E) 85%, black);
    }

    .button--secondary {
      background-color: var(--reke-color-surface, #1A1A1A);
      color: var(--reke-color-text, #E5E5E5);
      border-color: var(--reke-color-border, #252525);
    }

    .button--secondary:hover {
      background-color: var(--reke-color-surface-elevated, #151515);
      border-color: var(--reke-color-text-muted, #525252);
    }

    .button--ghost {
      background-color: transparent;
      color: var(--reke-color-text-ghost, #737373);
      border-color: transparent;
    }

    .button--ghost:hover {
      background-color: var(--reke-color-surface, #1A1A1A);
      color: var(--reke-color-text, #E5E5E5);
    }

    .button--danger {
      background-color: var(--reke-color-danger, #EF4444);
      color: #FFFFFF;
      border-color: var(--reke-color-danger, #EF4444);
    }

    .button--danger:hover {
      background-color: color-mix(in srgb, var(--reke-color-danger, #EF4444) 85%, black);
    }

    .button--danger-outline {
      background-color: transparent;
      color: var(--reke-color-danger, #EF4444);
      border-color: var(--reke-color-danger, #EF4444);
    }

    .button--danger-outline:hover {
      background-color: var(--reke-color-danger, #EF4444);
      color: #FFFFFF;
    }

    .button--icon-only {
      background-color: var(--reke-color-surface, #1A1A1A);
      color: var(--reke-color-text, #E5E5E5);
      border-color: var(--reke-color-border, #252525);
    }

    .button--icon-only:hover {
      border-color: var(--reke-color-text-muted, #525252);
    }

    .button--icon-only.button--xs {
      padding: var(--reke-space-2xs, 6px);
    }

    .button--icon-only.button--sm {
      padding: var(--reke-space-xs, 8px);
    }

    .button--icon-only.button--md {
      padding: var(--reke-space-sm, 12px);
    }

    .button--icon-only.button--lg {
      padding: var(--reke-space-md, 16px);
    }

    /* === Loading === */

    .button--loading {
      position: relative;
      color: transparent !important;
      pointer-events: none;
    }

    .spinner {
      display: none;
    }

    .button--loading .spinner {
      display: block;
      position: absolute;
      width: 1em;
      height: 1em;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      color: inherit;
    }

    .button--loading.button--primary .spinner {
      color: var(--reke-color-on-primary, #0A0A0B);
    }

    .button--loading.button--secondary .spinner,
    .button--loading.button--ghost .spinner,
    .button--loading.button--icon-only .spinner {
      color: var(--reke-color-text, #E5E5E5);
    }

    .button--loading.button--danger .spinner {
      color: #FFFFFF;
    }

    .button--loading.button--danger-outline .spinner {
      color: var(--reke-color-danger, #EF4444);
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
];
