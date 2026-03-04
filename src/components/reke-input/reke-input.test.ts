import { describe, it, expect, vi } from 'vitest';
import './reke-input.js';
import type { RekeInput } from './reke-input.js';
import { runAxe } from '../../test-utils/a11y.js';

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
    expect(input.classList.contains('input--md')).toBe(true);

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
    expect(input.classList.contains('input--lg')).toBe(true);
    expect(input.disabled).toBe(true);
    expect(input.placeholder).toBe('Enter text');

    wrapper.remove();
  });

  it('renders label when provided', async () => {
    const wrapper = createElement(
      '<reke-input label="Username"></reke-input>',
    );
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

    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.classList.contains('input--xs')).toBe(true);

    wrapper.remove();
  });

  it('applies error class', async () => {
    const wrapper = createElement('<reke-input error></reke-input>');
    const el = wrapper.querySelector('reke-input')! as RekeInput;
    await waitForUpdate(el);

    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.classList.contains('input--error')).toBe(true);

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
    const wrapper = createElement(
      '<reke-input label="Email"></reke-input>',
    );
    const el = wrapper.querySelector('reke-input')! as RekeInput;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    expect(results.violations).toEqual([]);

    wrapper.remove();
  });

  it('passes a11y audit for disabled input', async () => {
    const wrapper = createElement(
      '<reke-input label="Email" disabled></reke-input>',
    );
    const el = wrapper.querySelector('reke-input')! as RekeInput;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const nonContrastViolations = results.violations.filter(
      (v) => v.id !== 'color-contrast',
    );
    expect(nonContrastViolations).toEqual([]);

    wrapper.remove();
  });
});
