import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-button.styles.js';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'danger-outline'
  | 'icon-only';

export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * @tag reke-button
 * @summary A button component with multiple variants and sizes.
 *
 * @slot - Default slot for button label text.
 * @slot prefix - Content rendered before the label.
 * @slot suffix - Content rendered after the label.
 *
 * @fires reke-click - Fired when the button is clicked and not disabled.
 *
 * @csspart button - The inner button element.
 *
 * @cssprop [--reke-color-primary=#22C55E] - Primary button background color.
 * @cssprop [--reke-color-on-primary=#0A0A0B] - Primary button text color.
 * @cssprop [--reke-color-surface=#1A1A1A] - Secondary/icon-only button background.
 * @cssprop [--reke-color-border=#252525] - Secondary/icon-only button border.
 * @cssprop [--reke-color-danger=#EF4444] - Danger button background.
 * @cssprop [--reke-color-text=#E5E5E5] - Default text color.
 * @cssprop [--reke-color-text-ghost=#737373] - Ghost variant text color.
 * @cssprop [--reke-radius=4px] - Button border radius.
 */
@customElement('reke-button')
export class RekeButton extends RekeElement {
  static override styles = styles;

  @property({ reflect: true })
  variant: ButtonVariant = 'primary';

  @property({ reflect: true })
  size: ButtonSize = 'md';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  loading = false;

  private handleClick(e: MouseEvent) {
    if (this.disabled || this.loading) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    this.emit('reke-click');
  }

  override render() {
    const classes = {
      button: true,
      [`button--${this.variant}`]: true,
      [`button--${this.size}`]: true,
      'button--loading': this.loading,
    };

    return html`
      <button
        part="button"
        class=${classMap(classes)}
        ?disabled=${this.disabled}
        aria-disabled=${this.disabled || this.loading}
        aria-busy=${this.loading}
        @click=${this.handleClick}
      >
        <span class="spinner" aria-hidden="true"></span>
        ${this.variant !== 'icon-only'
          ? html`<slot name="prefix"></slot>`
          : nothing}
        <slot></slot>
        ${this.variant !== 'icon-only'
          ? html`<slot name="suffix"></slot>`
          : nothing}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-button': RekeButton;
  }
}
