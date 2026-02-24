import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-select.styles.js';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * @tag reke-select
 * @summary A dropdown select component with sizes, error, and disabled states.
 *
 * @fires reke-change - Fired when an option is selected. Detail: `{ value: string }`.
 *
 * @csspart trigger - The trigger button element.
 * @csspart dropdown - The dropdown list container.
 *
 * @cssprop [--reke-color-primary=#22C55E] - Focus ring and selected option color.
 * @cssprop [--reke-color-surface=#1A1A1A] - Trigger and dropdown background.
 * @cssprop [--reke-color-surface-elevated=#151515] - Option hover background.
 * @cssprop [--reke-color-border=#252525] - Trigger and dropdown border.
 * @cssprop [--reke-color-danger=#EF4444] - Error state border.
 * @cssprop [--reke-color-text=#E5E5E5] - Text color.
 * @cssprop [--reke-color-text-muted=#525252] - Placeholder color.
 * @cssprop [--reke-color-text-label=#8A8A8A] - Label color.
 */
@customElement('reke-select')
export class RekeSelect extends RekeElement {
  static override styles = styles;

  @property()
  value = '';

  @property()
  placeholder = 'Select...';

  @property({ attribute: false })
  options: SelectOption[] = [];

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  error = false;

  @property()
  label = '';

  @property({ reflect: true })
  size: SelectSize = 'md';

  @state()
  private _open = false;

  private _boundHandleOutsideClick = this.handleOutsideClick.bind(this);
  private _boundHandleKeyDown = this.handleKeyDown.bind(this);

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._boundHandleOutsideClick);
    document.addEventListener('keydown', this._boundHandleKeyDown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._boundHandleOutsideClick);
    document.removeEventListener('keydown', this._boundHandleKeyDown);
  }

  private handleOutsideClick(e: Event) {
    const path = e.composedPath();
    if (!path.includes(this)) {
      this._open = false;
    }
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && this._open) {
      this._open = false;
    }
  }

  private handleTriggerClick() {
    if (this.disabled) return;
    this._open = !this._open;
  }

  private handleOptionClick(optionValue: string) {
    this.value = optionValue;
    this._open = false;
    this.emit('reke-change', { value: this.value });
  }

  private get selectedLabel(): string | undefined {
    const selected = this.options.find((opt) => opt.value === this.value);
    return selected?.label;
  }

  override render() {
    const displayLabel = this.selectedLabel;
    const isPlaceholder = !displayLabel;

    const triggerClasses = {
      trigger: true,
      [`trigger--${this.size}`]: true,
      'trigger--error': this.error,
      'trigger--placeholder': isPlaceholder,
    };

    return html`
      ${this.label ? html`<label class="label">${this.label}</label>` : nothing}
      <button
        part="trigger"
        class=${classMap(triggerClasses)}
        type="button"
        ?disabled=${this.disabled}
        aria-expanded=${this._open}
        aria-haspopup="listbox"
        aria-label=${this.label || nothing}
        @click=${this.handleTriggerClick}
      >
        <span class="trigger__text">${displayLabel ?? this.placeholder}</span>
        <span class="trigger__chevron" aria-hidden="true">&#9660;</span>
      </button>
      ${this._open
        ? html`
            <ul
              part="dropdown"
              class="dropdown"
              role="listbox"
              aria-label=${this.label || nothing}
            >
              ${this.options.map(
                (opt) => html`
                  <li
                    class="option ${opt.value === this.value ? 'option--selected' : ''}"
                    role="option"
                    aria-selected=${opt.value === this.value}
                    @click=${() => this.handleOptionClick(opt.value)}
                  >
                    ${opt.label}
                  </li>
                `,
              )}
            </ul>
          `
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-select': RekeSelect;
  }
}
