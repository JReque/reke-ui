import { html, nothing, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-dialog.styles.js';

export type DialogVariant = 'modal' | 'drawer';
export type DrawerPosition = 'right' | 'left';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Safety net for unmounting after the exit animation. `animationend` is the
 * primary trigger; this covers the cases where it never fires — no animation
 * applied, the tab backgrounded mid-close, a consumer overriding the styles.
 */
const EXIT_FALLBACK_MS = 400;

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * @tag reke-dialog
 * @summary A dialog component with modal and drawer variants.
 *
 * Implements the ARIA dialog pattern: while open it takes focus, keeps Tab
 * cycling inside the panel, restores focus to whatever opened it, and locks
 * body scroll.
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

  /**
   * Kept rendering after `open` flips to false so the panel can animate out.
   * Without it `render()` would return `nothing` and the exit would be instant.
   */
  @state()
  private _closing = false;

  private _exitTimer: ReturnType<typeof setTimeout> | null = null;

  /** Element focused before the dialog opened, restored on close. */
  private _previouslyFocused: HTMLElement | null = null;

  /** Body `overflow` value to put back when the scroll lock is released. */
  private _previousBodyOverflow = '';
  private _scrollLocked = false;

  private _handleKeydown = (e: KeyboardEvent) => {
    if (!this.open) return;

    if (e.key === 'Escape') {
      this.close();
      return;
    }

    if (e.key !== 'Tab') return;

    const focusable = this.getFocusableElements();
    if (focusable.length === 0) {
      // Nothing to cycle through — hold focus on the panel itself.
      e.preventDefault();
      this.getPanel()?.focus();
      return;
    }

    // Focus inside our shadow root reads as the host from `document`, so ask
    // the shadow root first and fall back to light-DOM slotted content.
    const active = this.shadowRoot?.activeElement ?? document.activeElement;
    const index = active ? focusable.indexOf(active as HTMLElement) : -1;

    // index === -1 means focus escaped the dialog; either direction pulls it back.
    if (e.shiftKey) {
      if (index <= 0) {
        e.preventDefault();
        focusable[focusable.length - 1].focus();
      }
    } else if (index === -1 || index === focusable.length - 1) {
      e.preventDefault();
      focusable[0].focus();
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._handleKeydown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._handleKeydown);
    // A dialog torn down while open would otherwise leave the page unscrollable.
    this.releaseScrollLock();
    this.cancelExit();
  }

  protected override updated(changed: PropertyValues<this>) {
    if (!changed.has('open')) return;

    if (this.open) {
      this.cancelExit();
      this.handleOpened();
    } else if (changed.get('open') === true) {
      // Focus and scroll are handed back straight away — a keyboard user must
      // not wait for an animation to regain control of the page.
      this.handleClosed();
      this.startExit();
    }
  }

  show() {
    this.open = true;
  }

  close() {
    this.open = false;
    this.emit('reke-close');
  }

  private getPanel(): HTMLElement | null {
    return this.shadowRoot?.querySelector<HTMLElement>('.dialog, .drawer') ?? null;
  }

  /**
   * Focusable descendants in tab order: the shadow close button first, then
   * the default slot, then the footer slot — matching how the panel reads.
   */
  private getFocusableElements(): HTMLElement[] {
    const closeBtn = this.shadowRoot?.querySelector<HTMLElement>('.close-btn');
    return [
      ...(closeBtn ? [closeBtn] : []),
      ...this.getSlottedFocusable(),
      ...this.getSlottedFocusable('footer'),
    ];
  }

  private getSlottedFocusable(name?: string): HTMLElement[] {
    const selector = name ? `slot[name="${name}"]` : 'slot:not([name])';
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>(selector);
    if (!slot) return [];

    const found: HTMLElement[] = [];
    for (const node of slot.assignedElements()) {
      if (!(node instanceof HTMLElement)) continue;
      if (node.matches(FOCUSABLE_SELECTOR)) found.push(node);
      found.push(...node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    }
    return found;
  }

  private handleOpened() {
    this._previouslyFocused = document.activeElement as HTMLElement | null;
    this.lockScroll();
    (this.getFocusableElements()[0] ?? this.getPanel())?.focus();
  }

  private handleClosed() {
    this.releaseScrollLock();
    const target = this._previouslyFocused;
    this._previouslyFocused = null;
    target?.focus();
  }

  private startExit() {
    if (prefersReducedMotion()) return;
    this._closing = true;
    this._exitTimer = setTimeout(() => this.cancelExit(), EXIT_FALLBACK_MS);
  }

  private cancelExit() {
    if (this._exitTimer !== null) {
      clearTimeout(this._exitTimer);
      this._exitTimer = null;
    }
    this._closing = false;
  }

  private handleExitAnimationEnd = (e: AnimationEvent) => {
    // Only the panel's own exit animation ends the closing state — animations
    // on slotted content bubble through here too.
    if (e.target !== e.currentTarget || !this._closing) return;
    this.cancelExit();
  };

  private lockScroll() {
    if (this._scrollLocked) return;
    this._previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this._scrollLocked = true;
  }

  private releaseScrollLock() {
    if (!this._scrollLocked) return;
    document.body.style.overflow = this._previousBodyOverflow;
    this._scrollLocked = false;
  }

  override render() {
    if (!this.open && !this._closing) return nothing;

    const isDrawer = this.variant === 'drawer';

    const backdropClasses = {
      backdrop: true,
      'backdrop--drawer': isDrawer,
      [`backdrop--${this.position}`]: isDrawer,
      'is-closing': this._closing,
    };

    const panelClasses = {
      dialog: !isDrawer,
      drawer: isDrawer,
      [`drawer--${this.position}`]: isDrawer,
      'is-closing': this._closing,
    };

    return html`
      <div class=${classMap(backdropClasses)} @click=${this.close}>
        <div
          class=${classMap(panelClasses)}
          role="dialog"
          aria-modal="true"
          aria-label=${this.heading}
          tabindex="-1"
          @click=${(e: Event) => e.stopPropagation()}
          @animationend=${this.handleExitAnimationEnd}
        >
          ${
            this.heading
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
              : nothing
          }
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
