import { tailwindStyles } from '../../shared/tailwind-styles.js';
import { css } from 'lit';

export const styles = [
  tailwindStyles,
  css`
    :host {
      display: block;
      animation: toast-in var(--reke-transition-normal, 0.2s ease) both;
    }

    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.97);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--reke-space-sm, 12px);
      padding: 12px 14px;
      border-radius: var(--reke-radius, 4px);
      border: 1px solid var(--reke-color-border, #252525);
      background-color: var(--reke-color-surface, #1A1A1A);
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: var(--reke-font-size-xs, 12px);
      box-sizing: border-box;
      transition:
        opacity var(--reke-transition-normal, 0.2s ease),
        transform var(--reke-transition-normal, 0.2s ease);
      /* left accent stripe */
      border-left-width: 3px;
    }

    .toast--error {
      border-left-color: var(--reke-color-danger, #EF4444);
      background-color: color-mix(in srgb, var(--reke-color-danger, #EF4444) 8%, var(--reke-color-surface, #1A1A1A));
    }

    .toast--success {
      border-left-color: var(--reke-color-primary, #22C55E);
      background-color: color-mix(in srgb, var(--reke-color-primary, #22C55E) 8%, var(--reke-color-surface, #1A1A1A));
    }

    .toast--warning {
      border-left-color: var(--reke-color-warning, #F59E0B);
      background-color: color-mix(in srgb, var(--reke-color-warning, #F59E0B) 8%, var(--reke-color-surface, #1A1A1A));
    }

    .toast--info {
      border-left-color: var(--reke-color-secondary, #3B82F6);
      background-color: color-mix(in srgb, var(--reke-color-secondary, #3B82F6) 8%, var(--reke-color-surface, #1A1A1A));
    }

    /* === Left section === */

    .toast__left {
      display: flex;
      align-items: center;
      gap: var(--reke-space-sm, 12px);
      min-width: 0;
      flex: 1;
    }

    .toast__icon {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toast__icon svg {
      width: 16px;
      height: 16px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .toast--success .toast__icon {
      color: var(--reke-color-primary, #22C55E);
    }

    .toast--error .toast__icon {
      color: var(--reke-color-danger, #EF4444);
    }

    .toast--warning .toast__icon {
      color: var(--reke-color-warning, #F59E0B);
    }

    .toast--info .toast__icon {
      color: var(--reke-color-secondary, #3B82F6);
    }

    .toast__message {
      color: var(--reke-color-text, #E5E5E5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* === Right section === */

    .toast__right {
      display: flex;
      align-items: center;
      gap: var(--reke-space-xs, 8px);
      flex-shrink: 0;
    }

    .toast__action {
      background: transparent;
      border: none;
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: var(--reke-font-size-2xs, 11px);
      font-weight: var(--reke-font-weight-medium, 500);
      cursor: pointer;
      padding: 0;
      transition: opacity 0.15s ease;
    }

    .toast--error .toast__action {
      color: var(--reke-color-danger, #EF4444);
    }

    .toast--success .toast__action {
      color: var(--reke-color-primary, #22C55E);
    }

    .toast--warning .toast__action {
      color: var(--reke-color-warning, #F59E0B);
    }

    .toast--info .toast__action {
      color: var(--reke-color-secondary, #3B82F6);
    }

    .toast__action:hover {
      opacity: 0.8;
    }

    .toast__action:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }

    .toast__close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: transparent;
      border: none;
      color: var(--reke-color-text-muted, #525252);
      cursor: pointer;
      padding: 0;
      font-size: 14px;
      line-height: 1;
      transition: color 0.15s ease;
    }

    .toast__close:hover {
      color: var(--reke-color-text, #E5E5E5);
    }

    .toast__close:focus-visible {
      outline: 2px solid var(--reke-color-primary, #22C55E);
      outline-offset: 2px;
    }
  `,
];
