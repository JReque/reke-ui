import { tailwindStyles } from '../../shared/tailwind-styles.js';
import { css } from 'lit';

export const styles = [
  tailwindStyles,
  css`
    :host {
      display: block;
    }

    /* === Backdrop === */

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .backdrop--drawer {
      align-items: stretch;
    }

    .backdrop--right {
      justify-content: flex-end;
    }

    .backdrop--left {
      justify-content: flex-start;
    }

    /* === Modal === */

    .dialog {
      background: var(--reke-color-bg, #0f0f10);
      border: 1px solid var(--reke-color-border, #252525);
      border-radius: var(--reke-radius, 4px);
      min-width: 400px;
      max-width: 560px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
      font-family: var(
        --reke-font-mono,
        'JetBrains Mono',
        ui-monospace,
        monospace
      );
    }

    /* === Drawer === */

    .drawer {
      background: var(--reke-color-bg, #0f0f10);
      width: 400px;
      max-width: 90vw;
      height: 100%;
      overflow-y: auto;
      font-family: var(
        --reke-font-mono,
        'JetBrains Mono',
        ui-monospace,
        monospace
      );
      display: flex;
      flex-direction: column;
    }

    .drawer--right {
      border-left: 1px solid var(--reke-color-border, #252525);
    }

    .drawer--left {
      border-right: 1px solid var(--reke-color-border, #252525);
    }

    /* === Shared parts === */

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--reke-color-border, #252525);
      flex-shrink: 0;
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

    .close-btn:focus-visible {
      outline: 2px solid var(--reke-color-primary, #22C55E);
      outline-offset: 2px;
    }

    .dialog-body {
      padding: 20px;
      flex: 1;
      overflow-y: auto;
    }

    .dialog-footer {
      padding: 12px 20px;
      border-top: 1px solid var(--reke-color-border, #252525);
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      flex-shrink: 0;
    }
  `,
];
