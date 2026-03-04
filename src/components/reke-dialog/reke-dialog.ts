import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-dialog.styles.js';

export type DialogVariant = 'modal' | 'drawer';
export type DrawerPosition = 'right' | 'left';

/**
 * @tag reke-dialog
 * @summary A dialog component with modal and drawer variants.
 *
 * @slot - Default slot for dialog body content.
 * @slot footer - Slot for action buttons.
 *
 * @fires reke-close - Fired when the dialog closes.
 *
 * @cssprop [--reke-color-bg=#0F0F10] - Dialog background color.
 * @cssprop [--reke-color-border=#252525] - Dialog border color.
 * @cssprop [--reke-color-text=#E5E5E5] - Heading and close button hover color.
 * @cssprop [--reke-color-text-muted=#525252] - Close button default color.
 * @cssprop [--reke-radius=4px] - Dialog border radius (modal only).
 */
@customElement('reke-dialog')
export class RekeDialog extends RekeElement {
  static override styles = styles;

  @property({ type: Boolean, reflect: true })
  open = false;

  @property()
  heading = '';

  @property({ reflect: true })
  variant: DialogVariant = 'modal';

  /** Drawer slide direction. Only applies when variant="drawer". */
  @property({ reflect: true })
  position: DrawerPosition = 'right';

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
    if (!this.open) return nothing;

    const isDrawer = this.variant === 'drawer';

    const backdropClasses = {
      backdrop: true,
      'backdrop--drawer': isDrawer,
      [`backdrop--${this.position}`]: isDrawer,
    };

    const panelClasses = {
      dialog: !isDrawer,
      drawer: isDrawer,
      [`drawer--${this.position}`]: isDrawer,
    };

    return html`
      <div class=${classMap(backdropClasses)} @click=${this.close}>
        <div
          class=${classMap(panelClasses)}
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
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-dialog': RekeDialog;
  }
}
