import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
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

  @state() private _hasHeader = false;
  @state() private _hasFooter = false;

  private _onSlotChange(slot: 'header' | 'footer', e: Event) {
    const el = e.target as HTMLSlotElement;
    const hasContent = el.assignedNodes({ flatten: true }).length > 0;
    if (slot === 'header') this._hasHeader = hasContent;
    else this._hasFooter = hasContent;
  }

  override render() {
    const classes = {
      card: true,
      [`card--${this.variant}`]: true,
      [`card--padding-${this.padding}`]: true,
    };

    return html`
      <div class=${classMap(classes)}>
        ${this._hasHeader ? html`
          <div class="card-header">
            <slot name="header" @slotchange=${(e: Event) => this._onSlotChange('header', e)}></slot>
          </div>
        ` : html`<slot name="header" @slotchange=${(e: Event) => this._onSlotChange('header', e)} style="display:none"></slot>`}
        <div class="card-body">
          <slot></slot>
        </div>
        ${this._hasFooter ? html`
          <div class="card-footer">
            <slot name="footer" @slotchange=${(e: Event) => this._onSlotChange('footer', e)}></slot>
          </div>
        ` : html`<slot name="footer" @slotchange=${(e: Event) => this._onSlotChange('footer', e)} style="display:none"></slot>`}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-card': RekeCard;
  }
}
