import { css } from 'lit';
import { tailwindStyles } from '../../shared/tailwind-styles.js';

export const styles = [
  tailwindStyles,
  css`
    :host {
      display: inline-block;
      position: relative;
    }

    :host([disabled]) {
      pointer-events: none;
      opacity: 0.5;
    }

    .label {
      display: block;
      margin-bottom: var(--reke-space-2xs, 6px);
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: var(--reke-font-size-xs, 12px);
      color: var(--reke-color-text-label, #8A8A8A);
    }

    .control {
      display: flex;
      align-items: center;
      position: relative;
    }

    .input {
      width: 100%;
      background: var(--reke-color-input-bg, var(--reke-color-surface, #1A1A1A));
      box-shadow: var(--reke-shadow-input, none);
      color: var(--reke-color-text, #E5E5E5);
      border: 1px solid var(--reke-color-border, #252525);
      border-radius: var(--reke-radius, 4px);
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      cursor: text;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.15s ease;
      padding-right: 28px;
    }

    .input::placeholder {
      color: var(--reke-color-text-muted, #525252);
    }

    .chevron {
      position: absolute;
      right: 10px;
      font-size: 8px;
      color: var(--reke-color-text-muted, #525252);
      pointer-events: none;
      flex-shrink: 0;
    }

    /* Selected summary overlay (multiple, non-tags). Left values match the
       input's left padding per size (.input--sm/md/lg). */
    .selected-summary {
      position: absolute;
      right: 28px; /* chevron room */
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      pointer-events: none;
      color: var(--reke-color-text, #E5E5E5);
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
    }

    .selected-summary--sm {
      left: var(--reke-space-sm, 12px);
      font-size: var(--reke-font-size-xs, 12px);
    }

    .selected-summary--md {
      left: var(--reke-space-md, 16px);
      font-size: var(--reke-font-size-sm, 13px);
    }

    .selected-summary--lg {
      left: var(--reke-space-lg, 20px);
      font-size: var(--reke-font-size-md, 14px);
    }

    /* === Sizes === */

    .input--sm {
      padding: var(--reke-space-xs, 8px) var(--reke-space-sm, 12px);
      font-size: var(--reke-font-size-xs, 12px);
    }

    .input--md {
      padding: var(--reke-space-sm, 12px) var(--reke-space-md, 16px);
      font-size: var(--reke-font-size-sm, 13px);
    }

    .input--lg {
      padding: var(--reke-space-md, 16px) var(--reke-space-lg, 20px);
      font-size: var(--reke-font-size-md, 14px);
    }

    .input:focus-visible {
      border-color: var(--reke-color-primary, #22C55E);
      outline: 2px solid var(--reke-color-primary, #22C55E);
      outline-offset: -1px;
    }

    .input--error {
      border-color: var(--reke-color-danger, #EF4444);
    }

    .input--error:focus-visible {
      border-color: var(--reke-color-danger, #EF4444);
      outline-color: var(--reke-color-danger, #EF4444);
    }

    /* === Dropdown === */

    .dropdown {
      /* Positioned inline as position:fixed by the component so it escapes any
         ancestor overflow:hidden. */
      margin: 0;
      padding: 0;
      list-style: none;
      background-color: var(--reke-color-surface, #1A1A1A);
      border: 1px solid var(--reke-color-border, #252525);
      border-radius: var(--reke-radius, 4px);
      max-height: 240px;
      overflow-y: auto;
      z-index: 100;
      animation: dropdown-in 0.15s ease;
      transform-origin: top;
    }

    @keyframes dropdown-in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .dropdown {
        animation: none;
      }
    }

    /* === Option === */

    .option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: var(--reke-space-xs, 8px) var(--reke-space-md, 16px);
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: var(--reke-font-size-sm, 13px);
      color: var(--reke-color-text, #E5E5E5);
      cursor: pointer;
    }

    .option-img {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .option-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .check {
      flex-shrink: 0;
      color: var(--reke-color-primary, #22C55E);
      font-size: var(--reke-font-size-sm, 13px);
    }

    /* Active follows keyboard/mouse; hover kept for pointer-only devices. */
    .option--active,
    .option:hover {
      background-color: var(--reke-color-surface-elevated, #151515);
    }

    .option--selected {
      color: var(--reke-color-primary, #22C55E);
    }

    .option--flash {
      animation: option-flash var(--reke-animation-flash, 250ms) ease-out;
    }

    .empty {
      padding: var(--reke-space-xs, 8px) var(--reke-space-md, 16px);
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
      font-size: var(--reke-font-size-sm, 13px);
      color: var(--reke-color-text-muted, #525252);
    }

    /* === Chip layout in tags mode === */

    .control--tags {
      flex-wrap: wrap;
      gap: var(--reke-space-2xs, 6px);
      padding: var(--reke-space-xs, 8px) 28px var(--reke-space-xs, 8px) var(--reke-space-xs, 8px);
      background: var(--reke-color-input-bg, var(--reke-color-surface, #1A1A1A));
      border: 1px solid var(--reke-color-border, #252525);
      border-radius: var(--reke-radius, 4px);
      cursor: text;
      transition: border-color 0.15s ease;
    }

    .control--tags:focus-within {
      border-color: var(--reke-color-primary, #22C55E);
      outline: 2px solid var(--reke-color-primary, #22C55E);
      outline-offset: -1px;
    }

    .control--tags.control--error {
      border-color: var(--reke-color-danger, #EF4444);
    }

    .control--tags.control--error:focus-within {
      border-color: var(--reke-color-danger, #EF4444);
      outline-color: var(--reke-color-danger, #EF4444);
    }

    reke-chip {
      flex-shrink: 0;
    }

    reke-chip.chip--scale-in {
      animation: chip-scale-in var(--reke-animation-scale-in, 200ms) ease-out;
    }

    .input--tags {
      flex: 1;
      min-width: 80px;
      width: auto;
      border: none;
      background: transparent;
      box-shadow: none;
      padding-left: 0;
      padding-right: 0;
    }

    .input--tags:focus-visible {
      outline: none;
    }

    /* === Animations === */

    @keyframes option-flash {
      0% {
        background-color: transparent;
      }
      50% {
        background-color: color-mix(in srgb, var(--reke-color-primary, #22C55E) 20%, transparent);
      }
      100% {
        background-color: transparent;
      }
    }

    @keyframes chip-scale-in {
      from {
        opacity: 0;
        transform: scale(0.85);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .option--flash,
      reke-chip.chip--scale-in {
        animation: none;
      }
    }
  `,
];
