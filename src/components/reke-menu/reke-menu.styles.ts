import { css } from 'lit';
import { tailwindStyles } from '../../shared/tailwind-styles.js';

export const styles = [
  tailwindStyles,
  css`
    :host {
      display: contents;
    }

    .menu {
      position: fixed;
      z-index: var(--reke-z-menu, 1000);
      min-width: 160px;
      box-sizing: border-box;
      padding: var(--reke-space-2xs, 6px);
      background: var(--reke-color-surface-elevated, #151515);
      border: 1px solid var(--reke-color-border, #252525);
      border-radius: var(--reke-radius, 4px);
      box-shadow: var(--reke-shadow-menu, 0 8px 24px rgba(0, 0, 0, 0.4));
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
  `,
];
