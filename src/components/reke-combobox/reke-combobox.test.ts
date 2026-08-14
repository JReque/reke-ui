import { html } from 'lit';
import { describe, expect, it, vi } from 'vitest';
import './reke-combobox.js';
import '../reke-chip/reke-chip.js';
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

  it('optionRender can return a TemplateResult', async () => {
    const wrapper = createElement('<reke-combobox></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    el.optionRender = (opt, i) =>
      html`<div class="custom-tpl" data-index=${i}><strong>${opt.label}</strong></div>`;
    await waitForUpdate(el);

    el.shadowRoot!.querySelector('input')!.click();
    await waitForUpdate(el);

    const custom = el.shadowRoot!.querySelectorAll('.option .custom-tpl');
    expect(custom.length).toBe(3);
    expect(custom[0]!.textContent).toBe('Option A');
    expect(custom[2]!.getAttribute('data-index')).toBe('2');
    // Default content is replaced, the li itself is still component-owned.
    expect(el.shadowRoot!.querySelector('.option-label')).toBeNull();
    expect(el.shadowRoot!.querySelector('.option')!.getAttribute('role')).toBe('option');

    wrapper.remove();
  });

  it('optionRender can return a plain string', async () => {
    const wrapper = createElement('<reke-combobox></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    el.optionRender = (opt) => `>> ${opt.value}`;
    await waitForUpdate(el);

    el.shadowRoot!.querySelector('input')!.click();
    await waitForUpdate(el);

    const options = el.shadowRoot!.querySelectorAll('.option');
    expect(options[0]!.textContent!.trim()).toBe('>> a');

    wrapper.remove();
  });

  it('optionRender can return a raw HTMLElement', async () => {
    const wrapper = createElement('<reke-combobox></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    el.optionRender = (opt) => {
      const node = document.createElement('span');
      node.className = 'raw-node';
      node.textContent = opt.label.toUpperCase();
      return node;
    };
    await waitForUpdate(el);

    el.shadowRoot!.querySelector('input')!.click();
    await waitForUpdate(el);

    const raw = el.shadowRoot!.querySelectorAll('.option .raw-node');
    expect(raw.length).toBe(3);
    expect(raw[1]!.textContent).toBe('OPTION B');

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

  it('selects when clicking custom-rendered option content', async () => {
    const wrapper = createElement('<reke-combobox></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    el.optionRender = (opt) => html`<span class="custom-hit">${opt.label}</span>`;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-change', handler);

    el.shadowRoot!.querySelector('input')!.click();
    await waitForUpdate(el);

    // Click the inner custom node, not the li — the li handler must still catch it.
    (el.shadowRoot!.querySelectorAll('.custom-hit')[1] as HTMLElement).click();
    await waitForUpdate(el);

    expect(el.value).toBe('b');
    expect(handler).toHaveBeenCalledTimes(1);
    expect((handler.mock.calls[0]![0] as CustomEvent).detail).toEqual({ value: 'b' });

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

  it('shows the selected summary as overlay text when the query is empty', async () => {
    const wrapper = createElement('<reke-combobox multiple></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    el.values = ['a', 'b'];
    await waitForUpdate(el);

    const input = el.shadowRoot!.querySelector('input')! as HTMLInputElement;
    // The native placeholder must be empty while the summary overlay is visible,
    // otherwise both texts render on top of each other.
    expect(input.placeholder).toBe('');
    const summary = el.shadowRoot!.querySelector('.selected-summary');
    expect(summary).toBeTruthy();
    expect(summary!.textContent).toBe('Option A, Option B');
    expect(summary!.classList.contains(`selected-summary--${el.size}`)).toBe(true);

    wrapper.remove();
  });

  it('hides the selected summary while typing', async () => {
    const wrapper = createElement('<reke-combobox multiple></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    el.values = ['a', 'b'];
    await waitForUpdate(el);

    const input = el.shadowRoot!.querySelector('input')! as HTMLInputElement;
    input.value = 'cher';
    input.dispatchEvent(new Event('input'));
    await waitForUpdate(el);

    expect(el.shadowRoot!.querySelector('.selected-summary')).toBeNull();

    wrapper.remove();
  });

  it('shows the placeholder and no summary when nothing is selected in multiple mode', async () => {
    const wrapper = createElement(
      '<reke-combobox multiple placeholder="Pick items..."></reke-combobox>',
    );
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    await waitForUpdate(el);

    const input = el.shadowRoot!.querySelector('input')! as HTMLInputElement;
    expect(input.placeholder).toBe('Pick items...');
    expect(el.shadowRoot!.querySelector('.selected-summary')).toBeNull();

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

  // --- TAGS ---

  it('renders chips for selected values in tags mode', async () => {
    const wrapper = createElement('<reke-combobox multiple tags></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    el.values = ['a', 'c'];
    await waitForUpdate(el);

    const chips = el.shadowRoot!.querySelectorAll('reke-chip');
    expect(chips.length).toBe(2);
    expect(chips[0].textContent).toContain('Option A');
    expect(chips[1].textContent).toContain('Cherry');

    wrapper.remove();
  });

  it('ignores tags in single mode', async () => {
    const wrapper = createElement('<reke-combobox tags value="b"></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    await waitForUpdate(el);

    const chips = el.shadowRoot!.querySelectorAll('reke-chip');
    expect(chips.length).toBe(0);

    wrapper.remove();
  });

  it('renders prefix image in chip when option has image', async () => {
    const wrapper = createElement('<reke-combobox multiple tags></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = [
      { value: 'btc', label: 'Bitcoin', image: 'data:image/svg+xml,<svg/>' },
      ...testOptions,
    ];
    el.values = ['btc'];
    await waitForUpdate(el);

    const chip = el.shadowRoot!.querySelector('reke-chip')!;
    const img = chip.querySelector('img[slot="prefix"]') as HTMLImageElement | null;
    expect(img).toBeTruthy();
    expect(img!.src).toBe('data:image/svg+xml,<svg/>');

    wrapper.remove();
  });

  it('hides selected options from dropdown in tags mode', async () => {
    const wrapper = createElement('<reke-combobox multiple tags></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    el.values = ['a'];
    await waitForUpdate(el);

    const input = el.shadowRoot!.querySelector('input')! as HTMLElement;
    input.click();
    await waitForUpdate(el);

    const options = el.shadowRoot!.querySelectorAll('.option');
    const values = Array.from(options).map((o) => o.getAttribute('aria-selected'));
    expect(values).not.toContain('true');
    expect(options.length).toBe(testOptions.length - 1);

    wrapper.remove();
  });

  it('uses placeholder instead of selectedSummary in tags mode', async () => {
    const wrapper = createElement(
      '<reke-combobox multiple tags placeholder="Pick items..."></reke-combobox>',
    );
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    el.values = ['a', 'b'];
    await waitForUpdate(el);

    const input = el.shadowRoot!.querySelector('input')! as HTMLInputElement;
    expect(input.placeholder).toBe('Pick items...');
    expect(el.shadowRoot!.querySelector('.selected-summary')).toBeNull();

    wrapper.remove();
  });

  it('removes last tag on Backspace when input is empty', async () => {
    const wrapper = createElement('<reke-combobox multiple tags></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    el.values = ['a', 'b'];
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-change', handler);

    const input = el.shadowRoot!.querySelector('input')! as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    await waitForUpdate(el);

    expect(el.values).toEqual(['a']);
    expect(handler).toHaveBeenCalledOnce();
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toEqual({
      values: ['a'],
    });

    wrapper.remove();
  });

  it('does not remove tag on Backspace when input has text', async () => {
    const wrapper = createElement('<reke-combobox multiple tags></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    el.values = ['a', 'b'];
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-change', handler);

    const input = el.shadowRoot!.querySelector('input')! as HTMLInputElement;
    input.value = 'qu';
    input.dispatchEvent(new Event('input'));
    await waitForUpdate(el);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    await waitForUpdate(el);

    expect(el.values).toEqual(['a', 'b']);
    expect(handler).not.toHaveBeenCalled();

    wrapper.remove();
  });

  it('removes specific tag on chip dismiss and returns focus', async () => {
    const wrapper = createElement('<reke-combobox multiple tags></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    el.values = ['a', 'b', 'c'];
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-change', handler);

    const chips = el.shadowRoot!.querySelectorAll('reke-chip');
    const middleChip = chips[1];
    const dismissBtn = middleChip.shadowRoot!.querySelector('.chip__dismiss')! as HTMLElement;
    dismissBtn.click();
    await waitForUpdate(el);

    expect(el.values).toEqual(['a', 'c']);
    expect(handler).toHaveBeenCalledOnce();
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toEqual({
      values: ['a', 'c'],
    });

    const input = el.shadowRoot!.querySelector('input')! as HTMLInputElement;
    expect(el.shadowRoot!.activeElement).toBe(input);

    wrapper.remove();
  });

  // --- ACCESSIBILITY ---

  it('passes axe-core with optionRender and keeps aria-activedescendant resolvable', async () => {
    const wrapper = createElement('<reke-combobox label="Choose option"></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    el.optionRender = (opt) =>
      html`<div class="rich"><span>${opt.label}</span><small>${opt.value}</small></div>`;
    await waitForUpdate(el);

    const input = el.shadowRoot!.querySelector('input')! as HTMLInputElement;
    input.click();
    await waitForUpdate(el);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await waitForUpdate(el);

    const activeId = input.getAttribute('aria-activedescendant');
    expect(activeId).toBe('reke-combobox-opt-1');
    const activeOption = el.shadowRoot!.getElementById(activeId!);
    expect(activeOption).toBeTruthy();
    expect(activeOption!.getAttribute('role')).toBe('option');
    expect(activeOption!.classList.contains('option--active')).toBe(true);

    const results = await runAxe(wrapper);
    const violations = results.violations.filter((v) => v.id !== 'color-contrast');
    expect(violations).toEqual([]);

    wrapper.remove();
  });

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

  it('passes axe-core for tags mode', async () => {
    const wrapper = createElement('<reke-combobox label="Tags" multiple tags></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    el.values = ['a', 'b'];
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const nonContrastViolations = results.violations.filter((v) => v.id !== 'color-contrast');
    expect(nonContrastViolations).toEqual([]);

    wrapper.remove();
  });

  it('passes axe-core for disabled tags mode', async () => {
    const wrapper = createElement(
      '<reke-combobox label="Tags" multiple tags disabled></reke-combobox>',
    );
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    el.values = ['a'];
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const nonContrastViolations = results.violations.filter((v) => v.id !== 'color-contrast');
    expect(nonContrastViolations).toEqual([]);

    wrapper.remove();
  });

  it('chip dismiss button has contextual aria-label in tags mode', async () => {
    const wrapper = createElement('<reke-combobox multiple tags></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    el.values = ['a'];
    await waitForUpdate(el);

    const chip = el.shadowRoot!.querySelector('reke-chip')!;
    expect(chip.hasAttribute('aria-label')).toBe(false);
    expect(chip.getAttribute('dismiss-label')).toBe('Remove Option A');

    const dismissBtn = chip.shadowRoot!.querySelector('.chip__dismiss')!;
    expect(dismissBtn.getAttribute('aria-label')).toBe('Remove Option A');

    wrapper.remove();
  });

  // --- ANIMATION ---

  it('applies flash class to selected option', async () => {
    const wrapper = createElement('<reke-combobox multiple></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    await waitForUpdate(el);

    const input = el.shadowRoot!.querySelector('input')! as HTMLElement;
    input.click();
    await waitForUpdate(el);

    const options = el.shadowRoot!.querySelectorAll('.option');
    (options[0] as HTMLElement).click();
    await waitForUpdate(el);

    const option = el.shadowRoot!.querySelector('.option--flash');
    expect(option).toBeTruthy();

    wrapper.remove();
  });

  it('applies scale-in class to newly added chip', async () => {
    const wrapper = createElement('<reke-combobox multiple tags></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    el.options = testOptions;
    await waitForUpdate(el);

    const input = el.shadowRoot!.querySelector('input')! as HTMLElement;
    input.click();
    await waitForUpdate(el);

    const options = el.shadowRoot!.querySelectorAll('.option');
    (options[0] as HTMLElement).click();
    await waitForUpdate(el);

    const chip = el.shadowRoot!.querySelector('reke-chip');
    expect(chip).toBeTruthy();
    expect(chip!.classList.contains('chip--scale-in')).toBe(true);

    wrapper.remove();
  });

  it('stylesheet has reduced-motion guard for animations', async () => {
    const wrapper = createElement('<reke-combobox></reke-combobox>');
    const el = wrapper.querySelector('reke-combobox')! as RekeCombobox;
    await waitForUpdate(el);

    let hasReducedMotion = false;
    const sheets = el.shadowRoot!.adoptedStyleSheets;
    for (const sheet of sheets) {
      for (const rule of sheet.cssRules) {
        if (
          rule instanceof CSSMediaRule &&
          rule.media.mediaText.includes('prefers-reduced-motion')
        ) {
          hasReducedMotion = true;
        }
      }
    }

    expect(hasReducedMotion).toBe(true);
    wrapper.remove();
  });
});
