import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-dialog.styles.js';

/**
 * @tag reke-dialog
 * @summary A modal dialog component with backdrop, heading, and footer slots.
 *
 * @slot - Default slot for dialog body content.
 * @slot footer - Slot for action buttons.
 *
 * @fires reke-close - Fired when the dialog closes.
 *
 * @cssprop [--reke-color-bg=#0F0F10] - Dialog background color.
 * @cssprop [--reke-color-border=#252525] - Dialog border color.
 * @cssprop [--reke-color-text=#E5E5E5] - Dialog heading and close button hover color.
 * @cssprop [--reke-color-text-muted=#525252] - Close button default color.
 * @cssprop [--reke-radius=4px] - Dialog border radius.
 * @cssprop [--reke-font-size-md=14px] - Dialog title font size.
 * @cssprop [--reke-font-weight-semibold=600] - Dialog title font weight.
 */
@customElement('reke-dialog')
export class RekeDialog extends RekeElement {
  static override styles = styles;

  @property({ type: Boolean, reflect: true })
  open = false;

  @property()
  heading = '';

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.open) {
      this.close();
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._handleKeydown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._handleKeydown);
  }

  show() {
    this.open = true;
  }

  close() {
    this.open = false;
    this.emit('reke-close');
  }

  override render() {
    return html`
      ${this.open
        ? html`
            <div class="backdrop" @click=${this.close}>
              <div
                class="dialog"
                role="dialog"
                aria-modal="true"
                aria-label=${this.heading}
                @click=${(e: Event) => e.stopPropagation()}
              >
                ${this.heading
                  ? html`
                      <div class="dialog-header">
                        <h2 class="dialog-title">${this.heading}</h2>
                        <button
                          class="close-btn"
                          @click=${this.close}
                          aria-label="Close"
                        >
                          &times;
                        </button>
                      </div>
                    `
                  : nothing}
                <div class="dialog-body">
                  <slot></slot>
                </div>
                <div class="dialog-footer">
                  <slot name="footer"></slot>
                </div>
              </div>
            </div>
          `
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-dialog': RekeDialog;
  }
}
