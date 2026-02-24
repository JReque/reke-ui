import { tailwindStyles } from '../../shared/tailwind-styles.js';
import { css } from 'lit';

export const styles = [
  tailwindStyles,
  css`
    :host {
      display: inline-block;
      position: relative;
    }

    .wrapper {
      display: inline-block;
      position: relative;
    }

    .tooltip {
      position: absolute;
      z-index: 1000;
      padding: 6px 12px;
      background-color: var(--reke-color-surface-elevated, #151515);
      color: var(--reke-color-text, #E5E5E5);
      border: 1px solid var(--reke-color-border, #252525);
      border-radius: var(--reke-radius, 4px);
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: var(--reke-font-size-xs, 12px);
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s ease;
    }

    .tooltip--visible {
      opacity: 1;
    }

    .tooltip--top {
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 6px;
    }

    .tooltip--bottom {
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: 6px;
    }

    .tooltip--left {
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-right: 6px;
    }

    .tooltip--right {
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: 6px;
    }
  `,
];
