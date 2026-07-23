import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-input.styles.js';

export type InputSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * @tag reke-input
 * @summary A text input component with sizes, error, and disabled states.
 *
 * @slot prefix - Content rendered inside the field, before the input (unit, icon, symbol).
 * @slot suffix - Content rendered inside the field, after the input (unit, icon, symbol).
 *
 * @fires reke-input - Fired on each keystroke with the current value.
 * @fires reke-change - Fired when the input loses focus and value has changed.
 *
 * @csspart field - The bordered box wrapping the input and adornments.
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

  // --- Forwarded native attributes ---

  @property()
  name = '';

  @property()
  inputmode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url' | 'none';

  @property()
  min?: string;

  @property()
  max?: string;

  @property()
  step?: string;

  @property({ type: Number })
  maxlength?: number;

  @property()
  autocomplete?: string;

  @property({ type: Boolean, reflect: true })
  required = false;

  /** Focus the inner input (delegatesFocus also makes host .focus() work). */
  override focus(options?: FocusOptions) {
    this.shadowRoot?.querySelector('input')?.focus(options);
  }

  private handleInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.emit('reke-input', { value: this.value });
  }

  private handleChange() {
    this.emit('reke-change', { value: this.value });
  }

  override render() {
    const fieldClasses = {
      field: true,
      [`field--${this.size}`]: true,
      'field--error': this.error,
    };

    return html`
      ${this.label ? html`<label class="label">${this.label}</label>` : nothing}
      <div class=${classMap(fieldClasses)} part="field">
        <slot name="prefix"></slot>
        <input
          part="input"
          class="input"
          type=${this.type}
          .value=${this.value}
          placeholder=${this.placeholder || nothing}
          name=${this.name || nothing}
          inputmode=${ifDefined(this.inputmode)}
          min=${ifDefined(this.min)}
          max=${ifDefined(this.max)}
          step=${ifDefined(this.step)}
          maxlength=${ifDefined(this.maxlength)}
          autocomplete=${ifDefined(this.autocomplete)}
          ?required=${this.required}
          ?disabled=${this.disabled}
          aria-disabled=${this.disabled}
          aria-invalid=${this.error}
          aria-label=${this.label || nothing}
          @input=${this.handleInput}
          @change=${this.handleChange}
        />
        <slot name="suffix"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-input': RekeInput;
  }
}
