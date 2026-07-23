import { css } from 'lit';
import { tailwindStyles } from '../../shared/tailwind-styles.js';

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

    /* === Field box (draws border/background/focus) === */

    .field {
      display: flex;
      align-items: center;
      gap: var(--reke-space-2xs, 6px);
      width: 100%;
      background: var(--reke-color-input-bg, var(--reke-color-surface, #1A1A1A));
      box-shadow: var(--reke-shadow-input, none);
      border: 1px solid var(--reke-color-border, #252525);
      border-radius: var(--reke-radius, 4px);
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      box-sizing: border-box;
      transition: border-color 0.15s ease;
    }

    .field:focus-within {
      border-color: var(--reke-color-primary, #22C55E);
      outline: 2px solid var(--reke-color-primary, #22C55E);
      outline-offset: -1px;
    }

    .field--error {
      border-color: var(--reke-color-danger, #EF4444);
    }

    .field--error:focus-within {
      border-color: var(--reke-color-danger, #EF4444);
      outline-color: var(--reke-color-danger, #EF4444);
    }

    /* Empty slots must not create flex gaps */
    slot[name='prefix'],
    slot[name='suffix'] {
      display: contents;
    }

    ::slotted([slot='prefix']),
    ::slotted([slot='suffix']) {
      flex: 0 0 auto;
      color: var(--reke-color-text-muted, #525252);
      white-space: nowrap;
      user-select: none;
    }

    .input {
      flex: 1 1 auto;
      min-width: 0;
      background: transparent;
      color: var(--reke-color-text, #E5E5E5);
      border: none;
      outline: none;
      padding: 0;
      font-family: inherit;
      font-size: inherit;
    }

    .input::placeholder {
      color: var(--reke-color-text-muted, #525252);
    }

    /* === Sizes (padding + font-size live on the box) === */

    .field--xs {
      padding: var(--reke-space-2xs, 6px) var(--reke-space-xs, 8px);
      font-size: var(--reke-font-size-2xs, 11px);
    }

    .field--sm {
      padding: var(--reke-space-xs, 8px) var(--reke-space-sm, 12px);
      font-size: var(--reke-font-size-xs, 12px);
    }

    .field--md {
      padding: var(--reke-space-sm, 12px) var(--reke-space-md, 16px);
      font-size: var(--reke-font-size-sm, 13px);
    }

    .field--lg {
      padding: var(--reke-space-md, 16px) var(--reke-space-lg, 20px);
      font-size: var(--reke-font-size-md, 14px);
    }
  `,
];
