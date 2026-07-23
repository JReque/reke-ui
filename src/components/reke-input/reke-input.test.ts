import { describe, expect, it, vi } from 'vitest';
import './reke-input.js';
import { runAxe } from '../../test-utils/a11y.js';
import type { RekeInput } from './reke-input.js';

function createElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.backgroundColor = '#0A0A0B';
  wrapper.style.padding = '16px';
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

async function waitForUpdate(el: RekeInput): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

describe('reke-input', () => {
  // --- RENDERING ---

  it('renders with default props', async () => {
    const wrapper = createElement('<reke-input></reke-input>');
    const el = wrapper.querySelector('reke-input')! as RekeInput;
    await waitForUpdate(el);

    expect(el.value).toBe('');
    expect(el.size).toBe('md');
    expect(el.disabled).toBe(false);
    expect(el.error).toBe(false);

    const input = el.shadowRoot!.querySelector('input')!;
    expect(input).toBeTruthy();
    expect(el.shadowRoot!.querySelector('.field')!.classList.contains('field--md')).toBe(true);

    wrapper.remove();
  });

  it('reflects attributes correctly', async () => {
    const wrapper = createElement(
      '<reke-input size="lg" disabled placeholder="Enter text"></reke-input>',
    );
    const el = wrapper.querySelector('reke-input')! as RekeInput;
    await waitForUpdate(el);

    expect(el.size).toBe('lg');
    expect(el.disabled).toBe(true);

    const input = el.shadowRoot!.querySelector('input')!;
    expect(el.shadowRoot!.querySelector('.field')!.classList.contains('field--lg')).toBe(true);
    expect(input.disabled).toBe(true);
    expect(input.placeholder).toBe('Enter text');

    wrapper.remove();
  });

  it('renders label when provided', async () => {
    const wrapper = createElement('<reke-input label="Username"></reke-input>');
    const el = wrapper.querySelector('reke-input')! as RekeInput;
    await waitForUpdate(el);

    const label = el.shadowRoot!.querySelector('.label')!;
    expect(label).toBeTruthy();
    expect(label.textContent).toBe('Username');

    wrapper.remove();
  });

  it('renders xs size class', async () => {
    const wrapper = createElement('<reke-input size="xs" label="Tiny"></reke-input>');
    const el = wrapper.querySelector('reke-input')! as RekeInput;
    await waitForUpdate(el);

    expect(el.shadowRoot!.querySelector('.field')!.classList.contains('field--xs')).toBe(true);

    wrapper.remove();
  });

  it('applies error class', async () => {
    const wrapper = createElement('<reke-input error></reke-input>');
    const el = wrapper.querySelector('reke-input')! as RekeInput;
    await waitForUpdate(el);

    expect(el.shadowRoot!.querySelector('.field')!.classList.contains('field--error')).toBe(true);

    wrapper.remove();
  });

  it('renders prefix and suffix slots', async () => {
    const wrapper = createElement(
      '<reke-input><span slot="prefix">$</span><span slot="suffix">BTC</span></reke-input>',
    );
    const el = wrapper.querySelector('reke-input')! as RekeInput;
    await waitForUpdate(el);

    const prefix = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="prefix"]')!;
    const suffix = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="suffix"]')!;
    expect(prefix.assignedElements()[0]?.textContent).toBe('$');
    expect(suffix.assignedElements()[0]?.textContent).toBe('BTC');

    wrapper.remove();
  });

  it('forwards native attributes to the inner input', async () => {
    const wrapper = createElement(
      '<reke-input type="number" name="quantity" inputmode="decimal" min="0" max="10" step="0.01" maxlength="5"></reke-input>',
    );
    const el = wrapper.querySelector('reke-input')! as RekeInput;
    await waitForUpdate(el);

    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.name).toBe('quantity');
    expect(input.getAttribute('inputmode')).toBe('decimal');
    expect(input.min).toBe('0');
    expect(input.max).toBe('10');
    expect(input.step).toBe('0.01');
    expect(input.maxLength).toBe(5);

    wrapper.remove();
  });

  it('focus() delegates to the inner input', async () => {
    const wrapper = createElement('<reke-input></reke-input>');
    const el = wrapper.querySelector('reke-input')! as RekeInput;
    await waitForUpdate(el);

    el.focus();
    const input = el.shadowRoot!.querySelector('input')!;
    expect(el.shadowRoot!.activeElement).toBe(input);

    wrapper.remove();
  });

  // --- BEHAVIOR ---

  it('emits reke-input on keystroke', async () => {
    const wrapper = createElement('<reke-input></reke-input>');
    const el = wrapper.querySelector('reke-input')! as RekeInput;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-input', handler);

    const input = el.shadowRoot!.querySelector('input')!;
    input.value = 'hello';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();

    wrapper.remove();
  });

  it('emits reke-change on blur', async () => {
    const wrapper = createElement('<reke-input></reke-input>');
    const el = wrapper.querySelector('reke-input')! as RekeInput;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-change', handler);

    const input = el.shadowRoot!.querySelector('input')!;
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();

    wrapper.remove();
  });

  // --- ACCESSIBILITY ---

  it('passes axe-core a11y audit', async () => {
    const wrapper = createElement('<reke-input label="Email"></reke-input>');
    const el = wrapper.querySelector('reke-input')! as RekeInput;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    expect(results.violations).toEqual([]);

    wrapper.remove();
  });

  it('passes a11y audit for disabled input', async () => {
    const wrapper = createElement('<reke-input label="Email" disabled></reke-input>');
    const el = wrapper.querySelector('reke-input')! as RekeInput;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const nonContrastViolations = results.violations.filter((v) => v.id !== 'color-contrast');
    expect(nonContrastViolations).toEqual([]);

    wrapper.remove();
  });
});
