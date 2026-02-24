import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-tooltip.styles.js';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * @tag reke-tooltip
 * @summary A tooltip component that displays informational text on hover or focus.
 *
 * @slot - Default slot for the trigger element.
 *
 * @cssprop [--reke-color-surface-elevated=#151515] - Tooltip background color.
 * @cssprop [--reke-color-text=#E5E5E5] - Tooltip text color.
 * @cssprop [--reke-color-border=#252525] - Tooltip border color.
 * @cssprop [--reke-radius=4px] - Tooltip border radius.
 * @cssprop [--reke-font-size-xs=12px] - Tooltip font size.
 */
@customElement('reke-tooltip')
export class RekeTooltip extends RekeElement {
  static override styles = styles;

  @property()
  text = '';

  @property({ reflect: true })
  position: TooltipPosition = 'top';

  @property({ type: Number })
  delay = 200;

  @state()
  private _visible = false;

  private _delayTimeout?: ReturnType<typeof setTimeout>;

  private show() {
    clearTimeout(this._delayTimeout);
    this._delayTimeout = setTimeout(() => {
      this._visible = true;
    }, this.delay);
  }

  private hide() {
    clearTimeout(this._delayTimeout);
    this._delayTimeout = setTimeout(() => {
      this._visible = false;
    }, this.delay);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this._delayTimeout);
  }

  override render() {
    return html`
      <div
        class="wrapper"
        aria-describedby="tooltip"
        @mouseenter=${this.show}
        @mouseleave=${this.hide}
        @focusin=${this.show}
        @focusout=${this.hide}
      >
        <div
          id="tooltip"
          class="tooltip tooltip--${this.position} ${this._visible ? 'tooltip--visible' : ''}"
          role="tooltip"
        >
          ${this.text}
        </div>
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-tooltip': RekeTooltip;
  }
}
