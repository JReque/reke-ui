import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-textarea.styles.js';

export type TextareaSize = 'sm' | 'md' | 'lg';

/**
 * @tag reke-textarea
 * @summary A textarea component with sizes, error, and disabled states.
 *
 * @fires reke-input - Fired on each keystroke with the current value.
 * @fires reke-change - Fired when the textarea loses focus and value has changed.
 *
 * @csspart textarea - The inner textarea element.
 *
 * @cssprop [--reke-color-primary=#22C55E] - Focus ring color.
 * @cssprop [--reke-color-surface=#1A1A1A] - Textarea background.
 * @cssprop [--reke-color-border=#252525] - Textarea border.
 * @cssprop [--reke-color-danger=#EF4444] - Error state border.
 * @cssprop [--reke-color-text=#E5E5E5] - Textarea text color.
 * @cssprop [--reke-color-text-muted=#525252] - Placeholder color.
 */
@customElement('reke-textarea')
export class RekeTextarea extends RekeElement {
  static override styles = styles;

  @property()
  value = '';

  @property()
  placeholder = '';

  @property({ type: Number })
  rows = 4;

  @property({ reflect: true })
  size: TextareaSize = 'md';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  error = false;

  @property()
  label = '';

  private handleInput(e: Event) {
    const textarea = e.target as HTMLTextAreaElement;
    this.value = textarea.value;
    this.emit('reke-input', { value: this.value });
  }

  private handleChange() {
    this.emit('reke-change', { value: this.value });
  }

  override render() {
    const classes = {
      textarea: true,
      [`textarea--${this.size}`]: true,
      'textarea--error': this.error,
    };

    return html`
      ${this.label ? html`<label class="label">${this.label}</label>` : nothing}
      <textarea
        part="textarea"
        class=${classMap(classes)}
        .value=${this.value}
        placeholder=${this.placeholder || nothing}
        rows=${this.rows}
        ?disabled=${this.disabled}
        aria-disabled=${this.disabled}
        aria-invalid=${this.error}
        aria-label=${this.label || nothing}
        @input=${this.handleInput}
        @change=${this.handleChange}
      ></textarea>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-textarea': RekeTextarea;
  }
}
