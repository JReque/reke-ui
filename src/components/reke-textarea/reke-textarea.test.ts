import { describe, it, expect, vi } from 'vitest';
import './reke-textarea.js';
import type { RekeTextarea } from './reke-textarea.js';
import { runAxe } from '../../test-utils/a11y.js';

function createElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.backgroundColor = '#0A0A0B';
  wrapper.style.padding = '16px';
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

async function waitForUpdate(el: RekeTextarea): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

describe('reke-textarea', () => {
  // --- RENDERING ---

  it('renders with default props', async () => {
    const wrapper = createElement('<reke-textarea></reke-textarea>');
    const el = wrapper.querySelector('reke-textarea')! as RekeTextarea;
    await waitForUpdate(el);

    expect(el.value).toBe('');
    expect(el.size).toBe('md');
    expect(el.rows).toBe(4);
    expect(el.disabled).toBe(false);
    expect(el.error).toBe(false);

    const textarea = el.shadowRoot!.querySelector('textarea')!;
    expect(textarea).toBeTruthy();
    expect(textarea.classList.contains('textarea--md')).toBe(true);
    expect(textarea.rows).toBe(4);

    wrapper.remove();
  });

  it('reflects attributes correctly', async () => {
    const wrapper = createElement(
      '<reke-textarea size="lg" disabled rows="6" placeholder="Enter text"></reke-textarea>',
    );
    const el = wrapper.querySelector('reke-textarea')! as RekeTextarea;
    await waitForUpdate(el);

    expect(el.size).toBe('lg');
    expect(el.disabled).toBe(true);
    expect(el.rows).toBe(6);

    const textarea = el.shadowRoot!.querySelector('textarea')!;
    expect(textarea.classList.contains('textarea--lg')).toBe(true);
    expect(textarea.disabled).toBe(true);
    expect(textarea.placeholder).toBe('Enter text');
    expect(textarea.rows).toBe(6);

    wrapper.remove();
  });

  it('renders label when provided', async () => {
    const wrapper = createElement(
      '<reke-textarea label="Description"></reke-textarea>',
    );
    const el = wrapper.querySelector('reke-textarea')! as RekeTextarea;
    await waitForUpdate(el);

    const label = el.shadowRoot!.querySelector('.label')!;
    expect(label).toBeTruthy();
    expect(label.textContent).toBe('Description');

    wrapper.remove();
  });

  it('applies error class', async () => {
    const wrapper = createElement('<reke-textarea error></reke-textarea>');
    const el = wrapper.querySelector('reke-textarea')! as RekeTextarea;
    await waitForUpdate(el);

    const textarea = el.shadowRoot!.querySelector('textarea')!;
    expect(textarea.classList.contains('textarea--error')).toBe(true);

    wrapper.remove();
  });

  // --- BEHAVIOR ---

  it('emits reke-input on keystroke', async () => {
    const wrapper = createElement('<reke-textarea></reke-textarea>');
    const el = wrapper.querySelector('reke-textarea')! as RekeTextarea;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-input', handler);

    const textarea = el.shadowRoot!.querySelector('textarea')!;
    textarea.value = 'hello';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();

    wrapper.remove();
  });

  it('emits reke-change on blur', async () => {
    const wrapper = createElement('<reke-textarea></reke-textarea>');
    const el = wrapper.querySelector('reke-textarea')! as RekeTextarea;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-change', handler);

    const textarea = el.shadowRoot!.querySelector('textarea')!;
    textarea.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();

    wrapper.remove();
  });

  // --- ACCESSIBILITY ---

  it('passes axe-core a11y audit', async () => {
    const wrapper = createElement(
      '<reke-textarea label="Comments"></reke-textarea>',
    );
    const el = wrapper.querySelector('reke-textarea')! as RekeTextarea;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    expect(results.violations).toEqual([]);

    wrapper.remove();
  });

  it('passes a11y audit for disabled textarea', async () => {
    const wrapper = createElement(
      '<reke-textarea label="Comments" disabled></reke-textarea>',
    );
    const el = wrapper.querySelector('reke-textarea')! as RekeTextarea;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const nonContrastViolations = results.violations.filter(
      (v) => v.id !== 'color-contrast',
    );
    expect(nonContrastViolations).toEqual([]);

    wrapper.remove();
  });
});
