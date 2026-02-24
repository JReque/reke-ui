import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-toggle.styles.js';

/**
 * @tag reke-toggle
 * @summary A toggle switch component for boolean on/off states.
 *
 * @fires reke-change - Fired when the toggle state changes, with `{ checked: boolean }` detail.
 *
 * @csspart track - The outer track element.
 * @csspart thumb - The inner sliding thumb element.
 *
 * @cssprop [--reke-color-primary=#22C55E] - Track background when checked.
 * @cssprop [--reke-color-on-primary=#0A0A0B] - Thumb color when checked.
 * @cssprop [--reke-color-surface=#1A1A1A] - Track background when unchecked.
 * @cssprop [--reke-color-border=#252525] - Track border color when unchecked.
 * @cssprop [--reke-color-text-muted=#525252] - Thumb color when unchecked.
 * @cssprop [--reke-color-text=#E5E5E5] - Label text color.
 */
@customElement('reke-toggle')
export class RekeToggle extends RekeElement {
  static override styles = styles;

  @property({ type: Boolean, reflect: true })
  checked = false;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property()
  label = '';

  private toggle() {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.emit('reke-change', { checked: this.checked });
  }

  private handleClick() {
    this.toggle();
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this.toggle();
    }
  }

  override render() {
    return html`
      <div
        class="toggle"
        role="switch"
        aria-checked=${this.checked}
        aria-label=${this.label || nothing}
        tabindex=${this.disabled ? -1 : 0}
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
      >
        <div part="track" class="track ${this.checked ? 'track--checked' : ''}">
          <div part="thumb" class="thumb ${this.checked ? 'thumb--checked' : ''}"></div>
        </div>
        ${this.label ? html`<span class="label">${this.label}</span>` : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-toggle': RekeToggle;
  }
}
