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

    .toggle {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .toggle:focus-visible .track {
      outline: 2px solid var(--reke-color-primary, #22C55E);
      outline-offset: 2px;
    }

    .track {
      position: relative;
      width: 40px;
      height: 22px;
      border-radius: 11px;
      background-color: var(--reke-color-surface, #1A1A1A);
      border: 1px solid var(--reke-color-border, #252525);
      box-sizing: border-box;
      transition: background-color 0.15s ease, border-color 0.15s ease;
    }

    .track--checked {
      background-color: var(--reke-color-primary, #22C55E);
      border-color: var(--reke-color-primary, #22C55E);
    }

    .thumb {
      position: absolute;
      top: 50%;
      left: 2px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: var(--reke-color-text-muted, #525252);
      transform: translateY(-50%);
      transition: transform 0.15s ease, background-color 0.15s ease;
    }

    .thumb--checked {
      background-color: var(--reke-color-on-primary, #0A0A0B);
      transform: translateX(18px) translateY(-50%);
    }

    .label {
      color: var(--reke-color-text, #E5E5E5);
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: var(--reke-font-size-sm, 13px);
    }
  `,
];
