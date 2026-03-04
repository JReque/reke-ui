import { tailwindStyles } from '../../shared/tailwind-styles.js';
import { css } from 'lit';

export const styles = [
  tailwindStyles,
  css`
    :host {
      display: block;
    }

    :host([disabled]) {
      pointer-events: none;
      opacity: 0.5;
    }

    .dropzone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--reke-space-sm, 12px);
      padding: var(--reke-space-xl, 24px) var(--reke-space-lg, 20px);
      border-radius: var(--reke-radius, 4px);
      border: 1px dashed var(--reke-color-border, #252525);
      background-color: transparent;
      cursor: pointer;
      transition: border-color 0.2s ease, background-color 0.2s ease;
      text-align: center;
    }

    .dropzone:hover {
      border-color: var(--reke-color-text-muted, #525252);
    }

    .dropzone--dragging {
      border-color: var(--reke-color-primary, #22c55e);
      background-color: color-mix(in srgb, var(--reke-color-primary, #22c55e) 5%, transparent);
    }

    .dropzone--error {
      border-color: var(--reke-color-danger, #ef4444);
    }

    .dropzone--compact {
      flex-direction: row;
      padding: var(--reke-space-sm, 12px) var(--reke-space-md, 16px);
    }

    .icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: color-mix(in srgb, var(--reke-color-primary, #22c55e) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--reke-color-primary, #22c55e) 20%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--reke-color-primary, #22c55e);
      font-size: 16px;
      flex-shrink: 0;
    }

    .dropzone--compact .icon {
      width: 28px;
      height: 28px;
      font-size: 14px;
    }

    .text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .text__primary {
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: var(--reke-font-size-xs, 12px);
      font-weight: var(--reke-font-weight-medium, 500);
      color: var(--reke-color-text, #e5e5e5);
    }

    .text__secondary {
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: var(--reke-font-size-2xs, 11px);
      color: var(--reke-color-text-disabled, #3b3b3b);
    }

    .text__file {
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: var(--reke-font-size-xs, 12px);
      font-weight: var(--reke-font-weight-medium, 500);
      color: var(--reke-color-primary, #22c55e);
    }

    .text__error {
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: var(--reke-font-size-2xs, 11px);
      color: var(--reke-color-danger, #ef4444);
    }

    input[type='file'] {
      display: none;
    }
  `,
];
