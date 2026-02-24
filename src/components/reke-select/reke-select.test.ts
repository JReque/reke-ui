import { describe, it, expect, vi } from 'vitest';
import './reke-select.js';
import type { RekeSelect } from './reke-select.js';
import { runAxe } from '../../test-utils/a11y.js';

function createElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.backgroundColor = '#0A0A0B';
  wrapper.style.padding = '16px';
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

async function waitForUpdate(el: RekeSelect): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

const testOptions = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
];

describe('reke-select', () => {
  // --- RENDERING ---

  it('renders with default placeholder', async () => {
    const wrapper = createElement('<reke-select></reke-select>');
    const el = wrapper.querySelector('reke-select')! as RekeSelect;
    el.options = testOptions;
    await waitForUpdate(el);

    const trigger = el.shadowRoot!.querySelector('.trigger')!;
    expect(trigger).toBeTruthy();
    expect(trigger.textContent).toContain('Select...');

    wrapper.remove();
  });

  it('shows selected value label', async () => {
    const wrapper = createElement(
      '<reke-select value="b"></reke-select>',
    );
    const el = wrapper.querySelector('reke-select')! as RekeSelect;
    el.options = testOptions;
    await waitForUpdate(el);

    const trigger = el.shadowRoot!.querySelector('.trigger')!;
    expect(trigger.textContent).toContain('Option B');

    wrapper.remove();
  });

  // --- BEHAVIOR ---

  it('opens dropdown on click', async () => {
    const wrapper = createElement('<reke-select></reke-select>');
    const el = wrapper.querySelector('reke-select')! as RekeSelect;
    el.options = testOptions;
    await waitForUpdate(el);

    const trigger = el.shadowRoot!.querySelector('.trigger')! as HTMLElement;
    trigger.click();
    await waitForUpdate(el);

    const dropdown = el.shadowRoot!.querySelector('.dropdown');
    expect(dropdown).toBeTruthy();

    wrapper.remove();
  });

  it('selects an option and emits reke-change', async () => {
    const wrapper = createElement('<reke-select></reke-select>');
    const el = wrapper.querySelector('reke-select')! as RekeSelect;
    el.options = testOptions;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-change', handler);

    // Open dropdown
    const trigger = el.shadowRoot!.querySelector('.trigger')! as HTMLElement;
    trigger.click();
    await waitForUpdate(el);

    // Click first option
    const options = el.shadowRoot!.querySelectorAll('.option');
    (options[0] as HTMLElement).click();
    await waitForUpdate(el);

    expect(el.value).toBe('a');
    expect(handler).toHaveBeenCalledOnce();
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toEqual({
      value: 'a',
    });

    wrapper.remove();
  });

  it('closes dropdown after selection', async () => {
    const wrapper = createElement('<reke-select></reke-select>');
    const el = wrapper.querySelector('reke-select')! as RekeSelect;
    el.options = testOptions;
    await waitForUpdate(el);

    // Open
    const trigger = el.shadowRoot!.querySelector('.trigger')! as HTMLElement;
    trigger.click();
    await waitForUpdate(el);

    // Select
    const options = el.shadowRoot!.querySelectorAll('.option');
    (options[0] as HTMLElement).click();
    await waitForUpdate(el);

    const dropdown = el.shadowRoot!.querySelector('.dropdown');
    expect(dropdown).toBeNull();

    wrapper.remove();
  });

  it('does not open when disabled', async () => {
    const wrapper = createElement(
      '<reke-select disabled></reke-select>',
    );
    const el = wrapper.querySelector('reke-select')! as RekeSelect;
    el.options = testOptions;
    await waitForUpdate(el);

    const trigger = el.shadowRoot!.querySelector('.trigger')! as HTMLElement;
    trigger.click();
    await waitForUpdate(el);

    const dropdown = el.shadowRoot!.querySelector('.dropdown');
    expect(dropdown).toBeNull();

    wrapper.remove();
  });

  // --- ACCESSIBILITY ---

  it('passes axe-core a11y audit', async () => {
    const wrapper = createElement(
      '<reke-select label="Choose option"></reke-select>',
    );
    const el = wrapper.querySelector('reke-select')! as RekeSelect;
    el.options = testOptions;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const violations = results.violations.filter(
      (v) => v.id !== 'color-contrast',
    );
    expect(violations).toEqual([]);

    wrapper.remove();
  });

  it('passes a11y audit for disabled select', async () => {
    const wrapper = createElement(
      '<reke-select label="Choose option" disabled></reke-select>',
    );
    const el = wrapper.querySelector('reke-select')! as RekeSelect;
    el.options = testOptions;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const nonContrastViolations = results.violations.filter(
      (v) => v.id !== 'color-contrast',
    );
    expect(nonContrastViolations).toEqual([]);

    wrapper.remove();
  });
});
