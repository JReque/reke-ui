import { describe, it, expect, vi } from 'vitest';
import './reke-checkbox.js';
import type { RekeCheckbox } from './reke-checkbox.js';
import { runAxe } from '../../test-utils/a11y.js';

function createElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.backgroundColor = '#0A0A0B';
  wrapper.style.padding = '16px';
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

async function waitForUpdate(el: RekeCheckbox): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

describe('reke-checkbox', () => {
  // --- RENDERING ---

  it('renders unchecked by default', async () => {
    const wrapper = createElement('<reke-checkbox></reke-checkbox>');
    const el = wrapper.querySelector('reke-checkbox')! as RekeCheckbox;
    await waitForUpdate(el);

    expect(el.checked).toBe(false);
    expect(el.indeterminate).toBe(false);
    expect(el.disabled).toBe(false);

    const box = el.shadowRoot!.querySelector('.box')!;
    expect(box).toBeTruthy();
    expect(box.classList.contains('box--checked')).toBe(false);

    wrapper.remove();
  });

  it('renders checked state', async () => {
    const wrapper = createElement(
      '<reke-checkbox checked></reke-checkbox>',
    );
    const el = wrapper.querySelector('reke-checkbox')! as RekeCheckbox;
    await waitForUpdate(el);

    expect(el.checked).toBe(true);

    const box = el.shadowRoot!.querySelector('.box')!;
    expect(box.classList.contains('box--checked')).toBe(true);

    const checkmark = el.shadowRoot!.querySelector('.checkmark');
    expect(checkmark).toBeTruthy();

    wrapper.remove();
  });

  it('renders label when provided', async () => {
    const wrapper = createElement(
      '<reke-checkbox label="Accept terms"></reke-checkbox>',
    );
    const el = wrapper.querySelector('reke-checkbox')! as RekeCheckbox;
    await waitForUpdate(el);

    const label = el.shadowRoot!.querySelector('.label')!;
    expect(label).toBeTruthy();
    expect(label.textContent).toBe('Accept terms');

    wrapper.remove();
  });

  // --- BEHAVIOR ---

  it('toggles on click', async () => {
    const wrapper = createElement('<reke-checkbox></reke-checkbox>');
    const el = wrapper.querySelector('reke-checkbox')! as RekeCheckbox;
    await waitForUpdate(el);

    expect(el.checked).toBe(false);

    const container = el.shadowRoot!.querySelector('.container')! as HTMLElement;
    container.click();
    await waitForUpdate(el);

    expect(el.checked).toBe(true);

    container.click();
    await waitForUpdate(el);

    expect(el.checked).toBe(false);

    wrapper.remove();
  });

  it('emits reke-change on toggle', async () => {
    const wrapper = createElement('<reke-checkbox></reke-checkbox>');
    const el = wrapper.querySelector('reke-checkbox')! as RekeCheckbox;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-change', handler);

    const container = el.shadowRoot!.querySelector('.container')! as HTMLElement;
    container.click();

    expect(handler).toHaveBeenCalledOnce();
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toEqual({
      checked: true,
    });

    wrapper.remove();
  });

  it('does not toggle when disabled', async () => {
    const wrapper = createElement(
      '<reke-checkbox disabled></reke-checkbox>',
    );
    const el = wrapper.querySelector('reke-checkbox')! as RekeCheckbox;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-change', handler);

    const container = el.shadowRoot!.querySelector('.container')! as HTMLElement;
    container.click();

    expect(el.checked).toBe(false);
    expect(handler).not.toHaveBeenCalled();

    wrapper.remove();
  });

  // --- ACCESSIBILITY ---

  it('passes axe-core a11y audit', async () => {
    const wrapper = createElement(
      '<reke-checkbox label="Subscribe"></reke-checkbox>',
    );
    const el = wrapper.querySelector('reke-checkbox')! as RekeCheckbox;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const violations = results.violations.filter(
      (v) => v.id !== 'color-contrast',
    );
    expect(violations).toEqual([]);

    wrapper.remove();
  });

  it('passes a11y audit for disabled checkbox', async () => {
    const wrapper = createElement(
      '<reke-checkbox label="Subscribe" disabled></reke-checkbox>',
    );
    const el = wrapper.querySelector('reke-checkbox')! as RekeCheckbox;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const nonContrastViolations = results.violations.filter(
      (v) => v.id !== 'color-contrast',
    );
    expect(nonContrastViolations).toEqual([]);

    wrapper.remove();
  });
});
