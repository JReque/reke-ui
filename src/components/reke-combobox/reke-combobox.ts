import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-combobox.styles.js';
import '../reke-chip/reke-chip.js';

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
 * @fires reke-change - Fired when the selection changes. Detail: `{ value: string }`
 * in single mode, `{ values: string[] }` when `multiple` is set.
 * @fires reke-search - Fired when the query changes (for remote filtering). Detail: `{ query: string }`.
 *
 * @csspart input - The text input element.
 * @csspart dropdown - The dropdown list container.
 * @csspart option - Each option row.
 * @csspart empty - The "no results" row.
 * @csspart chip - Each chip inside the control (tags mode).
 * @csspart chip-prefix - The prefix image/icon inside a chip.
 *
 * @cssprop [--reke-color-primary=#22C55E] - Focus ring and active/selected option color.
 * @cssprop [--reke-color-surface=#1A1A1A] - Input and dropdown background.
 * @cssprop [--reke-color-surface-elevated=#151515] - Option hover/active background.
 * @cssprop [--reke-color-border=#252525] - Input and dropdown border.
 * @cssprop [--reke-color-danger=#EF4444] - Error state border.
 * @cssprop [--reke-color-text=#E5E5E5] - Text color.
 * @cssprop [--reke-color-text-muted=#525252] - Placeholder / empty color.
 * @cssprop [--reke-color-text-label=#8A8A8A] - Label color.
 * @cssprop [--reke-animation-flash=250ms] - Option flash animation duration.
 * @cssprop [--reke-animation-scale-in=200ms] - Chip scale-in animation duration.
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

  /** Enables multi-selection. In this mode use `values` instead of `value`. */
  @property({ type: Boolean, reflect: true })
  multiple = false;

  /** Render selected values as dismissible chips inside the control. Ignored unless `multiple`. */
  @property({ type: Boolean, reflect: true })
  tags = false;

  /** Selected values when `multiple` is set. */
  @property({ attribute: false })
  values: string[] = [];

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

  @state()
  private _flashValue = '';

  @state()
  private _scaleInValues: string[] = [];

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

  /** Comma-joined labels of the current multi-selection (empty if none). */
  private get selectedSummary(): string {
    return this.options
      .filter((opt) => this.values.includes(opt.value))
      .map((opt) => opt.label)
      .join(', ');
  }

  private isSelected(option: ComboboxOption): boolean {
    return this.multiple ? this.values.includes(option.value) : option.value === this.value;
  }

  private get filteredOptions(): ComboboxOption[] {
    const q = this._query.trim().toLowerCase();
    let list = this.options;
    if (this.tags && this.multiple) {
      list = list.filter((opt) => !this.values.includes(opt.value));
    }
    if (q === '') return list;
    return list.filter(
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
    if (this.multiple) {
      const wasAdded = !this.values.includes(option.value);
      this.values = wasAdded
        ? [...this.values, option.value]
        : this.values.filter((v) => v !== option.value);
      this._query = '';
      this._flashValue = option.value;
      if (wasAdded && this.tags) {
        this._scaleInValues = [...this._scaleInValues, option.value];
        setTimeout(() => {
          this._scaleInValues = this._scaleInValues.filter((v) => v !== option.value);
        }, 200);
      }
      setTimeout(() => {
        if (this._flashValue === option.value) this._flashValue = '';
      }, 250);
      this.emit('reke-change', { values: this.values });
      return;
    }
    this.value = option.value;
    this._flashValue = option.value;
    setTimeout(() => {
      if (this._flashValue === option.value) this._flashValue = '';
    }, 250);
    this.close();
    this.emit('reke-change', { value: this.value });
  }

  /** Tags mode: clicking anywhere in the control focuses the input. */
  private handleControlClick() {
    const input = this.shadowRoot?.querySelector('input') as HTMLInputElement | null;
    input?.focus();
  }

  private handleChipDismiss(value: string) {
    if (this.disabled) return;
    this.values = this.values.filter((v) => v !== value);
    this.emit('reke-change', { values: this.values });
    const input = this.shadowRoot?.querySelector('input') as HTMLInputElement | null;
    input?.focus();
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
      case 'Backspace':
        if (this.tags && this.multiple && this._query === '' && this.values.length > 0) {
          this.values = this.values.slice(0, -1);
          this.emit('reke-change', { values: this.values });
        }
        break;
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
    const summary = this.multiple ? this.selectedSummary : this.selectedLabel;
    const inputValue = this.multiple ? this._query : this._open ? this._query : this.selectedLabel;
    const showTags = this.tags && this.multiple;
    // Multiple (non-tags): summary renders as real text overlaid on the input,
    // only when the query is empty — never as placeholder.
    const showSummary = this.multiple && !showTags && this._query === '' && summary !== '';
    const placeholder = this.multiple
      ? showSummary
        ? ''
        : this.placeholder
      : summary || this.placeholder;

    const inputClasses = {
      input: true,
      [`input--${this.size}`]: true,
      'input--error': this.error,
      'input--tags': showTags,
    };

    const controlClasses = {
      control: true,
      'control--tags': showTags,
      'control--error': showTags && this.error,
    };

    // Render chips in selection order so Backspace/Delete target the visually last chip.
    const selectedOptions = this.values
      .map((v) => this.options.find((o) => o.value === v))
      .filter((o): o is (typeof this.options)[number] => !!o);

    return html`
      ${this.label ? html`<label class="label">${this.label}</label>` : nothing}
      <div
        class=${classMap(controlClasses)}
        @click=${showTags ? this.handleControlClick : nothing}
      >
        ${
          showTags
            ? selectedOptions.map(
                (opt) => html`
                  <reke-chip
                    part="chip"
                    dismissible
                    active
                    color="primary"
                    tabindex="-1"
                    ?disabled=${this.disabled}
                    class="${this._scaleInValues.includes(opt.value) ? 'chip--scale-in' : ''}"
                    dismiss-label="Remove ${opt.label}"
                    @reke-dismiss=${() => this.handleChipDismiss(opt.value)}
                  >
                    ${opt.image ? html`<img slot="prefix" src=${opt.image} alt="" loading="lazy" />` : nothing}
                    ${opt.label}
                  </reke-chip>
                `,
              )
            : nothing
        }
        <input
          part="input"
          class=${classMap(inputClasses)}
          type="text"
          role="combobox"
          .value=${inputValue}
          placeholder=${placeholder}
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
        ${
          showSummary
            ? html`<span class="selected-summary selected-summary--${this.size}">${summary}</span>`
            : nothing
        }
      </div>
      ${
        this._open
          ? html`
            <ul
              part="dropdown"
              id="reke-combobox-list"
              class="dropdown"
              role="listbox"
              aria-multiselectable=${this.multiple ? 'true' : nothing}
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
                          'option--selected': this.isSelected(opt),
                          'option--active': i === this._activeIndex,
                          'option--flash': this._flashValue === opt.value,
                        })}
                        role="option"
                        aria-selected=${this.isSelected(opt)}
                        @click=${() => this.selectOption(opt)}
                        @mousemove=${() => {
                          this._activeIndex = i;
                        }}
                      >
                        ${
                          opt.image
                            ? html`<img class="option-img" src=${opt.image} alt="" loading="lazy" />`
                            : nothing
                        }<span class="option-label">${opt.label}</span>${
                          this.multiple && this.isSelected(opt)
                            ? html`<span class="check" aria-hidden="true">&#10003;</span>`
                            : nothing
                        }
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
