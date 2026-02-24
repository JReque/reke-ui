import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-input.styles.js';

export type InputSize = 'sm' | 'md' | 'lg';

/**
 * @tag reke-input
 * @summary A text input component with sizes, error, and disabled states.
 *
 * @fires reke-input - Fired on each keystroke with the current value.
 * @fires reke-change - Fired when the input loses focus and value has changed.
 *
 * @csspart input - The inner input element.
 *
 * @cssprop [--reke-color-primary=#22C55E] - Focus ring color.
 * @cssprop [--reke-color-surface=#1A1A1A] - Input background.
 * @cssprop [--reke-color-border=#252525] - Input border.
 * @cssprop [--reke-color-danger=#EF4444] - Error state border.
 * @cssprop [--reke-color-text=#E5E5E5] - Input text color.
 * @cssprop [--reke-color-text-muted=#525252] - Placeholder color.
 */
@customElement('reke-input')
export class RekeInput extends RekeElement {
  static override styles = styles;

  @property()
  value = '';

  @property()
  placeholder = '';

  @property()
  type: 'text' | 'password' | 'email' | 'number' | 'search' | 'url' = 'text';

  @property({ reflect: true })
  size: InputSize = 'md';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  error = false;

  @property()
  label = '';

  private handleInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.emit('reke-input', { value: this.value });
  }

  private handleChange() {
    this.emit('reke-change', { value: this.value });
  }

  override render() {
    const classes = {
      input: true,
      [`input--${this.size}`]: true,
      'input--error': this.error,
    };

    return html`
      ${this.label ? html`<label class="label">${this.label}</label>` : nothing}
      <input
        part="input"
        class=${classMap(classes)}
        type=${this.type}
        .value=${this.value}
        placeholder=${this.placeholder || nothing}
        ?disabled=${this.disabled}
        aria-disabled=${this.disabled}
        aria-invalid=${this.error}
        aria-label=${this.label || nothing}
        @input=${this.handleInput}
        @change=${this.handleChange}
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-input': RekeInput;
  }
}
