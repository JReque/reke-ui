import { css } from 'lit';
import { tailwindStyles } from '../../shared/tailwind-styles.js';

export const styles = [
  tailwindStyles,
  css`
    :host {
      display: block;
      width: 100%;
    }

    .track {
      position: relative;
      display: flex;
      width: 100%;
      overflow: hidden;
      height: var(--reke-progress-height, 4px);
      border-radius: var(--reke-progress-radius, 9999px);
      background-color: var(--reke-progress-track-color, #2A2A2A);
    }

    .segment {
      height: 100%;
      background-color: var(--reke-progress-color, #22C55E);
      transition: width var(--reke-transition-normal, 0.2s ease);
    }

    .segment:first-child {
      border-top-left-radius: var(--reke-progress-radius, 9999px);
      border-bottom-left-radius: var(--reke-progress-radius, 9999px);
    }

    .segment:last-child {
      border-top-right-radius: var(--reke-progress-radius, 9999px);
      border-bottom-right-radius: var(--reke-progress-radius, 9999px);
    }

    /* === Indeterminate === */

    .segment--indeterminate {
      position: absolute;
      top: 0;
      left: 0;
      width: 40%;
      border-radius: var(--reke-progress-radius, 9999px);
      transition: none;
      animation: reke-progress-slide 1.4s ease-in-out infinite;
    }

    @keyframes reke-progress-slide {
      from {
        transform: translateX(-100%);
      }
      to {
        transform: translateX(250%);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .segment--indeterminate {
        animation: none;
        width: 100%;
        opacity: 0.6;
      }

      .segment {
        transition: none;
      }
    }
  `,
];
