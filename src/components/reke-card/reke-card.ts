import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-card.styles.js';

export type CardVariant = 'default' | 'elevated' | 'outlined';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * @tag reke-card
 * @summary A card container component with multiple variants and padding options.
 *
 * @slot - Default slot for card body content.
 * @slot header - Content rendered in the card header.
 * @slot footer - Content rendered in the card footer.
 *
 * @cssprop [--reke-color-surface=#1A1A1A] - Card background color.
 * @cssprop [--reke-color-border=#252525] - Card border color.
 * @cssprop [--reke-shadow-md=0 4px 6px rgba(0,0,0,0.3)] - Elevated variant shadow.
 * @cssprop [--reke-radius=4px] - Card border radius.
 */
@customElement('reke-card')
export class RekeCard extends RekeElement {
  static override styles = styles;

  @property({ reflect: true })
  variant: CardVariant = 'default';

  @property({ reflect: true })
  padding: CardPadding = 'md';

  override render() {
    const classes = {
      card: true,
      [`card--${this.variant}`]: true,
      [`card--padding-${this.padding}`]: true,
    };

    return html`
      <div class=${classMap(classes)}>
        <div class="card-header">
          <slot name="header"></slot>
        </div>
        <div class="card-body">
          <slot></slot>
        </div>
        <div class="card-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-card': RekeCard;
  }
}
