import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-badge.styles.js';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'warning'
  | 'success';

export type BadgeSize = 'sm' | 'md';

/**
 * @tag reke-badge
 * @summary A badge component for displaying labels, statuses, and counts.
 *
 * @slot - Default slot for badge text.
 *
 * @csspart badge - The inner badge element.
 *
 * @cssprop [--reke-color-surface=#1A1A1A] - Default variant background color.
 * @cssprop [--reke-color-text=#E5E5E5] - Default variant text color.
 * @cssprop [--reke-color-border=#252525] - Default variant border color.
 * @cssprop [--reke-color-primary=#22C55E] - Primary/success variant accent color.
 * @cssprop [--reke-color-danger=#EF4444] - Danger variant accent color.
 */
@customElement('reke-badge')
export class RekeBadge extends RekeElement {
  static override styles = styles;

  @property({ reflect: true })
  variant: BadgeVariant = 'default';

  @property({ reflect: true })
  size: BadgeSize = 'md';

  override render() {
    const classes = {
      badge: true,
      [`badge--${this.variant}`]: true,
      [`badge--${this.size}`]: true,
    };

    return html`
      <span part="badge" class=${classMap(classes)}>
        <slot></slot>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-badge': RekeBadge;
  }
}
