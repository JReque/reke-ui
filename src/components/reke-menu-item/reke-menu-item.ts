import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-menu-item.styles.js';

export type MenuItemVariant = 'default' | 'danger';

/**
 * @tag reke-menu-item
 * @summary A single actionable item inside a `reke-menu`.
 *
 * @slot - Default slot for the item label.
 * @slot prefix - Content rendered before the label (e.g. an icon).
 *
 * @fires reke-select - Fired when the item is activated and not disabled.
 *
 * @csspart item - The inner button element.
 *
 * @cssprop [--reke-color-text=#E5E5E5] - Item text color.
 * @cssprop [--reke-color-danger=#EF4444] - Danger variant text color.
 * @cssprop [--reke-color-surface-elevated=#151515] - Hover/focus background.
 */
@customElement('reke-menu-item')
export class RekeMenuItem extends RekeElement {
  static override styles = styles;

  @property({ reflect: true })
  variant: MenuItemVariant = 'default';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Focus the inner button (used by reke-menu for keyboard navigation). */
  override focus(options?: FocusOptions) {
    this.shadowRoot?.querySelector('button')?.focus(options);
  }

  private handleClick(e: MouseEvent) {
    if (this.disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    this.emit('reke-select');
  }

  override render() {
    const classes = {
      item: true,
      [`item--${this.variant}`]: true,
    };

    return html`
      <button
        part="item"
        class=${classMap(classes)}
        role="menuitem"
        ?disabled=${this.disabled}
        aria-disabled=${this.disabled}
        @click=${this.handleClick}
      >
        <slot name="prefix"></slot>
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-menu-item': RekeMenuItem;
  }
}
