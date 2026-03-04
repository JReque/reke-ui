import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-alert.styles.js';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

/**
 * @tag reke-alert
 * @summary An inline alert with color variants. Content via default slot.
 *
 * @slot - Default slot for alert content (icon + text, or just text).
 *
 * @fires reke-close - Fired when the alert is dismissed (only when dismissible).
 *
 * @csspart alert - The outer alert container.
 *
 * @cssprop [--reke-color-primary=#22C55E] - Success variant color.
 * @cssprop [--reke-color-danger=#EF4444] - Error variant color.
 * @cssprop [--reke-color-warning=#F59E0B] - Warning variant color.
 * @cssprop [--reke-color-secondary=#3B82F6] - Info variant color.
 * @cssprop [--reke-radius=4px] - Alert border radius.
 */
@customElement('reke-alert')
export class RekeAlert extends RekeElement {
  static override styles = styles;

  @property({ reflect: true })
  variant: AlertVariant = 'info';

  @property({ type: Boolean, reflect: true })
  dismissible = false;

  private handleClose() {
    this.emit('reke-close');
    this.remove();
  }

  override render() {
    const classes = {
      alert: true,
      [`alert--${this.variant}`]: true,
    };

    return html`
      <div part="alert" class=${classMap(classes)} role="alert">
        <span class="alert__content">
          <slot></slot>
        </span>
        ${this.dismissible
          ? html`
              <button
                class="alert__close"
                @click=${this.handleClose}
                aria-label="Close"
              >
                &times;
              </button>
            `
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-alert': RekeAlert;
  }
}
