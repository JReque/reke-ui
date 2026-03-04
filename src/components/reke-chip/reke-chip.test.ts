import { describe, it, expect, vi } from 'vitest';
import './reke-chip.js';
import type { RekeChip } from './reke-chip.js';
import { runAxe } from '../../test-utils/a11y.js';

function createElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

async function waitForUpdate(el: RekeChip): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

describe('reke-chip', () => {
  // --- RENDERING ---

  it('renders with default props', async () => {
    const wrapper = createElement('<reke-chip>Tag</reke-chip>');
    const el = wrapper.querySelector('reke-chip')! as RekeChip;
    await waitForUpdate(el);

    expect(el.color).toBe('primary');
    expect(el.active).toBe(false);
    expect(el.dismissible).toBe(false);
    expect(el.disabled).toBe(false);

    const chip = el.shadowRoot!.querySelector('button')!;
    expect(chip).toBeTruthy();
    expect(chip.classList.contains('chip--primary')).toBe(true);
    expect(chip.classList.contains('chip--active')).toBe(false);

    wrapper.remove();
  });

  it('renders active state class', async () => {
    const wrapper = createElement('<reke-chip active>Active</reke-chip>');
    const el = wrapper.querySelector('reke-chip')! as RekeChip;
    await waitForUpdate(el);

    const chip = el.shadowRoot!.querySelector('button')!;
    expect(chip.classList.contains('chip--active')).toBe(true);
    expect(chip.getAttribute('aria-pressed')).toBe('true');

    wrapper.remove();
  });

  it('renders all color variants', async () => {
    const colors = ['primary', 'secondary', 'danger', 'warning'] as const;

    for (const color of colors) {
      const wrapper = createElement(`<reke-chip color="${color}" active>C</reke-chip>`);
      const el = wrapper.querySelector('reke-chip')! as RekeChip;
      await waitForUpdate(el);

      const chip = el.shadowRoot!.querySelector('button')!;
      expect(chip.classList.contains(`chip--${color}`)).toBe(true);

      wrapper.remove();
    }
  });

  it('renders dismiss button when dismissible', async () => {
    const wrapper = createElement('<reke-chip dismissible>Tag</reke-chip>');
    const el = wrapper.querySelector('reke-chip')! as RekeChip;
    await waitForUpdate(el);

    const dismiss = el.shadowRoot!.querySelector('.chip__dismiss');
    expect(dismiss).toBeTruthy();

    wrapper.remove();
  });

  it('does not render dismiss button by default', async () => {
    const wrapper = createElement('<reke-chip>Tag</reke-chip>');
    const el = wrapper.querySelector('reke-chip')! as RekeChip;
    await waitForUpdate(el);

    const dismiss = el.shadowRoot!.querySelector('.chip__dismiss');
    expect(dismiss).toBeNull();

    wrapper.remove();
  });

  // --- BEHAVIOR ---

  it('emits reke-click on click', async () => {
    const wrapper = createElement('<reke-chip>Click me</reke-chip>');
    const el = wrapper.querySelector('reke-chip')! as RekeChip;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-click', handler);

    const chip = el.shadowRoot!.querySelector('button')!;
    chip.click();

    expect(handler).toHaveBeenCalledOnce();

    wrapper.remove();
  });

  it('does not emit reke-click when disabled', async () => {
    const wrapper = createElement('<reke-chip disabled>Click me</reke-chip>');
    const el = wrapper.querySelector('reke-chip')! as RekeChip;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-click', handler);

    const chip = el.shadowRoot!.querySelector('button')!;
    chip.click();

    expect(handler).not.toHaveBeenCalled();

    wrapper.remove();
  });

  it('emits reke-dismiss when dismiss button is clicked', async () => {
    const wrapper = createElement('<reke-chip dismissible>Tag</reke-chip>');
    const el = wrapper.querySelector('reke-chip')! as RekeChip;
    await waitForUpdate(el);

    const dismissHandler = vi.fn();
    const clickHandler = vi.fn();
    el.addEventListener('reke-dismiss', dismissHandler);
    el.addEventListener('reke-click', clickHandler);

    const dismiss = el.shadowRoot!.querySelector('.chip__dismiss')! as HTMLElement;
    dismiss.click();

    expect(dismissHandler).toHaveBeenCalledOnce();
    expect(clickHandler).not.toHaveBeenCalled();

    wrapper.remove();
  });

  // --- ACCESSIBILITY ---

  it('has aria-pressed attribute', async () => {
    const wrapper = createElement('<reke-chip>Tag</reke-chip>');
    const el = wrapper.querySelector('reke-chip')! as RekeChip;
    await waitForUpdate(el);

    const chip = el.shadowRoot!.querySelector('button')!;
    expect(chip.getAttribute('aria-pressed')).toBe('false');

    wrapper.remove();
  });

  it('passes axe-core a11y audit', async () => {
    const wrapper = createElement('<reke-chip>Accessible</reke-chip>');
    const el = wrapper.querySelector('reke-chip')! as RekeChip;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    expect(results.violations).toEqual([]);

    wrapper.remove();
  });

  it('passes a11y audit with dismissible active chip', async () => {
    const wrapper = createElement('<reke-chip active dismissible>Tag</reke-chip>');
    const el = wrapper.querySelector('reke-chip')! as RekeChip;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    expect(results.violations).toEqual([]);

    wrapper.remove();
  });
});
