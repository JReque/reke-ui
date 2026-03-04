import { tailwindStyles } from '../../shared/tailwind-styles.js';
import { css } from 'lit';

export const styles = [
  tailwindStyles,
  css`
    :host {
      display: inline-block;
      position: relative;
      font-family: var(--reke-font-mono, 'JetBrains Mono', ui-monospace, monospace);
    }

    :host([disabled]) {
      pointer-events: none;
      opacity: 0.5;
    }

    /* === Label === */

    .label {
      display: block;
      margin-bottom: 6px;
      font-size: 12px;
      color: var(--reke-color-text-ghost, #737373);
      transition: color 0.15s ease;
    }

    .label--active {
      color: var(--reke-color-primary, #22C55E);
    }

    /* === Trigger === */

    .trigger {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: var(--reke-color-surface, #1A1A1A);
      border: 1px solid var(--reke-color-border, #252525);
      border-radius: var(--reke-radius, 4px);
      color: var(--reke-color-text, #E5E5E5);
      font-family: inherit;
      font-size: 13px;
      cursor: pointer;
      transition: border-color 0.15s ease;
      min-width: 200px;
      box-sizing: border-box;
    }

    .trigger:hover {
      border-color: var(--reke-color-text-muted, #525252);
    }

    .trigger--open {
      border-color: var(--reke-color-primary, #22C55E);
    }

    .trigger--error {
      border-color: var(--reke-color-danger, #EF4444);
    }

    .trigger--placeholder {
      color: var(--reke-color-text-muted, #525252);
    }

    .trigger__icon {
      display: inline-flex;
      width: 16px;
      height: 16px;
      color: var(--reke-color-text-muted, #525252);
      transition: color 0.15s ease;
    }

    .trigger--open .trigger__icon {
      color: var(--reke-color-primary, #22C55E);
    }

    .trigger__icon svg {
      width: 16px;
      height: 16px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .trigger__text {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .trigger__separator {
      color: var(--reke-color-text-disabled, #3B3B3B);
    }

    .trigger__chevron {
      display: inline-flex;
      width: 16px;
      height: 16px;
      color: var(--reke-color-text-muted, #525252);
      transition: transform 0.15s ease, color 0.15s ease;
    }

    .trigger--open .trigger__chevron {
      transform: rotate(180deg);
      color: var(--reke-color-primary, #22C55E);
    }

    .trigger__chevron svg {
      width: 16px;
      height: 16px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    /* === Calendar dropdown === */

    .calendar {
      position: absolute;
      top: 100%;
      left: 0;
      z-index: 50;
      margin-top: 4px;
      padding: 16px;
      background: var(--reke-color-surface, #1A1A1A);
      border: 1px solid var(--reke-color-border, #252525);
      border-radius: 8px;
      box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.6);
      min-width: 280px;
    }

    /* === Calendar header (month/year + nav) === */

    .calendar__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .calendar__title {
      font-size: 12px;
      font-weight: 600;
      color: var(--reke-color-text, #E5E5E5);
    }

    .calendar__nav {
      display: flex;
      gap: 4px;
    }

    .calendar__nav-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      padding: 0;
      border: none;
      border-radius: var(--reke-radius, 4px);
      background: transparent;
      color: var(--reke-color-text-muted, #525252);
      cursor: pointer;
      font-family: inherit;
    }

    .calendar__nav-btn:hover {
      color: var(--reke-color-text, #E5E5E5);
      background: color-mix(in srgb, var(--reke-color-surface, #1A1A1A) 75%, var(--reke-color-border, #252525));
    }

    .calendar__nav-btn svg {
      width: 14px;
      height: 14px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    /* === Weekday header === */

    .calendar__weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      margin-bottom: 4px;
    }

    .calendar__weekday {
      text-align: center;
      font-size: 9px;
      font-weight: 600;
      color: var(--reke-color-text-disabled, #3B3B3B);
      padding: 4px 0;
      text-transform: uppercase;
    }

    /* === Day grid === */

    .calendar__grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
    }

    .calendar__day {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 28px;
      font-size: 11px;
      border: none;
      border-radius: var(--reke-radius, 4px);
      background: transparent;
      color: var(--reke-color-text, #E5E5E5);
      cursor: pointer;
      padding: 0;
      font-family: inherit;
      transition: background-color 0.1s ease;
    }

    .calendar__day:hover {
      background: color-mix(in srgb, var(--reke-color-surface, #1A1A1A) 70%, var(--reke-color-border, #252525));
    }

    .calendar__day--other {
      color: var(--reke-color-text-disabled, #3B3B3B);
    }

    .calendar__day--today {
      font-weight: 600;
      color: var(--reke-color-primary, #22C55E);
    }

    .calendar__day--selected {
      background: var(--reke-color-primary, #22C55E);
      color: var(--reke-color-on-primary, #0A0A0B);
      font-weight: 600;
      border-radius: 14px;
    }

    .calendar__day--selected:hover {
      background: color-mix(in srgb, var(--reke-color-primary, #22C55E) 85%, black);
    }

    .calendar__day--in-range {
      background: color-mix(in srgb, var(--reke-color-primary, #22C55E) 10%, transparent);
      border-radius: var(--reke-radius, 4px);
    }

    .calendar__day--range-start {
      background: var(--reke-color-primary, #22C55E);
      color: var(--reke-color-on-primary, #0A0A0B);
      font-weight: 600;
      border-radius: 14px 4px 4px 14px;
    }

    .calendar__day--range-end {
      background: var(--reke-color-primary, #22C55E);
      color: var(--reke-color-on-primary, #0A0A0B);
      font-weight: 600;
      border-radius: 4px 14px 14px 4px;
    }

    .calendar__day--range-start.calendar__day--range-end {
      border-radius: 14px;
    }

    .calendar__day--disabled {
      color: var(--reke-color-text-disabled, #3B3B3B);
      cursor: default;
      pointer-events: none;
    }

    /* === Calendar footer === */

    .calendar__footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      padding-top: 8px;
    }

    .calendar__action {
      font-family: inherit;
      font-size: 11px;
      font-weight: 600;
      border: none;
      background: none;
      cursor: pointer;
      padding: 0;
    }

    .calendar__action--today {
      color: var(--reke-color-primary, #22C55E);
    }

    .calendar__action--today:hover {
      text-decoration: underline;
    }

    .calendar__action--clear {
      color: var(--reke-color-text-muted, #525252);
      font-weight: 400;
    }

    .calendar__action--clear:hover {
      color: var(--reke-color-text, #E5E5E5);
    }
  `,
];
