import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-checkbox.styles.js';

/**
 * @tag reke-checkbox
 * @summary A checkbox component with checked, indeterminate, and disabled states.
 *
 * @fires reke-change - Fired when the checkbox is toggled. Detail: `{ checked: boolean }`.
 *
 * @csspart container - The clickable container wrapping the checkbox and label.
 * @csspart box - The visual checkbox box.
 * @csspart label - The label text span.
 *
 * @cssprop [--reke-color-primary=#22C55E] - Checked state background and border.
 * @cssprop [--reke-color-surface=#1A1A1A] - Unchecked box background.
 * @cssprop [--reke-color-border=#252525] - Unchecked box border.
 * @cssprop [--reke-color-text=#E5E5E5] - Label text color.
 */
@customElement('reke-checkbox')
export class RekeCheckbox extends RekeElement {
  static override styles = styles;

  @property({ type: Boolean, reflect: true })
  checked = false;

  @property({ type: Boolean, reflect: true })
  indeterminate = false;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property()
  label = '';

  private handleClick() {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.indeterminate = false;
    this.emit('reke-change', { checked: this.checked });
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this.handleClick();
    }
  }

  override render() {
    const ariaChecked = this.indeterminate
      ? 'mixed'
      : String(this.checked);

    return html`
      <div
        part="container"
        class="container"
        role="checkbox"
        tabindex=${this.disabled ? '-1' : '0'}
        aria-checked=${ariaChecked}
        aria-disabled=${this.disabled}
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
      >
        <span part="box" class="box ${this.checked ? 'box--checked' : ''} ${this.indeterminate ? 'box--indeterminate' : ''}">
          ${this.checked
            ? html`<svg class="checkmark" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`
            : nothing}
          ${this.indeterminate && !this.checked
            ? html`<svg class="indeterminate-mark" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 6H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>`
            : nothing}
        </span>
        ${this.label
          ? html`<span part="label" class="label">${this.label}</span>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-checkbox': RekeCheckbox;
  }
}
