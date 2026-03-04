import { describe, it, expect, vi } from 'vitest';
import './reke-date-range.js';
import type { RekeDateRange } from './reke-date-range.js';
import { runAxe } from '../../test-utils/a11y.js';

function createElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.backgroundColor = '#0A0A0B';
  wrapper.style.padding = '16px';
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

async function waitForUpdate(el: RekeDateRange): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

describe('reke-date-range', () => {
  // --- RENDERING ---

  it('renders with default props (range mode)', async () => {
    const wrapper = createElement('<reke-date-range></reke-date-range>');
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    const trigger = el.shadowRoot!.querySelector('.trigger')!;
    expect(trigger).toBeTruthy();
    expect(el.mode).toBe('range');
    expect(el.from).toBe('');
    expect(el.to).toBe('');
    // Calendar should be closed
    expect(el.shadowRoot!.querySelector('.calendar')).toBeNull();

    wrapper.remove();
  });

  it('renders in single mode', async () => {
    const wrapper = createElement(
      '<reke-date-range mode="single"></reke-date-range>',
    );
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    expect(el.mode).toBe('single');
    expect(el.value).toBe('');
    const text = el.shadowRoot!.querySelector('.trigger__text')!;
    expect(text.textContent).toContain('Seleccionar fecha');

    wrapper.remove();
  });

  it('renders label when provided', async () => {
    const wrapper = createElement(
      '<reke-date-range label="Period"></reke-date-range>',
    );
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    const label = el.shadowRoot!.querySelector('.label');
    expect(label).toBeTruthy();
    expect(label!.textContent).toContain('Period');

    wrapper.remove();
  });

  it('displays formatted dates in trigger (range mode)', async () => {
    const wrapper = createElement(
      '<reke-date-range from="2024-01-15" to="2024-02-20"></reke-date-range>',
    );
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    const text = el.shadowRoot!.querySelector('.trigger__text')!;
    expect(text.textContent).toContain('15/01/2024');
    expect(text.textContent).toContain('20/02/2024');

    wrapper.remove();
  });

  it('displays formatted date in trigger (single mode)', async () => {
    const wrapper = createElement(
      '<reke-date-range mode="single" value="2024-06-15"></reke-date-range>',
    );
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    const text = el.shadowRoot!.querySelector('.trigger__text')!;
    expect(text.textContent).toContain('15/06/2024');

    wrapper.remove();
  });

  it('opens calendar dropdown on click', async () => {
    const wrapper = createElement('<reke-date-range></reke-date-range>');
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    const trigger = el.shadowRoot!.querySelector('.trigger')! as HTMLButtonElement;
    trigger.click();
    await waitForUpdate(el);

    expect(el.shadowRoot!.querySelector('.calendar')).toBeTruthy();
    expect(trigger.classList.contains('trigger--open')).toBe(true);

    wrapper.remove();
  });

  it('renders month/year title and weekday headers', async () => {
    const wrapper = createElement('<reke-date-range></reke-date-range>');
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    // Open calendar
    (el.shadowRoot!.querySelector('.trigger')! as HTMLButtonElement).click();
    await waitForUpdate(el);

    const title = el.shadowRoot!.querySelector('.calendar__title')!;
    expect(title.textContent).toBeTruthy();

    const weekdays = el.shadowRoot!.querySelectorAll('.calendar__weekday');
    expect(weekdays.length).toBe(7);
    expect(weekdays[0].textContent).toBe('Lu');

    wrapper.remove();
  });

  it('renders 42 day cells', async () => {
    const wrapper = createElement('<reke-date-range></reke-date-range>');
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    (el.shadowRoot!.querySelector('.trigger')! as HTMLButtonElement).click();
    await waitForUpdate(el);

    const days = el.shadowRoot!.querySelectorAll('.calendar__day');
    expect(days.length).toBe(42);

    wrapper.remove();
  });

  it('does not open when disabled', async () => {
    const wrapper = createElement(
      '<reke-date-range disabled></reke-date-range>',
    );
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    const trigger = el.shadowRoot!.querySelector('.trigger')! as HTMLButtonElement;
    trigger.click();
    await waitForUpdate(el);

    expect(el.shadowRoot!.querySelector('.calendar')).toBeNull();

    wrapper.remove();
  });

  it('shows error style on trigger', async () => {
    const wrapper = createElement(
      '<reke-date-range error></reke-date-range>',
    );
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    const trigger = el.shadowRoot!.querySelector('.trigger')!;
    expect(trigger.classList.contains('trigger--error')).toBe(true);

    wrapper.remove();
  });

  // --- BEHAVIOR ---

  it('selects a single date and emits reke-change', async () => {
    const wrapper = createElement(
      '<reke-date-range mode="single"></reke-date-range>',
    );
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-change', handler);

    // Open calendar
    (el.shadowRoot!.querySelector('.trigger')! as HTMLButtonElement).click();
    await waitForUpdate(el);

    // Click a day that is not other-month
    const days = el.shadowRoot!.querySelectorAll('.calendar__day:not(.calendar__day--other):not(.calendar__day--disabled)');
    (days[10] as HTMLButtonElement).click();
    await waitForUpdate(el);

    expect(handler).toHaveBeenCalledOnce();
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.value).toBeTruthy();
    // Calendar should close
    expect(el.shadowRoot!.querySelector('.calendar')).toBeNull();

    wrapper.remove();
  });

  it('selects a date range with two clicks', async () => {
    const wrapper = createElement('<reke-date-range></reke-date-range>');
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-change', handler);

    // Open calendar
    (el.shadowRoot!.querySelector('.trigger')! as HTMLButtonElement).click();
    await waitForUpdate(el);

    // Get non-other-month days
    const days = el.shadowRoot!.querySelectorAll('.calendar__day:not(.calendar__day--other):not(.calendar__day--disabled)');

    // First click — sets start
    (days[5] as HTMLButtonElement).click();
    await waitForUpdate(el);
    expect(el.from).toBeTruthy();
    expect(el.to).toBe('');
    // Calendar stays open
    expect(el.shadowRoot!.querySelector('.calendar')).toBeTruthy();

    // Second click — sets end
    (days[15] as HTMLButtonElement).click();
    await waitForUpdate(el);
    expect(handler).toHaveBeenCalledOnce();
    expect(el.from).toBeTruthy();
    expect(el.to).toBeTruthy();
    // Calendar closes
    expect(el.shadowRoot!.querySelector('.calendar')).toBeNull();

    wrapper.remove();
  });

  it('auto-swaps from/to when end date is before start', async () => {
    const wrapper = createElement('<reke-date-range></reke-date-range>');
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    // Open calendar
    (el.shadowRoot!.querySelector('.trigger')! as HTMLButtonElement).click();
    await waitForUpdate(el);

    const days = el.shadowRoot!.querySelectorAll('.calendar__day:not(.calendar__day--other):not(.calendar__day--disabled)');

    // Click later day first
    (days[15] as HTMLButtonElement).click();
    await waitForUpdate(el);

    // Click earlier day second
    (days[5] as HTMLButtonElement).click();
    await waitForUpdate(el);

    // from should be earlier, to should be later
    expect(el.from < el.to).toBe(true);

    wrapper.remove();
  });

  it('navigates months with prev/next buttons', async () => {
    const wrapper = createElement('<reke-date-range></reke-date-range>');
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    (el.shadowRoot!.querySelector('.trigger')! as HTMLButtonElement).click();
    await waitForUpdate(el);

    const title = el.shadowRoot!.querySelector('.calendar__title')!;
    const initialTitle = title.textContent;

    // Buttons: [0]=prevYear, [1]=prevMonth, [2]=nextMonth, [3]=nextYear
    const navBtns = el.shadowRoot!.querySelectorAll('.calendar__nav-btn');
    expect(navBtns.length).toBe(4);

    // Click next month
    (navBtns[2] as HTMLButtonElement).click();
    await waitForUpdate(el);
    expect(el.shadowRoot!.querySelector('.calendar__title')!.textContent).not.toBe(initialTitle);

    // Click prev month to go back
    (navBtns[1] as HTMLButtonElement).click();
    await waitForUpdate(el);
    expect(el.shadowRoot!.querySelector('.calendar__title')!.textContent).toBe(initialTitle);

    wrapper.remove();
  });

  it('"Hoy" button sets today in single mode', async () => {
    const wrapper = createElement(
      '<reke-date-range mode="single"></reke-date-range>',
    );
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-change', handler);

    (el.shadowRoot!.querySelector('.trigger')! as HTMLButtonElement).click();
    await waitForUpdate(el);

    const todayBtn = el.shadowRoot!.querySelector('.calendar__action--today')! as HTMLButtonElement;
    todayBtn.click();
    await waitForUpdate(el);

    expect(handler).toHaveBeenCalledOnce();
    expect(el.value).toBeTruthy();
    // Should close
    expect(el.shadowRoot!.querySelector('.calendar')).toBeNull();

    wrapper.remove();
  });

  it('"Limpiar" button clears values', async () => {
    const wrapper = createElement(
      '<reke-date-range from="2024-01-01" to="2024-12-31"></reke-date-range>',
    );
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-change', handler);

    (el.shadowRoot!.querySelector('.trigger')! as HTMLButtonElement).click();
    await waitForUpdate(el);

    const clearBtn = el.shadowRoot!.querySelector('.calendar__action--clear')! as HTMLButtonElement;
    clearBtn.click();
    await waitForUpdate(el);

    expect(el.from).toBe('');
    expect(el.to).toBe('');
    expect(handler).toHaveBeenCalledOnce();

    wrapper.remove();
  });

  it('closes on Escape key', async () => {
    const wrapper = createElement('<reke-date-range></reke-date-range>');
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    (el.shadowRoot!.querySelector('.trigger')! as HTMLButtonElement).click();
    await waitForUpdate(el);
    expect(el.shadowRoot!.querySelector('.calendar')).toBeTruthy();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await waitForUpdate(el);
    expect(el.shadowRoot!.querySelector('.calendar')).toBeNull();

    wrapper.remove();
  });

  it('respects min/max date constraints', async () => {
    const wrapper = createElement(
      '<reke-date-range mode="single" min="2024-06-10" max="2024-06-20"></reke-date-range>',
    );
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    // Set view to June 2024
    (el as any)._viewYear = 2024;
    (el as any)._viewMonth = 5; // June
    (el.shadowRoot!.querySelector('.trigger')! as HTMLButtonElement).click();
    await waitForUpdate(el);

    // Check that some days are disabled
    const disabledDays = el.shadowRoot!.querySelectorAll('.calendar__day[disabled]');
    expect(disabledDays.length).toBeGreaterThan(0);

    wrapper.remove();
  });

  // --- ACCESSIBILITY ---

  it('trigger has aria-haspopup and aria-expanded', async () => {
    const wrapper = createElement('<reke-date-range></reke-date-range>');
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    const trigger = el.shadowRoot!.querySelector('.trigger')! as HTMLButtonElement;
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    trigger.click();
    await waitForUpdate(el);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    wrapper.remove();
  });

  it('calendar has dialog role', async () => {
    const wrapper = createElement('<reke-date-range></reke-date-range>');
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    (el.shadowRoot!.querySelector('.trigger')! as HTMLButtonElement).click();
    await waitForUpdate(el);

    const calendar = el.shadowRoot!.querySelector('.calendar')!;
    expect(calendar.getAttribute('role')).toBe('dialog');
    expect(calendar.getAttribute('aria-label')).toBe('Calendar');

    wrapper.remove();
  });

  it('passes axe-core a11y audit (closed)', async () => {
    const wrapper = createElement(
      '<reke-date-range label="Date"></reke-date-range>',
    );
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const violations = results.violations.filter(
      (v) => v.id !== 'color-contrast',
    );
    expect(violations).toEqual([]);

    wrapper.remove();
  });

  it('passes axe-core a11y audit (open)', async () => {
    const wrapper = createElement(
      '<reke-date-range label="Date"></reke-date-range>',
    );
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    (el.shadowRoot!.querySelector('.trigger')! as HTMLButtonElement).click();
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const violations = results.violations.filter(
      (v) => v.id !== 'color-contrast',
    );
    expect(violations).toEqual([]);

    wrapper.remove();
  });

  it('passes a11y audit for disabled state', async () => {
    const wrapper = createElement(
      '<reke-date-range label="Date" disabled></reke-date-range>',
    );
    const el = wrapper.querySelector('reke-date-range')! as RekeDateRange;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const violations = results.violations.filter(
      (v) => v.id !== 'color-contrast',
    );
    expect(violations).toEqual([]);

    wrapper.remove();
  });
});
