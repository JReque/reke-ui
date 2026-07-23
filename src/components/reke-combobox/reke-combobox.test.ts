import { describe, expect, it, vi } from 'vitest';
import './reke-combobox.js';
import { runAxe } from '../../test-utils/a11y.js';
import type { RekeCombobox } from './reke-combobox.js';

function createElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.backgroundColor = '#0A0A0B';
  wrapper.style.padding = '16px';
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

async function waitForUpdate(el: RekeCombobox): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

const testOptions = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Cherry' },
];

describe('reke-combobox', () => {
  // --- RENDERING ---

  it('renders with default placeholder', async () => {
    const wrapper = createElement('<reke-combobox></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    await waitForUpdate(el);

    const input = el.shadowRoot!.querySelector('input')! as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.placeholder).toBe('Buscar...');

    wrapper.remove();
  });

  it('shows selected value label', async () => {
    const wrapper = createElement('<reke-combobox value="b"></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    await waitForUpdate(el);

    const input = el.shadowRoot!.querySelector('input')! as HTMLInputElement;
    expect(input.value).toBe('Option B');

    wrapper.remove();
  });

  // --- BEHAVIOR ---

  it('opens dropdown on click', async () => {
    const wrapper = createElement('<reke-combobox></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    await waitForUpdate(el);

    const input = el.shadowRoot!.querySelector('input')! as HTMLElement;
    input.click();
    await waitForUpdate(el);

    const dropdown = el.shadowRoot!.querySelector('.dropdown');
    expect(dropdown).toBeTruthy();

    wrapper.remove();
  });

  it('filters options as the user types', async () => {
    const wrapper = createElement('<reke-combobox></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    await waitForUpdate(el);

    const input = el.shadowRoot!.querySelector('input')! as HTMLInputElement;
    input.click();
    await waitForUpdate(el);

    input.value = 'cher';
    input.dispatchEvent(new Event('input'));
    await waitForUpdate(el);

    const options = el.shadowRoot!.querySelectorAll('.option');
    expect(options.length).toBe(1);
    expect(options[0].textContent).toContain('Cherry');

    wrapper.remove();
  });

  it('shows empty text when no options match', async () => {
    const wrapper = createElement('<reke-combobox></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    await waitForUpdate(el);

    const input = el.shadowRoot!.querySelector('input')! as HTMLInputElement;
    input.click();
    await waitForUpdate(el);

    input.value = 'zzz';
    input.dispatchEvent(new Event('input'));
    await waitForUpdate(el);

    const empty = el.shadowRoot!.querySelector('.empty');
    expect(empty).toBeTruthy();
    expect(empty!.textContent).toContain('Sin resultados');

    wrapper.remove();
  });

  it('emits reke-search on query change', async () => {
    const wrapper = createElement('<reke-combobox></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-search', handler);

    const input = el.shadowRoot!.querySelector('input')! as HTMLInputElement;
    input.value = 'op';
    input.dispatchEvent(new Event('input'));
    await waitForUpdate(el);

    expect(handler).toHaveBeenCalledOnce();
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toEqual({
      query: 'op',
    });

    wrapper.remove();
  });

  it('selects an option and emits reke-change', async () => {
    const wrapper = createElement('<reke-combobox></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-change', handler);

    const input = el.shadowRoot!.querySelector('input')! as HTMLElement;
    input.click();
    await waitForUpdate(el);

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
    const wrapper = createElement('<reke-combobox></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    await waitForUpdate(el);

    const input = el.shadowRoot!.querySelector('input')! as HTMLElement;
    input.click();
    await waitForUpdate(el);

    const options = el.shadowRoot!.querySelectorAll('.option');
    (options[0] as HTMLElement).click();
    await waitForUpdate(el);

    const dropdown = el.shadowRoot!.querySelector('.dropdown');
    expect(dropdown).toBeNull();

    wrapper.remove();
  });

  it('selects the active option with Enter', async () => {
    const wrapper = createElement('<reke-combobox></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    await waitForUpdate(el);

    const input = el.shadowRoot!.querySelector('input')! as HTMLElement;
    input.click();
    await waitForUpdate(el);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await waitForUpdate(el);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await waitForUpdate(el);

    expect(el.value).toBe('b');

    wrapper.remove();
  });

  it('closes dropdown on Escape', async () => {
    const wrapper = createElement('<reke-combobox></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    await waitForUpdate(el);

    const input = el.shadowRoot!.querySelector('input')! as HTMLElement;
    input.click();
    await waitForUpdate(el);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await waitForUpdate(el);

    const dropdown = el.shadowRoot!.querySelector('.dropdown');
    expect(dropdown).toBeNull();

    wrapper.remove();
  });

  it('does not open when disabled', async () => {
    const wrapper = createElement('<reke-combobox disabled></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    await waitForUpdate(el);

    const input = el.shadowRoot!.querySelector('input')! as HTMLElement;
    input.click();
    await waitForUpdate(el);

    const dropdown = el.shadowRoot!.querySelector('.dropdown');
    expect(dropdown).toBeNull();

    wrapper.remove();
  });

  // --- MULTISELECT ---

  it('toggles values and keeps the dropdown open in multiple mode', async () => {
    const wrapper = createElement('<reke-combobox multiple></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-change', handler);

    const input = el.shadowRoot!.querySelector('input')! as HTMLElement;
    input.click();
    await waitForUpdate(el);

    let options = el.shadowRoot!.querySelectorAll('.option');
    (options[0] as HTMLElement).click();
    await waitForUpdate(el);
    (options[2] as HTMLElement).click();
    await waitForUpdate(el);

    expect(el.values).toEqual(['a', 'c']);
    const lastCall = handler.mock.calls[handler.mock.calls.length - 1];
    expect((lastCall[0] as CustomEvent).detail).toEqual({
      values: ['a', 'c'],
    });
    // Dropdown stays open for further picks.
    expect(el.shadowRoot!.querySelector('.dropdown')).toBeTruthy();

    // Toggling an already-selected value removes it.
    options = el.shadowRoot!.querySelectorAll('.option');
    (options[0] as HTMLElement).click();
    await waitForUpdate(el);
    expect(el.values).toEqual(['c']);

    wrapper.remove();
  });

  it('shows the selected summary as placeholder when closed', async () => {
    const wrapper = createElement('<reke-combobox multiple></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    el.values = ['a', 'b'];
    await waitForUpdate(el);

    const input = el.shadowRoot!.querySelector('input')! as HTMLInputElement;
    expect(input.placeholder).toBe('Option A, Option B');

    wrapper.remove();
  });

  it('marks selected options with aria-selected in multiple mode', async () => {
    const wrapper = createElement('<reke-combobox multiple></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    el.values = ['b'];
    await waitForUpdate(el);

    const input = el.shadowRoot!.querySelector('input')! as HTMLElement;
    input.click();
    await waitForUpdate(el);

    const listbox = el.shadowRoot!.querySelector('.dropdown')!;
    expect(listbox.getAttribute('aria-multiselectable')).toBe('true');
    const selected = listbox.querySelectorAll('[aria-selected="true"]');
    expect(selected.length).toBe(1);
    expect(selected[0].textContent).toContain('Option B');

    wrapper.remove();
  });

  // --- ACCESSIBILITY ---

  it('passes axe-core a11y audit', async () => {
    const wrapper = createElement('<reke-combobox label="Choose option"></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const violations = results.violations.filter((v) => v.id !== 'color-contrast');
    expect(violations).toEqual([]);

    wrapper.remove();
  });

  it('passes a11y audit for disabled combobox', async () => {
    const wrapper = createElement('<reke-combobox label="Choose option" disabled></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const nonContrastViolations = results.violations.filter((v) => v.id !== 'color-contrast');
    expect(nonContrastViolations).toEqual([]);

    wrapper.remove();
  });
});
