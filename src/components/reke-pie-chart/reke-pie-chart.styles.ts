import { css } from 'lit';
import { tailwindStyles } from '../../shared/tailwind-styles.js';

export const styles = [
  tailwindStyles,
  css`
    :host {
      display: block;
      width: 100%;
    }

    .frame {
      position: relative;
      width: 100%;
      height: var(--reke-pie-chart-height, 240px);
    }

    .chart {
      box-sizing: border-box;
      width: 100%;
      height: 100%;
    }

    /* Sits over the donut hole; positioned to match the series center in buildOption(). */
    .center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      max-width: 44%;
      text-align: center;
      pointer-events: none;
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
    }

    .center--legend {
      top: 45%;
    }

    .center-value {
      color: var(--reke-color-text, #E5E5E5);
      font-size: var(--reke-font-size-lg, 18px);
      font-weight: var(--reke-font-weight-semibold, 600);
      line-height: 1.1;
      font-variant-numeric: tabular-nums;
    }

    .center-caption {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--reke-color-text-label, #8A8A8A);
      font-size: var(--reke-font-size-2xs, 11px);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    /* Visually hidden but readable by screen readers — canvas is opaque to AT. */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `,
];
