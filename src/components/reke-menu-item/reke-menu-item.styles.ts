import { css } from 'lit';
import { tailwindStyles } from '../../shared/tailwind-styles.js';

export const styles = [
  tailwindStyles,
  css`
    :host {
      display: block;
    }

    .item {
      display: flex;
      align-items: center;
      gap: var(--reke-space-xs, 8px);
      width: 100%;
      box-sizing: border-box;
      padding: var(--reke-space-xs, 8px) var(--reke-space-sm, 12px);
      background: transparent;
      border: none;
      border-radius: var(--reke-radius, 4px);
      color: var(--reke-color-text, #E5E5E5);
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: var(--reke-font-size-sm, 13px);
      text-align: left;
      cursor: pointer;
      outline: none;
      transition: background-color 0.12s ease;
    }

    .item:hover,
    .item:focus-visible {
      background: var(--reke-color-surface-elevated, #151515);
    }

    .item:focus-visible {
      outline: 2px solid var(--reke-color-primary, #22C55E);
      outline-offset: -2px;
    }

    .item--danger {
      color: var(--reke-color-danger, #EF4444);
    }

    .item[disabled] {
      opacity: 0.4;
      cursor: not-allowed;
    }

    ::slotted([slot='prefix']) {
      display: inline-flex;
      flex: 0 0 auto;
    }
  `,
];
