import { html, nothing, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { RekeElement } from '../../shared/base-element.js';
import type { RekeMenuItem } from '../reke-menu-item/reke-menu-item.js';
import { styles } from './reke-menu.styles.js';

/**
 * @tag reke-menu
 * @summary A floating action menu (dropdown / context menu). Anchor it to
 * `{x, y}` coordinates (right-click menus) or to an element via `anchor`.
 * Closes on outside click, Escape, and scroll. Holds `reke-menu-item` children.
 *
 * @slot - Default slot for `reke-menu-item` elements.
 *
 * @fires reke-close - Fired when the menu requests to close (outside click,
 *   Escape, scroll, or item selection). The consumer should set `open=false`.
 *
 * @csspart menu - The floating menu container.
 *
 * @cssprop [--reke-color-surface-elevated=#151515] - Menu background.
 * @cssprop [--reke-color-border=#252525] - Menu border.
 * @cssprop [--reke-radius=4px] - Menu border radius.
 */
@customElement('reke-menu')
export class RekeMenu extends RekeElement {
  static override styles = styles;

  @property({ type: Boolean, reflect: true })
  open = false;

  /** Viewport X coordinate (used when `anchor` is not set). */
  @property({ type: Number })
  x = 0;

  /** Viewport Y coordinate (used when `anchor` is not set). */
  @property({ type: Number })
  y = 0;

  /** Element to anchor the menu below. Overrides `x`/`y` when set. */
  @property({ attribute: false })
  anchor: HTMLElement | null = null;

  @property()
  label = 'Menu';

  private _boundOutsideClick = this.handleOutsideClick.bind(this);
  private _boundClose = () => this.requestClose();

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeListeners();
  }

  override updated(changed: PropertyValues<this>) {
    if (changed.has('open')) {
      if (this.open) this.handleOpen();
      else this.removeListeners();
    } else if (this.open && (changed.has('x') || changed.has('y') || changed.has('anchor'))) {
      this.updatePosition();
    }
  }

  private handleOpen() {
    this.addListeners();
    this.updateComplete.then(() => {
      this.updatePosition();
      this.items[0]?.focus();
    });
  }

  private get items(): RekeMenuItem[] {
    return Array.from(this.querySelectorAll('reke-menu-item')).filter((it) => !it.disabled);
  }

  private resolveOrigin(): { x: number; y: number } {
    if (this.anchor) {
      const r = this.anchor.getBoundingClientRect();
      return { x: r.left, y: r.bottom + 4 };
    }
    return { x: this.x, y: this.y };
  }

  private updatePosition() {
    const menu = this.shadowRoot?.querySelector<HTMLElement>('.menu');
    if (!menu) return;
    let { x, y } = this.resolveOrigin();
    const { offsetWidth: w, offsetHeight: h } = menu;
    // Flip/clamp so the menu never spills off the viewport.
    if (x + w > window.innerWidth) x = Math.max(4, window.innerWidth - w - 4);
    if (y + h > window.innerHeight) y = Math.max(4, window.innerHeight - h - 4);
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.visibility = 'visible';
  }

  private addListeners() {
    document.addEventListener('click', this._boundOutsideClick);
    // Capture scroll on any ancestor; close instead of reflow (matches native menus).
    window.addEventListener('scroll', this._boundClose, true);
    window.addEventListener('resize', this._boundClose);
  }

  private removeListeners() {
    document.removeEventListener('click', this._boundOutsideClick);
    window.removeEventListener('scroll', this._boundClose, true);
    window.removeEventListener('resize', this._boundClose);
  }

  private handleOutsideClick(e: Event) {
    if (!e.composedPath().includes(this)) this.requestClose();
  }

  private requestClose() {
    if (!this.open) return;
    this.open = false;
    this.emit('reke-close');
  }

  private handleKeyDown(e: KeyboardEvent) {
    const items = this.items;
    if (items.length === 0) return;
    const current = items.findIndex((it) => it === e.composedPath()[1] || it === e.target);

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.requestClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        items[Math.min(current + 1, items.length - 1)]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        items[Math.max(current - 1, 0)]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        items[items.length - 1]?.focus();
        break;
    }
  }

  private handleSelect() {
    this.requestClose();
  }

  override render() {
    if (!this.open) return nothing;

    return html`
      <div
        class="menu"
        part="menu"
        role="menu"
        aria-label=${this.label}
        style="visibility:hidden"
        @keydown=${this.handleKeyDown}
        @reke-select=${this.handleSelect}
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-menu': RekeMenu;
  }
}
