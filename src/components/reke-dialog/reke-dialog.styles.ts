import { css } from 'lit';
import { tailwindStyles } from '../../shared/tailwind-styles.js';

export const styles = [
  tailwindStyles,
  css`
    :host {
      display: block;
    }

    /* === Motion ===
       Enter and exit are separate animations rather than a transition: the
       panel is only in the DOM while open or closing, so there is no resting
       state to transition from. The is-closing class comes from the
       component, which keeps the panel mounted until the exit ends. */

    @keyframes reke-backdrop-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes reke-backdrop-out {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    @keyframes reke-dialog-in {
      from { opacity: 0; transform: translateY(8px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes reke-dialog-out {
      from { opacity: 1; transform: translateY(0) scale(1); }
      to { opacity: 0; transform: translateY(8px) scale(0.98); }
    }

    @keyframes reke-drawer-in-right {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    @keyframes reke-drawer-out-right {
      from { transform: translateX(0); }
      to { transform: translateX(100%); }
    }

    @keyframes reke-drawer-in-left {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }

    @keyframes reke-drawer-out-left {
      from { transform: translateX(0); }
      to { transform: translateX(-100%); }
    }

    /* === Backdrop === */

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: reke-backdrop-in 200ms ease-out both;
    }

    .backdrop.is-closing {
      animation: reke-backdrop-out 180ms ease-in both;
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
      border-radius: 6px;
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
      animation: reke-dialog-in 200ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .dialog.is-closing {
      animation: reke-dialog-out 160ms ease-in both;
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
      animation: reke-drawer-in-right 260ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .drawer--right.is-closing {
      animation: reke-drawer-out-right 200ms ease-in both;
    }

    .drawer--left {
      border-right: 1px solid var(--reke-color-border, #252525);
      animation: reke-drawer-in-left 260ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .drawer--left.is-closing {
      animation: reke-drawer-out-left 200ms ease-in both;
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

    /* === Small screens ===
       A 400px drawer on a phone leaves a dead strip of backdrop beside it and
       squeezes the content. Below 480px both variants go full-bleed. */

    @media (max-width: 480px) {
      .drawer {
        width: 100%;
        max-width: 100%;
      }

      .dialog {
        min-width: 0;
        width: calc(100% - 32px);
      }
    }

    /* The component also skips the closing state under this preference, so the
       panel unmounts at once instead of sitting still for the exit duration. */
    @media (prefers-reduced-motion: reduce) {
      .backdrop,
      .backdrop.is-closing,
      .dialog,
      .dialog.is-closing,
      .drawer--right,
      .drawer--right.is-closing,
      .drawer--left,
      .drawer--left.is-closing {
        animation: none;
      }
    }
  `,
];
