import { describe, it, expect, vi } from 'vitest';
import './reke-button.js';
import type { RekeButton } from './reke-button.js';
import { runAxe } from '../../test-utils/a11y.js';

function createElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

async function waitForUpdate(el: RekeButton): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

describe('reke-button', () => {
  // --- RENDERING ---

  it('renders with default props', async () => {
    const wrapper = createElement('<reke-button>Click me</reke-button>');
    const el = wrapper.querySelector('reke-button')! as RekeButton;
    await waitForUpdate(el);

    expect(el.variant).toBe('primary');
    expect(el.size).toBe('md');
    expect(el.disabled).toBe(false);
    expect(el.loading).toBe(false);

    const button = el.shadowRoot!.querySelector('button')!;
    expect(button).toBeTruthy();
    expect(button.classList.contains('button--primary')).toBe(true);
    expect(button.classList.contains('button--md')).toBe(true);

    wrapper.remove();
  });

  it('reflects attributes correctly', async () => {
    const wrapper = createElement(
      '<reke-button variant="danger" size="lg" disabled>Delete</reke-button>',
    );
    const el = wrapper.querySelector('reke-button')! as RekeButton;
    await waitForUpdate(el);

    expect(el.variant).toBe('danger');
    expect(el.size).toBe('lg');
    expect(el.disabled).toBe(true);

    const button = el.shadowRoot!.querySelector('button')!;
    expect(button.classList.contains('button--danger')).toBe(true);
    expect(button.classList.contains('button--lg')).toBe(true);
    expect(button.disabled).toBe(true);

    wrapper.remove();
  });

  it('renders all variant classes', async () => {
    const variants = [
      'primary',
      'secondary',
      'ghost',
      'danger',
      'danger-outline',
      'icon-only',
    ] as const;

    for (const variant of variants) {
      const wrapper = createElement(
        `<reke-button variant="${variant}">btn</reke-button>`,
      );
      const el = wrapper.querySelector('reke-button')! as RekeButton;
      await waitForUpdate(el);

      const button = el.shadowRoot!.querySelector('button')!;
      expect(button.classList.contains(`button--${variant}`)).toBe(true);

      wrapper.remove();
    }
  });

  it('renders prefix and suffix slots', async () => {
    const wrapper = createElement(`
      <reke-button>
        <span slot="prefix">P</span>
        Label
        <span slot="suffix">S</span>
      </reke-button>
    `);
    const el = wrapper.querySelector('reke-button')! as RekeButton;
    await waitForUpdate(el);

    const slots = el.shadowRoot!.querySelectorAll('slot');
    const slotNames = Array.from(slots).map((s) => s.name || 'default');
    expect(slotNames).toContain('prefix');
    expect(slotNames).toContain('suffix');

    wrapper.remove();
  });

  // --- BEHAVIOR ---

  it('emits reke-click event on click', async () => {
    const wrapper = createElement('<reke-button>Click</reke-button>');
    const el = wrapper.querySelector('reke-button')! as RekeButton;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-click', handler);

    const button = el.shadowRoot!.querySelector('button')!;
    button.click();

    expect(handler).toHaveBeenCalledOnce();

    wrapper.remove();
  });

  it('does not emit reke-click when disabled', async () => {
    const wrapper = createElement(
      '<reke-button disabled>Click</reke-button>',
    );
    const el = wrapper.querySelector('reke-button')! as RekeButton;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-click', handler);

    const button = el.shadowRoot!.querySelector('button')!;
    button.click();

    expect(handler).not.toHaveBeenCalled();

    wrapper.remove();
  });

  it('does not emit reke-click when loading', async () => {
    const wrapper = createElement('<reke-button loading>Click</reke-button>');
    const el = wrapper.querySelector('reke-button')! as RekeButton;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-click', handler);

    const button = el.shadowRoot!.querySelector('button')!;
    button.click();

    expect(handler).not.toHaveBeenCalled();

    wrapper.remove();
  });

  it('shows loading spinner when loading', async () => {
    const wrapper = createElement('<reke-button loading>Click</reke-button>');
    const el = wrapper.querySelector('reke-button')! as RekeButton;
    await waitForUpdate(el);

    const button = el.shadowRoot!.querySelector('button')!;
    expect(button.classList.contains('button--loading')).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');

    wrapper.remove();
  });

  // --- ACCESSIBILITY ---

  it('passes axe-core a11y audit', async () => {
    const wrapper = createElement('<reke-button>Accessible</reke-button>');
    const el = wrapper.querySelector('reke-button')! as RekeButton;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    expect(results.violations).toEqual([]);

    wrapper.remove();
  });

  it('passes a11y audit for disabled button', async () => {
    const wrapper = createElement(
      '<reke-button disabled>Disabled</reke-button>',
    );
    const el = wrapper.querySelector('reke-button')! as RekeButton;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    expect(results.violations).toEqual([]);

    wrapper.remove();
  });
});
