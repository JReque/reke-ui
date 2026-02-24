import { tailwindStyles } from '../../shared/tailwind-styles.js';
import { css } from 'lit';

export const styles = [
  tailwindStyles,
  css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    :host([disabled]) {
      pointer-events: none;
      opacity: 0.5;
    }

    .container {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      outline: none;
    }

    .native-input {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .box {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      min-width: 16px;
      min-height: 16px;
      background-color: var(--reke-color-surface, #1A1A1A);
      border: 1px solid var(--reke-color-border, #252525);
      border-radius: 3px;
      box-sizing: border-box;
      transition: background-color 0.15s ease, border-color 0.15s ease;
    }

    .box--checked,
    .box--indeterminate {
      background-color: var(--reke-color-primary, #22C55E);
      border-color: var(--reke-color-primary, #22C55E);
    }

    .container:focus-visible .box {
      outline: 2px solid var(--reke-color-primary, #22C55E);
      outline-offset: 2px;
    }

    .checkmark,
    .indeterminate-mark {
      width: 12px;
      height: 12px;
      color: var(--reke-color-on-primary, #0A0A0B);
    }

    .label {
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: var(--reke-font-size-sm, 13px);
      color: var(--reke-color-text, #E5E5E5);
      user-select: none;
    }
  `,
];
