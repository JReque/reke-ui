import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-combobox.styles.js';

export type ComboboxSize = 'sm' | 'md' | 'lg';

export interface ComboboxOption {
  value: string;
  label: string;
  /** Optional image (e.g. a token/coin logo) rendered before the label. */
  image?: string;
}

/**
 * @tag reke-combobox
 * @summary A searchable select. Type to filter options, navigate with the
 * keyboard. Unlike `reke-select`, it exposes a text query and is meant for long
 * option lists.
 *
 * @fires reke-change - Fired when an option is selected. Detail: `{ value: string }`.
 * @fires reke-search - Fired when the query changes (for remote filtering). Detail: `{ query: string }`.
 *
 * @csspart input - The text input element.
 * @csspart dropdown - The dropdown list container.
 * @csspart option - Each option row.
 * @csspart empty - The "no results" row.
 *
 * @cssprop [--reke-color-primary=#22C55E] - Focus ring and active/selected option color.
 * @cssprop [--reke-color-surface=#1A1A1A] - Input and dropdown background.
 * @cssprop [--reke-color-surface-elevated=#151515] - Option hover/active background.
 * @cssprop [--reke-color-border=#252525] - Input and dropdown border.
 * @cssprop [--reke-color-danger=#EF4444] - Error state border.
 * @cssprop [--reke-color-text=#E5E5E5] - Text color.
 * @cssprop [--reke-color-text-muted=#525252] - Placeholder / empty color.
 * @cssprop [--reke-color-text-label=#8A8A8A] - Label color.
 */
@customElement('reke-combobox')
export class RekeCombobox extends RekeElement {
  static override styles = styles;

  @property()
  value = '';

  @property()
  placeholder = 'Buscar...';

  @property({ attribute: false })
  options: ComboboxOption[] = [];

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  error = false;

  @property()
  label = '';

  @property()
  emptyText = 'Sin resultados';

  @property({ reflect: true })
  size: ComboboxSize = 'md';

  @state()
  private _open = false;

  @state()
  private _query = '';

  @state()
  private _activeIndex = 0;

  /** Inline `position: fixed` coords so the dropdown escapes any ancestor
   * `overflow: hidden` (cards, table cells, etc.). */
  @state()
  private _dropdownStyle = '';

  private _boundHandleOutsideClick = this.handleOutsideClick.bind(this);
  private _boundReposition = () => this.updatePosition();

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._boundHandleOutsideClick);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._boundHandleOutsideClick);
    this.removePositionListeners();
  }

  private updatePosition() {
    const control = this.shadowRoot?.querySelector('.control');
    if (!control) return;
    const r = control.getBoundingClientRect();
    this._dropdownStyle = `position:fixed;top:${r.bottom + 4}px;left:${r.left}px;width:${r.width}px;right:auto;`;
  }

  private addPositionListeners() {
    window.addEventListener('scroll', this._boundReposition, true);
    window.addEventListener('resize', this._boundReposition);
  }

  private removePositionListeners() {
    window.removeEventListener('scroll', this._boundReposition, true);
    window.removeEventListener('resize', this._boundReposition);
  }

  private handleOutsideClick(e: Event) {
    if (!e.composedPath().includes(this)) {
      this.close();
    }
  }

  private get selectedLabel(): string {
    return this.options.find((opt) => opt.value === this.value)?.label ?? '';
  }

  private get filteredOptions(): ComboboxOption[] {
    const q = this._query.trim().toLowerCase();
    if (q === '') return this.options;
    return this.options.filter(
      (opt) => opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q),
    );
  }

  private open() {
    if (this.disabled || this._open) return;
    this._open = true;
    this._query = '';
    this._activeIndex = 0;
    this.addPositionListeners();
    this.updateComplete.then(() => this.updatePosition());
  }

  private close() {
    this._open = false;
    this._query = '';
    this.removePositionListeners();
  }

  private selectOption(option: ComboboxOption) {
    this.value = option.value;
    this.close();
    this.emit('reke-change', { value: this.value });
  }

  private handleInput(e: Event) {
    this._query = (e.target as HTMLInputElement).value;
    this._open = true;
    this._activeIndex = 0;
    this.emit('reke-search', { query: this._query });
  }

  private handleKeyDown(e: KeyboardEvent) {
    const options = this.filteredOptions;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!this._open) this.open();
        else this._activeIndex = Math.min(this._activeIndex + 1, options.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this._activeIndex = Math.max(this._activeIndex - 1, 0);
        break;
      case 'Enter': {
        if (!this._open) break;
        e.preventDefault();
        const active = options[this._activeIndex];
        if (active) this.selectOption(active);
        break;
      }
      case 'Escape':
        if (this._open) {
          e.preventDefault();
          this.close();
        }
        break;
    }
  }

  override render() {
    const options = this.filteredOptions;
    const inputValue = this._open ? this._query : this.selectedLabel;

    const inputClasses = {
      input: true,
      [`input--${this.size}`]: true,
      'input--error': this.error,
    };

    return html`
      ${this.label ? html`<label class="label">${this.label}</label>` : nothing}
      <div class="control">
        <input
          part="input"
          class=${classMap(inputClasses)}
          type="text"
          role="combobox"
          .value=${inputValue}
          placeholder=${this.selectedLabel || this.placeholder}
          ?disabled=${this.disabled}
          autocomplete="off"
          aria-expanded=${this._open}
          aria-controls="reke-combobox-list"
          aria-autocomplete="list"
          aria-invalid=${this.error}
          aria-activedescendant=${
            this._open && options[this._activeIndex]
              ? `reke-combobox-opt-${this._activeIndex}`
              : nothing
          }
          @focus=${this.open}
          @click=${this.open}
          @input=${this.handleInput}
          @keydown=${this.handleKeyDown}
        />
        <span class="chevron" aria-hidden="true">&#9660;</span>
      </div>
      ${
        this._open
          ? html`
            <ul
              part="dropdown"
              id="reke-combobox-list"
              class="dropdown"
              role="listbox"
              style=${this._dropdownStyle}
            >
              ${
                options.length === 0
                  ? html`<li part="empty" class="empty">${this.emptyText}</li>`
                  : options.map(
                      (opt, i) => html`
                      <li
                        part="option"
                        id="reke-combobox-opt-${i}"
                        class=${classMap({
                          option: true,
                          'option--selected': opt.value === this.value,
                          'option--active': i === this._activeIndex,
                        })}
                        role="option"
                        aria-selected=${opt.value === this.value}
                        @click=${() => this.selectOption(opt)}
                        @mousemove=${() => {
                          this._activeIndex = i;
                        }}
                      >
                        ${
                          opt.image
                            ? html`<img class="option-img" src=${opt.image} alt="" loading="lazy" />`
                            : nothing
                        }${opt.label}
                      </li>
                    `,
                    )
              }
            </ul>
          `
          : nothing
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-combobox': RekeCombobox;
  }
}
