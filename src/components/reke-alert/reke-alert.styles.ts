import { tailwindStyles } from '../../shared/tailwind-styles.js';
import { css } from 'lit';

export const styles = [
  tailwindStyles,
  css`
    :host {
      display: block;
    }

    .alert {
      display: flex;
      align-items: center;
      gap: var(--reke-space-sm, 12px);
      padding: var(--reke-space-md, 16px) var(--reke-space-lg, 20px);
      border-radius: var(--reke-radius, 4px);
      border: 1px solid transparent;
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: var(--reke-font-size-sm, 13px);
      line-height: 1.5;
      box-sizing: border-box;
    }

    /* === Variants === */

    .alert--success {
      background-color: color-mix(in srgb, var(--reke-color-primary, #22C55E) 6%, transparent);
      border-color: color-mix(in srgb, var(--reke-color-primary, #22C55E) 19%, transparent);
      color: var(--reke-color-primary, #22C55E);
    }

    .alert--error {
      background-color: color-mix(in srgb, var(--reke-color-danger, #EF4444) 6%, transparent);
      border-color: color-mix(in srgb, var(--reke-color-danger, #EF4444) 19%, transparent);
      color: var(--reke-color-danger, #EF4444);
    }

    .alert--warning {
      background-color: color-mix(in srgb, var(--reke-color-warning, #F59E0B) 6%, transparent);
      border-color: color-mix(in srgb, var(--reke-color-warning, #F59E0B) 19%, transparent);
      color: var(--reke-color-warning, #F59E0B);
    }

    .alert--info {
      background-color: color-mix(in srgb, var(--reke-color-secondary, #3B82F6) 6%, transparent);
      border-color: color-mix(in srgb, var(--reke-color-secondary, #3B82F6) 19%, transparent);
      color: var(--reke-color-secondary, #3B82F6);
    }

    /* === Content === */

    .alert__content {
      flex: 1;
      min-width: 0;
    }

    /* === Dismissible === */

    .alert__close {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      background: transparent;
      border: none;
      color: currentColor;
      opacity: 0.5;
      cursor: pointer;
      padding: 0;
      font-size: 16px;
      line-height: 1;
      transition: opacity 0.15s ease;
    }

    .alert__close:hover {
      opacity: 1;
    }

    .alert__close:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
  `,
];
