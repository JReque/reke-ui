import { tailwindStyles } from '../../shared/tailwind-styles.js';
import { css } from 'lit';

export const styles = [
  tailwindStyles,
  css`
    :host {
      display: inline-block;
      position: relative;
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
      color: var(--reke-color-text-label, #8a8a8a);
    }

    .trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      background-color: var(--reke-color-surface, #1a1a1a);
      color: var(--reke-color-text, #e5e5e5);
      border: 1px solid var(--reke-color-border, #252525);
      border-radius: var(--reke-radius, 4px);
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      cursor: pointer;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.15s ease;
    }

    .trigger--placeholder {
      color: var(--reke-color-text-muted, #525252);
    }

    .trigger__chevron {
      font-size: 8px;
      margin-left: 8px;
      flex-shrink: 0;
    }

    /* === Sizes === */

    .trigger--sm {
      padding: var(--reke-space-xs, 8px) var(--reke-space-sm, 12px);
      font-size: var(--reke-font-size-xs, 12px);
    }

    .trigger--md {
      padding: var(--reke-space-sm, 12px) var(--reke-space-md, 16px);
      font-size: var(--reke-font-size-sm, 13px);
    }

    .trigger--lg {
      padding: var(--reke-space-md, 16px) var(--reke-space-lg, 20px);
      font-size: var(--reke-font-size-md, 14px);
    }

    .trigger:focus-visible {
      border-color: var(--reke-color-primary, #22c55e);
      outline: 2px solid var(--reke-color-primary, #22c55e);
      outline-offset: -1px;
    }

    .trigger--error {
      border-color: var(--reke-color-danger, #ef4444);
    }

    .trigger--error:focus-visible {
      border-color: var(--reke-color-danger, #ef4444);
      outline-color: var(--reke-color-danger, #ef4444);
    }

    /* === Dropdown === */

    .dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin: 0;
      margin-top: 4px;
      padding: 0;
      list-style: none;
      background-color: var(--reke-color-surface, #1a1a1a);
      border: 1px solid var(--reke-color-border, #252525);
      border-radius: var(--reke-radius, 4px);
      max-height: 200px;
      overflow-y: auto;
      z-index: 100;
    }

    /* === Option === */

    .option {
      padding: var(--reke-space-xs, 8px) var(--reke-space-md, 16px);
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: var(--reke-font-size-sm, 13px);
      color: var(--reke-color-text, #e5e5e5);
      cursor: pointer;
    }

    .option:hover {
      background-color: var(--reke-color-surface-elevated, #151515);
    }

    .option--selected {
      color: var(--reke-color-primary, #22c55e);
    }
  `,
];
