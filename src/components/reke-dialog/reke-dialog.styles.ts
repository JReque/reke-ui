import { tailwindStyles } from '../../shared/tailwind-styles.js';
import { css } from 'lit';

export const styles = [
  tailwindStyles,
  css`
    :host {
      display: block;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog {
      background: var(--reke-color-bg, #0F0F10);
      border: 1px solid var(--reke-color-border, #252525);
      border-radius: var(--reke-radius, 4px);
      min-width: 400px;
      max-width: 560px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--reke-color-border, #252525);
    }

    .dialog-title {
      margin: 0;
      font-size: var(--reke-font-size-md, 14px);
      font-weight: var(--reke-font-weight-semibold, 600);
      color: var(--reke-color-text, #E5E5E5);
    }

    .close-btn {
      background: transparent;
      border: none;
      color: var(--reke-color-text-muted, #525252);
      cursor: pointer;
      font-size: 20px;
      padding: 4px 8px;
      line-height: 1;
    }

    .close-btn:hover {
      color: var(--reke-color-text, #E5E5E5);
    }

    .dialog-body {
      padding: 20px;
    }

    .dialog-footer {
      padding: 12px 20px;
      border-top: 1px solid var(--reke-color-border, #252525);
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  `,
];
