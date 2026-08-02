import { html, nothing, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-progress.styles.js';

export type RekeProgressSegment = {
  value: number;
  color: string;
};

const MAX_SEGMENTS = 3;

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/**
 * @tag reke-progress
 * @summary A thin progress bar supporting single-value, multi-segment, and indeterminate modes.
 *
 * @csspart track - The outer track element carrying the progressbar role.
 * @csspart segment - Each filled segment inside the track.
 *
 * @cssprop [--reke-progress-height=4px] - Height of the bar.
 * @cssprop [--reke-progress-radius=9999px] - Border radius of the track and segments.
 * @cssprop [--reke-progress-track-color=#2A2A2A] - Background color of the empty track.
 * @cssprop [--reke-progress-color=#22C55E] - Default fill color when `color` is not set.
 */
@customElement('reke-progress')
export class RekeProgress extends RekeElement {
  static override styles = styles;

  /**
   * Fill percentage used in single-bar mode. Normalized to 0-100 on update, so
   * the property and its reflected attribute always match what is rendered.
   * Non-finite input becomes 0.
   */
  @property({ type: Number, reflect: true })
  value = 0;

  /** Fill color for single-bar and indeterminate modes. Empty means the token default. */
  @property({ reflect: true })
  color = '';

  /**
   * Multi-segment mode. Max 3 segments; each value is that segment's width in percent.
   * A NON-EMPTY array takes precedence over `value`; an empty array renders the
   * single-value bar.
   */
  @property({ attribute: false })
  segments: RekeProgressSegment[] = [];

  /** Animated loading bar. Ignores `value` and `segments`. */
  @property({ type: Boolean, reflect: true })
  indeterminate = false;

  /**
   * Mirror of the host `aria-label` attribute, forwarded to the inner progressbar.
   * Declared as a reactive property (not a public API prop) so Lit observes the
   * attribute and re-renders when it changes. The name differs from the native
   * `ariaLabel` DOM property to avoid fighting native ARIA reflection.
   */
  @property({ attribute: 'aria-label' })
  private hostLabel: string | null = null;

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('value')) {
      // Normalize here so the property and its reflected attribute agree with the
      // rendered bar. Assigning inside willUpdate does not schedule another update.
      const normalized = clamp(Number(this.value));
      if (this.value !== normalized) this.value = normalized;
    }
  }

  /** Visible segments with accumulated width clamped at 100%. */
  private resolveSegments(): { list: RekeProgressSegment[]; total: number } {
    let total = 0;
    const list = this.segments.slice(0, MAX_SEGMENTS).map((segment) => {
      const width = Math.min(clamp(segment.value), 100 - total);
      total += width;
      return { value: width, color: segment.color };
    });
    return { list, total };
  }

  override render() {
    const { list, total } = this.resolveSegments();
    const hasSegments = list.length > 0;
    const singleValue = clamp(this.value);

    // ARIA spec: indeterminate progressbars must omit aria-valuenow.
    const valueNow = this.indeterminate ? nothing : hasSegments ? total : singleValue;

    // ponytail: aria-label is mirrored from the host so consumers can name the bar
    // without a dedicated prop.
    const label = this.hostLabel;

    return html`
      <div
        part="track"
        class="track"
        role="progressbar"
        aria-label=${label ?? nothing}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow=${valueNow}
      >
        ${
          this.indeterminate
            ? html`<div
              part="segment"
              class="segment segment--indeterminate"
              style=${styleMap({ backgroundColor: this.color || undefined })}
            ></div>`
            : hasSegments
              ? list.map(
                  (segment) => html`<div
                  part="segment"
                  class="segment"
                  style=${styleMap({
                    width: `${segment.value}%`,
                    backgroundColor: segment.color || undefined,
                  })}
                ></div>`,
                )
              : html`<div
                part="segment"
                class="segment"
                style=${styleMap({
                  width: `${singleValue}%`,
                  backgroundColor: this.color || undefined,
                })}
              ></div>`
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-progress': RekeProgress;
  }
}
