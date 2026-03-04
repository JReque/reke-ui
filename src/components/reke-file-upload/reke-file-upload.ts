import { html, nothing } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-file-upload.styles.js';

/**
 * @tag reke-file-upload
 * @summary A drag-and-drop file upload zone with click-to-browse.
 *
 * @fires reke-file-select - Fired when a file is selected (drop or browse). Detail: `{ file: File }`.
 * @fires reke-file-clear - Fired when the selected file is cleared.
 *
 * @csspart dropzone - The outer dropzone container.
 *
 * @cssprop [--reke-color-primary=#22C55E] - Drag highlight and file name color.
 * @cssprop [--reke-color-surface=#1A1A1A] - Background.
 * @cssprop [--reke-color-border=#252525] - Border color.
 * @cssprop [--reke-color-danger=#EF4444] - Error state color.
 * @cssprop [--reke-color-text=#E5E5E5] - Primary text color.
 * @cssprop [--reke-color-text-disabled=#3B3B3B] - Hint text color.
 */
@customElement('reke-file-upload')
export class RekeFileUpload extends RekeElement {
  static override styles = styles;

  /** Comma-separated MIME types or extensions, e.g. ".csv,.xlsx" */
  @property()
  accept = '';

  @property()
  hint = '';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  error = false;

  @property({ attribute: 'error-message' })
  errorMessage = '';

  /** Use compact single-row layout */
  @property({ type: Boolean, reflect: true })
  compact = false;

  @state()
  private _dragging = false;

  @state()
  private _fileName = '';

  @query('input[type="file"]')
  private _input!: HTMLInputElement;

  private handleClick() {
    if (this.disabled) return;
    this._input.click();
  }

  private handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.disabled) this._dragging = true;
  }

  private handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this._dragging = false;
  }

  private handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this._dragging = false;
    if (this.disabled) return;

    const file = e.dataTransfer?.files[0];
    if (file) {
      this._fileName = file.name;
      this.emit('reke-file-select', { file });
    }
  }

  private handleInputChange() {
    const file = this._input.files?.[0];
    if (file) {
      this._fileName = file.name;
      this.emit('reke-file-select', { file });
    }
  }

  /** Clear the selected file programmatically. */
  clear() {
    this._fileName = '';
    if (this._input) this._input.value = '';
    this.emit('reke-file-clear');
  }

  override render() {
    const classes = {
      dropzone: true,
      'dropzone--dragging': this._dragging,
      'dropzone--error': this.error,
      'dropzone--compact': this.compact,
    };

    return html`
      <div
        part="dropzone"
        class=${classMap(classes)}
        @click=${this.handleClick}
        @dragover=${this.handleDragOver}
        @dragleave=${this.handleDragLeave}
        @drop=${this.handleDrop}
        role="button"
        tabindex="0"
        aria-label="Upload file"
        @keydown=${(e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleClick();
          }
        }}
      >
        <div class="icon" aria-hidden="true">&#8593;</div>
        <div class="text">
          ${this._fileName
            ? html`<span class="text__file">${this._fileName}</span>`
            : html`<span class="text__primary">
                ${this._dragging ? 'drop file here' : 'drag or select file'}
              </span>`}
          ${this.error && this.errorMessage
            ? html`<span class="text__error">${this.errorMessage}</span>`
            : this.hint
              ? html`<span class="text__secondary">${this.hint}</span>`
              : nothing}
        </div>
      </div>
      <input
        type="file"
        accept=${this.accept || nothing}
        @change=${this.handleInputChange}
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-file-upload': RekeFileUpload;
  }
}
