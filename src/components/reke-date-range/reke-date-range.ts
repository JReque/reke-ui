import { html, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { RekeElement } from '../../shared/base-element.js';
import { styles } from './reke-date-range.styles.js';

export type DatePickerMode = 'single' | 'range';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const WEEKDAY_LABELS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

/** Parse YYYY-MM-DD to a local-midnight Date. Returns null for empty/invalid. */
function parseDate(str: string): Date | null {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/** Format a Date to YYYY-MM-DD. */
function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Format a Date to DD/MM/YYYY for display. */
function formatDisplay(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface CalendarDay {
  date: Date;
  day: number;
  otherMonth: boolean;
}

/** Get 42 calendar days (6 weeks) starting from Monday. */
function getCalendarDays(year: number, month: number): CalendarDay[] {
  const first = new Date(year, month, 1);
  // Day of week: 0=Sun .. 6=Sat. We want Monday=0 offset.
  let startOffset = first.getDay() - 1;
  if (startOffset < 0) startOffset = 6;
  const start = new Date(year, month, 1 - startOffset);

  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    days.push({ date: d, day: d.getDate(), otherMonth: d.getMonth() !== month });
  }
  return days;
}

/**
 * @tag reke-date-range
 * @summary A date picker with calendar dropdown. Supports single date and range modes.
 *
 * @fires reke-change - Fired when the date selection changes. Detail depends on mode: single → `{ value: string }`, range → `{ from: string, to: string }`.
 *
 * @csspart trigger - The trigger button element.
 * @csspart calendar - The calendar dropdown container.
 *
 * @cssprop [--reke-color-primary=#22C55E] - Selected day and active state color.
 * @cssprop [--reke-color-surface=#1A1A1A] - Trigger and calendar background.
 * @cssprop [--reke-color-border=#252525] - Border color.
 * @cssprop [--reke-color-danger=#EF4444] - Error state border.
 * @cssprop [--reke-color-text=#E5E5E5] - Text color.
 * @cssprop [--reke-color-text-muted=#525252] - Placeholder and muted text.
 */
@customElement('reke-date-range')
export class RekeDateRange extends RekeElement {
  static override styles = styles;

  /** Picker mode: 'single' for one date, 'range' for from/to. */
  @property({ reflect: true })
  mode: DatePickerMode = 'range';

  /** Selected date (single mode). YYYY-MM-DD. */
  @property()
  value = '';

  /** Range start. YYYY-MM-DD. */
  @property()
  from = '';

  /** Range end. YYYY-MM-DD. */
  @property()
  to = '';

  @property()
  label = '';

  @property()
  placeholder = '';

  /** Minimum selectable date. YYYY-MM-DD. */
  @property()
  min = '';

  /** Maximum selectable date. YYYY-MM-DD. */
  @property()
  max = '';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  error = false;

  @state() private _open = false;
  @state() private _viewYear = new Date().getFullYear();
  @state() private _viewMonth = new Date().getMonth();

  /** For range mode: true while selecting the second click (end date). */
  @state() private _rangeSelecting = false;

  private _boundOutsideClick = this._onOutsideClick.bind(this);

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('click', this._boundOutsideClick, true);
    document.addEventListener('keydown', this._onKeyDown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('click', this._boundOutsideClick, true);
    document.removeEventListener('keydown', this._onKeyDown);
  }

  private _onOutsideClick(e: MouseEvent) {
    if (!this._open) return;
    const path = e.composedPath();
    if (!path.includes(this)) {
      // If user was mid-range-select (picked "from" but not "to"), auto-complete
      if (this._rangeSelecting && this.from) {
        this.to = this.from;
        this._rangeSelecting = false;
        this._open = false;
        this.emit('reke-change', { from: this.from, to: this.to });
        return;
      }
      this._open = false;
      this._rangeSelecting = false;
    }
  }

  private _onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this._open) {
      // If user was mid-range-select, auto-complete with same date
      if (this._rangeSelecting && this.from) {
        this.to = this.from;
        this._rangeSelecting = false;
        this._open = false;
        this.emit('reke-change', { from: this.from, to: this.to });
        return;
      }
      this._open = false;
      this._rangeSelecting = false;
    }
  };

  private _toggleOpen() {
    if (this.disabled) return;
    this._open = !this._open;
    if (this._open) {
      this._syncView();
    } else {
      // If user was mid-range-select, auto-complete with same date
      if (this._rangeSelecting && this.from) {
        this.to = this.from;
        this._rangeSelecting = false;
        this.emit('reke-change', { from: this.from, to: this.to });
        return;
      }
      this._rangeSelecting = false;
    }
  }

  /** Sync calendar view to the current selection. */
  private _syncView() {
    let target: Date | null = null;
    if (this.mode === 'single') {
      target = parseDate(this.value);
    } else {
      target = parseDate(this.from);
    }
    if (target) {
      this._viewYear = target.getFullYear();
      this._viewMonth = target.getMonth();
    } else {
      const now = new Date();
      this._viewYear = now.getFullYear();
      this._viewMonth = now.getMonth();
    }
  }

  private _prevYear() {
    this._viewYear--;
  }

  private _nextYear() {
    this._viewYear++;
  }

  private _prevMonth() {
    if (this._viewMonth === 0) {
      this._viewMonth = 11;
      this._viewYear--;
    } else {
      this._viewMonth--;
    }
  }

  private _nextMonth() {
    if (this._viewMonth === 11) {
      this._viewMonth = 0;
      this._viewYear++;
    } else {
      this._viewMonth++;
    }
  }

  private _isDisabledDate(date: Date): boolean {
    const minDate = parseDate(this.min);
    const maxDate = parseDate(this.max);
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  }

  private _selectDay(day: CalendarDay) {
    if (this._isDisabledDate(day.date)) return;

    if (this.mode === 'single') {
      this.value = toISO(day.date);
      this._open = false;
      this.emit('reke-change', { value: this.value });
      return;
    }

    // Range mode
    if (!this._rangeSelecting) {
      // First click: set start
      this.from = toISO(day.date);
      this.to = '';
      this._rangeSelecting = true;
    } else {
      // Second click: set end
      let from = parseDate(this.from)!;
      let to = day.date;
      // Auto-swap if end < start
      if (to < from) {
        [from, to] = [to, from];
      }
      this.from = toISO(from);
      this.to = toISO(to);
      this._rangeSelecting = false;
      this._open = false;
      this.emit('reke-change', { from: this.from, to: this.to });
    }
  }

  private _goToday() {
    const today = new Date();
    const todayStr = toISO(today);
    this._viewYear = today.getFullYear();
    this._viewMonth = today.getMonth();

    if (this.mode === 'single') {
      this.value = todayStr;
      this._open = false;
      this.emit('reke-change', { value: this.value });
    } else if (this._rangeSelecting && this.from) {
      // Mid-range-select: "from" is already set, use today as "to"
      let from = parseDate(this.from)!;
      let to = today;
      if (to < from) [from, to] = [to, from];
      this.from = toISO(from);
      this.to = toISO(to);
      this._rangeSelecting = false;
      this._open = false;
      this.emit('reke-change', { from: this.from, to: this.to });
    } else {
      // No selection yet: set both from and to to today
      this.from = todayStr;
      this.to = todayStr;
      this._rangeSelecting = false;
      this._open = false;
      this.emit('reke-change', { from: this.from, to: this.to });
    }
  }

  private _clear() {
    if (this.mode === 'single') {
      this.value = '';
      this.emit('reke-change', { value: '' });
    } else {
      this.from = '';
      this.to = '';
      this._rangeSelecting = false;
      this.emit('reke-change', { from: '', to: '' });
    }
    this._open = false;
  }

  private _getDayClasses(day: CalendarDay): Record<string, boolean> {
    const today = new Date();
    const isToday = isSameDay(day.date, today);
    const isDisabled = this._isDisabledDate(day.date);

    if (this.mode === 'single') {
      const selected = parseDate(this.value);
      return {
        calendar__day: true,
        'calendar__day--other': day.otherMonth,
        'calendar__day--today': isToday,
        'calendar__day--selected': !!selected && isSameDay(day.date, selected),
        'calendar__day--disabled': isDisabled,
      };
    }

    // Range mode
    const fromDate = parseDate(this.from);
    const toDate = parseDate(this.to);
    const isRangeStart = !!fromDate && isSameDay(day.date, fromDate);
    const isRangeEnd = !!toDate && isSameDay(day.date, toDate);
    const inRange = !!fromDate && !!toDate && day.date > fromDate && day.date < toDate;

    return {
      calendar__day: true,
      'calendar__day--other': day.otherMonth,
      'calendar__day--today': isToday && !isRangeStart && !isRangeEnd,
      'calendar__day--selected': this.mode === 'range' ? false : false,
      'calendar__day--in-range': inRange,
      'calendar__day--range-start': isRangeStart,
      'calendar__day--range-end': isRangeEnd,
      'calendar__day--disabled': isDisabled,
    };
  }

  private _getDisplayText(): TemplateResult | string {
    if (this.mode === 'single') {
      const d = parseDate(this.value);
      return d ? formatDisplay(d) : (this.placeholder || 'Seleccionar fecha');
    }

    const fromDate = parseDate(this.from);
    const toDate = parseDate(this.to);

    if (!fromDate && !toDate) {
      return this.placeholder || 'Seleccionar rango';
    }

    const fromStr = fromDate ? formatDisplay(fromDate) : '—';
    const toStr = toDate ? formatDisplay(toDate) : '—';
    return html`${fromStr} <span class="trigger__separator">→</span> ${toStr}`;
  }

  private _hasValue(): boolean {
    if (this.mode === 'single') return !!this.value;
    return !!(this.from || this.to);
  }

  private _renderCalendarIcon(): TemplateResult {
    return html`
      <span class="trigger__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      </span>
    `;
  }

  private _renderChevron(): TemplateResult {
    return html`
      <span class="trigger__chevron" aria-hidden="true">
        <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
      </span>
    `;
  }

  override render() {
    const days = getCalendarDays(this._viewYear, this._viewMonth);
    const isPlaceholder = !this._hasValue();
    const title = `${MONTH_NAMES[this._viewMonth]} ${this._viewYear}`;

    const triggerClasses = {
      trigger: true,
      'trigger--open': this._open,
      'trigger--error': this.error,
      'trigger--placeholder': isPlaceholder,
    };

    const labelClasses = {
      label: true,
      'label--active': this._open,
    };

    return html`
      ${this.label ? html`<span class=${classMap(labelClasses)}>${this.label}</span>` : nothing}

      <button
        part="trigger"
        class=${classMap(triggerClasses)}
        type="button"
        @click=${this._toggleOpen}
        aria-haspopup="dialog"
        aria-expanded=${this._open}
        ?disabled=${this.disabled}
      >
        ${this._renderCalendarIcon()}
        <span class="trigger__text">${this._getDisplayText()}</span>
        ${this._renderChevron()}
      </button>

      ${this._open
        ? html`
            <div part="calendar" class="calendar" role="dialog" aria-label="Calendar">
              <div class="calendar__header">
                <span class="calendar__title">${title}</span>
                <div class="calendar__nav">
                  <button
                    class="calendar__nav-btn"
                    type="button"
                    @click=${this._prevYear}
                    aria-label="Previous year"
                  >
                    <svg viewBox="0 0 24 24"><polyline points="17 18 11 12 17 6"/><polyline points="11 18 5 12 11 6"/></svg>
                  </button>
                  <button
                    class="calendar__nav-btn"
                    type="button"
                    @click=${this._prevMonth}
                    aria-label="Previous month"
                  >
                    <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <button
                    class="calendar__nav-btn"
                    type="button"
                    @click=${this._nextMonth}
                    aria-label="Next month"
                  >
                    <svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>
                  </button>
                  <button
                    class="calendar__nav-btn"
                    type="button"
                    @click=${this._nextYear}
                    aria-label="Next year"
                  >
                    <svg viewBox="0 0 24 24"><polyline points="7 6 13 12 7 18"/><polyline points="13 6 19 12 13 18"/></svg>
                  </button>
                </div>
              </div>

              <div class="calendar__weekdays">
                ${WEEKDAY_LABELS.map(
                  (wd) => html`<span class="calendar__weekday">${wd}</span>`,
                )}
              </div>

              <div class="calendar__grid">
                ${days.map(
                  (day) => html`
                    <button
                      class=${classMap(this._getDayClasses(day))}
                      type="button"
                      @click=${() => this._selectDay(day)}
                      ?disabled=${this._isDisabledDate(day.date)}
                      aria-label="${day.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}"
                    >
                      ${day.day}
                    </button>
                  `,
                )}
              </div>

              <div class="calendar__footer">
                <button class="calendar__action calendar__action--today" type="button" @click=${this._goToday}>
                  Hoy
                </button>
                <button class="calendar__action calendar__action--clear" type="button" @click=${this._clear}>
                  Limpiar
                </button>
              </div>
            </div>
          `
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reke-date-range': RekeDateRange;
  }
}
