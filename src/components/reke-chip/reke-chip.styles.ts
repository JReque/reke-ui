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
      padding: 4px 10px;
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: var(--reke-font-size-xs, 12px);
      font-weight: var(--reke-font-weight-medium, 500);
      line-height: 1.4;
      border: 1px solid var(--reke-color-border-subtle, #1F1F1F);
      border-radius: var(--reke-radius, 4px);
      background: transparent;
      color: var(--reke-color-text-ghost, #7A7A7A);
      cursor: pointer;
      transition:
        background-color var(--reke-transition-fast, 0.12s ease),
        border-color var(--reke-transition-fast, 0.12s ease),
        color var(--reke-transition-fast, 0.12s ease),
        box-shadow var(--reke-transition-normal, 0.2s ease);
      box-sizing: border-box;
      white-space: nowrap;
    }

    .chip:focus-visible {
      outline: 2px solid var(--reke-color-primary, #22C55E);
      outline-offset: 2px;
    }

    .chip:hover:not(:disabled) {
      color: var(--reke-color-text, #E5E5E5);
      border-color: var(--reke-color-border-hover, #3A3A3A);
      background: var(--reke-color-surface-hover, #202020);
    }

    /* === Active states by color === */

    .chip--primary.chip--active {
      border-color: color-mix(in srgb, var(--reke-color-primary, #22C55E) 60%, transparent);
      background: color-mix(in srgb, var(--reke-color-primary, #22C55E) 12%, transparent);
      color: var(--reke-color-primary, #22C55E);
    }

    .chip--primary.chip--active:hover:not(:disabled) {
      background: color-mix(in srgb, var(--reke-color-primary, #22C55E) 18%, transparent);
      box-shadow: 0 0 12px color-mix(in srgb, var(--reke-color-primary, #22C55E) 20%, transparent);
    }

    .chip--secondary.chip--active {
      border-color: color-mix(in srgb, var(--reke-color-secondary, #3B82F6) 60%, transparent);
      background: color-mix(in srgb, var(--reke-color-secondary, #3B82F6) 12%, transparent);
      color: var(--reke-color-secondary, #3B82F6);
    }

    .chip--secondary.chip--active:hover:not(:disabled) {
      background: color-mix(in srgb, var(--reke-color-secondary, #3B82F6) 18%, transparent);
      box-shadow: 0 0 12px color-mix(in srgb, var(--reke-color-secondary, #3B82F6) 20%, transparent);
    }

    .chip--danger.chip--active {
      border-color: color-mix(in srgb, var(--reke-color-danger, #EF4444) 60%, transparent);
      background: color-mix(in srgb, var(--reke-color-danger, #EF4444) 12%, transparent);
      color: var(--reke-color-danger, #EF4444);
    }

    .chip--danger.chip--active:hover:not(:disabled) {
      background: color-mix(in srgb, var(--reke-color-danger, #EF4444) 18%, transparent);
      box-shadow: 0 0 12px color-mix(in srgb, var(--reke-color-danger, #EF4444) 20%, transparent);
    }

    .chip--warning.chip--active {
      border-color: color-mix(in srgb, var(--reke-color-warning, #F59E0B) 60%, transparent);
      background: color-mix(in srgb, var(--reke-color-warning, #F59E0B) 12%, transparent);
      color: var(--reke-color-warning, #F59E0B);
    }

    .chip--warning.chip--active:hover:not(:disabled) {
      background: color-mix(in srgb, var(--reke-color-warning, #F59E0B) 18%, transparent);
      box-shadow: 0 0 12px color-mix(in srgb, var(--reke-color-warning, #F59E0B) 20%, transparent);
    }

    /* === Dismiss button === */

    .chip__dismiss {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border-radius: 2px;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.15s ease;
    }

    .chip__dismiss:hover {
      opacity: 1;
    }

    .chip__dismiss:focus-visible {
      outline: 2px solid var(--reke-color-primary, #22C55E);
      outline-offset: 1px;
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
