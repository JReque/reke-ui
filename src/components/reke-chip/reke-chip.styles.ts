import { tailwindStyles } from '../../shared/tailwind-styles.js';
import { css } from 'lit';

export const styles = [
  tailwindStyles,
  css`
    :host {
      display: inline-block;
    }

    :host([disabled]) {
      pointer-events: none;
      opacity: 0.5;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: var(--reke-font-size-2xs, 11px);
      font-weight: var(--reke-font-weight-medium, 500);
      line-height: 1.4;
      border: 1px solid var(--reke-color-border-subtle, #1F1F1F);
      border-radius: var(--reke-radius, 4px);
      background: transparent;
      color: var(--reke-color-text-muted, #525252);
      cursor: pointer;
      transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
      box-sizing: border-box;
      white-space: nowrap;
    }

    .chip:focus-visible {
      outline: 2px solid var(--reke-color-primary, #22C55E);
      outline-offset: 2px;
    }

    .chip:hover:not(:disabled) {
      color: var(--reke-color-text, #E5E5E5);
      border-color: var(--reke-color-border, #252525);
    }

    /* === Active states by color === */

    .chip--primary.chip--active {
      border-color: var(--reke-color-primary, #22C55E);
      background: color-mix(in srgb, var(--reke-color-primary, #22C55E) 10%, black);
      color: var(--reke-color-primary, #22C55E);
    }

    .chip--secondary.chip--active {
      border-color: var(--reke-color-secondary, #3B82F6);
      background: color-mix(in srgb, var(--reke-color-secondary, #3B82F6) 10%, black);
      color: var(--reke-color-secondary, #3B82F6);
    }

    .chip--danger.chip--active {
      border-color: var(--reke-color-danger, #EF4444);
      background: color-mix(in srgb, var(--reke-color-danger, #EF4444) 10%, black);
      color: var(--reke-color-danger, #EF4444);
    }

    .chip--warning.chip--active {
      border-color: var(--reke-color-warning, #F59E0B);
      background: color-mix(in srgb, var(--reke-color-warning, #F59E0B) 10%, black);
      color: var(--reke-color-warning, #F59E0B);
    }

    /* === Dismiss button === */

    .chip__dismiss {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 12px;
      height: 12px;
      border-radius: 2px;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.15s ease;
    }

    .chip__dismiss:hover {
      opacity: 1;
    }

    .chip__dismiss svg {
      width: 10px;
      height: 10px;
      stroke: currentColor;
      stroke-width: 2.5;
      stroke-linecap: round;
      fill: none;
    }
  `,
];
