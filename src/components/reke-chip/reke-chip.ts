import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-chip.styles.js';

export type ChipColor = 'primary' | 'secondary' | 'danger' | 'warning';

/**
 * @tag reke-chip
 * @summary A toggleable chip/pill component for filters, tags, and selections.
 *
 * @slot - Default slot for chip label text.
 * @slot prefix - Content rendered before the label (e.g. `<img>`, `<svg>`).
 *
 * @fires reke-click - Fired when the chip body is clicked.
 * @fires reke-dismiss - Fired when the dismiss button is clicked.
 *
 * @property dismissLabel - Accessible label for the dismiss button (default `'Dismiss'`).
 *
 * @csspart chip - The outer chip container.
 * @csspart chip-prefix - The prefix container element.
 * @csspart dismiss - The dismiss button element.
 *
 * @cssprop [--reke-color-primary=#22C55E] - Active color for primary variant.
 * @cssprop [--reke-color-secondary=#3B82F6] - Active color for secondary variant.
 * @cssprop [--reke-color-danger=#EF4444] - Active color for danger variant.
 * @cssprop [--reke-color-warning=#F59E0B] - Active color for warning variant.
 * @cssprop [--reke-color-border-subtle=#1F1F1F] - Inactive border color.
 * @cssprop [--reke-color-text-muted=#525252] - Inactive text color.
 * @cssprop [--reke-radius=4px] - Chip border radius.
 * @cssprop [--reke-chip-prefix-size=16px] - Prefix container size.
 */
@customElement('reke-chip')
export class RekeChip extends RekeElement {
  static override styles = styles;

  /** Color theme for the active state. */
  @property({ reflect: true })
  color: ChipColor = 'primary';

  /** Whether the chip is in its active/selected state. */
  @property({ type: Boolean, reflect: true })
  active = false;

  /** Shows a dismiss (×) button. */
  @property({ type: Boolean, reflect: true })
  dismissible = false;

  /** Accessible label for the dismiss button. Defaults to 'Dismiss'. */
  @property({ type: String, attribute: 'dismiss-label' })
  dismissLabel = 'Dismiss';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  private _handleClick() {
    if (this.disabled) return;
    this.emit('reke-click');
  }

  private _handleDismiss(e: MouseEvent) {
    e.stopPropagation();
    if (this.disabled) return;
    this.emit('reke-dismiss');
  }

  override render() {
    const classes = {
      chip: true,
      [`chip--${this.color}`]: true,
      'chip--active': this.active,
    };

    return html`
      <button
        part="chip"
        class=${classMap(classes)}
        type="button"
        ?disabled=${this.disabled}
        aria-pressed=${this.active}
        @click=${this._handleClick}
      >
        <span part="chip-prefix" class="chip__prefix">
          <slot name="prefix"></slot>
        </span>
        <slot></slot>
        ${
          this.dismissible
            ? html`
              <span
                part="dismiss"
                class="chip__dismiss"
                role="button"
                aria-label=${this.dismissLabel}
                @click=${this._handleDismiss}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </span>
            `
            : nothing
        }
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-chip': RekeChip;
  }
}
