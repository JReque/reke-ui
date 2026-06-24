import { css } from 'lit';
import { tailwindStyles } from '../../shared/tailwind-styles.js';

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
      padding: 12px var(--reke-space-md, 16px);
      border-radius: var(--reke-radius, 4px);
      border: none;
      border-left: 3px solid;
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: var(--reke-font-size-xs, 12px);
      line-height: 1.5;
      box-sizing: border-box;
    }

    /* === Variants === */

    .alert--success {
      background-color: color-mix(in srgb, var(--reke-color-primary, #22C55E) 10%, transparent);
      border-color: var(--reke-color-primary, #22C55E);
      color: var(--reke-color-primary, #22C55E);
    }

    .alert--error {
      background-color: color-mix(in srgb, var(--reke-color-danger, #EF4444) 10%, transparent);
      border-color: var(--reke-color-danger, #EF4444);
      color: var(--reke-color-danger, #EF4444);
    }

    .alert--warning {
      background-color: color-mix(in srgb, var(--reke-color-warning, #F59E0B) 10%, transparent);
      border-color: var(--reke-color-warning, #F59E0B);
      color: var(--reke-color-warning, #F59E0B);
    }

    .alert--info {
      background-color: color-mix(in srgb, var(--reke-color-secondary, #3B82F6) 10%, transparent);
      border-color: var(--reke-color-secondary, #3B82F6);
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

    /* === Enter animation === */

    :host {
      animation: alert-in var(--reke-transition-normal, 0.2s ease) both;
    }

    @keyframes alert-in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
];
