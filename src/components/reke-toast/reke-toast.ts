import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-toast.styles.js';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

const ICONS: Record<ToastVariant, unknown> = {
  success: html`<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  error: html`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  warning: html`<svg viewBox="0 0 24 24"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info: html`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
};

/**
 * @tag reke-toast
 * @summary A compact notification toast with optional action and close button.
 *
 * @fires reke-close - Fired when the toast is dismissed.
 * @fires reke-action - Fired when the action button is clicked.
 *
 * @csspart toast - The outer toast container.
 *
 * @cssprop [--reke-color-surface=#1A1A1A] - Toast background.
 * @cssprop [--reke-color-border=#252525] - Default border.
 * @cssprop [--reke-color-primary=#22C55E] - Success variant accent.
 * @cssprop [--reke-color-danger=#EF4444] - Error variant accent.
 * @cssprop [--reke-color-warning=#F59E0B] - Warning variant accent.
 * @cssprop [--reke-color-secondary=#3B82F6] - Info variant accent.
 * @cssprop [--reke-color-text=#E5E5E5] - Message text color.
 * @cssprop [--reke-color-text-muted=#525252] - Close button color.
 * @cssprop [--reke-radius=4px] - Toast border radius.
 */
@customElement('reke-toast')
export class RekeToast extends RekeElement {
  static override styles = styles;

  @property({ reflect: true })
  variant: ToastVariant = 'success';

  @property()
  message = '';

  /** Label for the optional action button. */
  @property()
  action = '';

  /** Auto-dismiss after N milliseconds. 0 = no auto-dismiss. */
  @property({ type: Number })
  duration = 0;

  private _timer: ReturnType<typeof setTimeout> | undefined;

  override connectedCallback() {
    super.connectedCallback();
    this.startTimer();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.clearTimer();
  }

  private startTimer() {
    this.clearTimer();
    if (this.duration > 0) {
      this._timer = setTimeout(() => this.dismiss(), this.duration);
    }
  }

  private clearTimer() {
    if (this._timer !== undefined) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }
  }

  dismiss() {
    this.emit('reke-close');
    this.remove();
  }

  private handleAction() {
    this.emit('reke-action');
  }

  override render() {
    const classes = {
      toast: true,
      [`toast--${this.variant}`]: true,
    };

    return html`
      <div part="toast" class=${classMap(classes)} role="status">
        <div class="toast__left">
          <span class="toast__icon" aria-hidden="true">
            ${ICONS[this.variant]}
          </span>
          <span class="toast__message">${this.message}</span>
        </div>
        <div class="toast__right">
          ${this.action
            ? html`
                <button
                  class="toast__action"
                  type="button"
                  @click=${this.handleAction}
                >
                  ${this.action}
                </button>
              `
            : nothing}
          <button
            class="toast__close"
            @click=${() => this.dismiss()}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-toast': RekeToast;
  }
}
