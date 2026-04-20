import { tailwindStyles } from '../../shared/tailwind-styles.js';
import { css } from 'lit';

export const styles = [
  tailwindStyles,
  css`
    :host {
      display: block;
    }

    .card {
      border-radius: var(--reke-radius, 4px);
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      overflow: hidden;
      transition:
        border-color var(--reke-transition-normal, 0.2s ease),
        box-shadow var(--reke-transition-normal, 0.2s ease),
        transform var(--reke-transition-normal, 0.2s ease);
    }

    /* === Variants === */

    .card--default {
      background: var(--reke-color-surface, #1A1A1A);
      border: 1px solid var(--reke-color-border, #252525);
    }

    .card--elevated {
      background: var(--reke-color-surface, #1A1A1A);
      border: 1px solid var(--reke-color-border, #252525);
      box-shadow: var(--reke-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.3));
    }

    .card--outlined {
      background: transparent;
      border: 1px solid var(--reke-color-border, #252525);
    }

    /* === Interactive hover === */

    .card--interactive {
      cursor: pointer;
    }

    .card--interactive:hover {
      transform: translateY(-2px);
      box-shadow: var(--reke-shadow-lift, 0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2));
      border-color: var(--reke-color-border-hover, #3A3A3A);
    }

    .card--interactive:active {
      transform: translateY(0);
      box-shadow: var(--reke-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.3));
    }

    /* === Accent hover borders === */

    .card--interactive.card--accent-primary:hover {
      border-color: color-mix(in srgb, var(--reke-color-primary, #22C55E) 50%, transparent);
      box-shadow:
        var(--reke-shadow-lift, 0 8px 32px rgba(0, 0, 0, 0.4)),
        var(--reke-shadow-glow-primary, 0 0 20px rgba(34, 197, 94, 0.15));
    }

    .card--interactive.card--accent-secondary:hover {
      border-color: color-mix(in srgb, var(--reke-color-secondary, #3B82F6) 50%, transparent);
      box-shadow:
        var(--reke-shadow-lift, 0 8px 32px rgba(0, 0, 0, 0.4)),
        var(--reke-shadow-glow-secondary, 0 0 20px rgba(59, 130, 246, 0.15));
    }

    .card--interactive.card--accent-danger:hover {
      border-color: color-mix(in srgb, var(--reke-color-danger, #EF4444) 50%, transparent);
      box-shadow:
        var(--reke-shadow-lift, 0 8px 32px rgba(0, 0, 0, 0.4)),
        var(--reke-shadow-glow-danger, 0 0 20px rgba(239, 68, 68, 0.15));
    }

    .card--interactive.card--accent-warning:hover {
      border-color: color-mix(in srgb, var(--reke-color-warning, #F59E0B) 50%, transparent);
      box-shadow:
        var(--reke-shadow-lift, 0 8px 32px rgba(0, 0, 0, 0.4)),
        0 0 20px color-mix(in srgb, var(--reke-color-warning, #F59E0B) 15%, transparent);
    }

    /* === Padding (applied to .card-body) === */

    .card--padding-none .card-body {
      padding: 0;
    }

    .card--padding-sm .card-body {
      padding: 12px;
    }

    .card--padding-md .card-body {
      padding: 16px;
    }

    .card--padding-lg .card-body {
      padding: 24px;
    }

    /* === Header === */

    .card-header {
      border-bottom: 1px solid var(--reke-color-border, #252525);
    }

    .card--padding-none .card-header {
      padding: 0;
    }

    .card--padding-sm .card-header {
      padding: 12px;
    }

    .card--padding-md .card-header {
      padding: 16px;
    }

    .card--padding-lg .card-header {
      padding: 24px;
    }

    /* === Footer === */

    .card-footer {
      border-top: 1px solid var(--reke-color-border, #252525);
    }

    .card--padding-none .card-footer {
      padding: 0;
    }

    .card--padding-sm .card-footer {
      padding: 12px;
    }

    .card--padding-md .card-footer {
      padding: 16px;
    }

    .card--padding-lg .card-footer {
      padding: 24px;
    }
  `,
];
