import { describe, it, expect, vi } from 'vitest';
import './reke-alert.js';
import type { RekeAlert } from './reke-alert.js';
import { runAxe } from '../../test-utils/a11y.js';

function createElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.backgroundColor = '#0A0A0B';
  wrapper.style.padding = '16px';
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

async function waitForUpdate(el: RekeAlert): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

describe('reke-alert', () => {
  // --- RENDERING ---

  it('renders with default variant (info)', async () => {
    const wrapper = createElement('<reke-alert>Message</reke-alert>');
    const el = wrapper.querySelector('reke-alert')! as RekeAlert;
    await waitForUpdate(el);

    expect(el.variant).toBe('info');
    const alert = el.shadowRoot!.querySelector('.alert');
    expect(alert).toBeTruthy();
    expect(alert!.classList.contains('alert--info')).toBe(true);

    wrapper.remove();
  });

  it('renders all variants', async () => {
    const variants = ['success', 'error', 'warning', 'info'] as const;
    for (const variant of variants) {
      const wrapper = createElement(
        `<reke-alert variant="${variant}">Test</reke-alert>`,
      );
      const el = wrapper.querySelector('reke-alert')! as RekeAlert;
      await waitForUpdate(el);

      const alert = el.shadowRoot!.querySelector('.alert');
      expect(alert!.classList.contains(`alert--${variant}`)).toBe(true);

      wrapper.remove();
    }
  });

  it('renders close button when dismissible', async () => {
    const wrapper = createElement(
      '<reke-alert dismissible>Dismiss me</reke-alert>',
    );
    const el = wrapper.querySelector('reke-alert')! as RekeAlert;
    await waitForUpdate(el);

    const closeBtn = el.shadowRoot!.querySelector('.alert__close');
    expect(closeBtn).toBeTruthy();

    wrapper.remove();
  });

  it('does not render close button by default', async () => {
    const wrapper = createElement('<reke-alert>Message</reke-alert>');
    const el = wrapper.querySelector('reke-alert')! as RekeAlert;
    await waitForUpdate(el);

    const closeBtn = el.shadowRoot!.querySelector('.alert__close');
    expect(closeBtn).toBeNull();

    wrapper.remove();
  });

  // --- BEHAVIOR ---

  it('emits reke-close and removes itself when dismissed', async () => {
    const wrapper = createElement(
      '<reke-alert dismissible>Bye</reke-alert>',
    );
    const el = wrapper.querySelector('reke-alert')! as RekeAlert;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-close', handler);

    const closeBtn = el.shadowRoot!.querySelector(
      '.alert__close',
    )! as HTMLElement;
    closeBtn.click();

    expect(handler).toHaveBeenCalledOnce();
    expect(wrapper.querySelector('reke-alert')).toBeNull();

    wrapper.remove();
  });

  // --- ACCESSIBILITY ---

  it('has role="alert"', async () => {
    const wrapper = createElement(
      '<reke-alert variant="error">Error!</reke-alert>',
    );
    const el = wrapper.querySelector('reke-alert')! as RekeAlert;
    await waitForUpdate(el);

    const alert = el.shadowRoot!.querySelector('[role="alert"]');
    expect(alert).toBeTruthy();

    wrapper.remove();
  });

  it('passes axe-core a11y audit', async () => {
    const wrapper = createElement(
      '<reke-alert variant="success">Build completed</reke-alert>',
    );
    const el = wrapper.querySelector('reke-alert')! as RekeAlert;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const violations = results.violations.filter(
      (v) => v.id !== 'color-contrast',
    );
    expect(violations).toEqual([]);

    wrapper.remove();
  });

  it('passes a11y audit for dismissible variant', async () => {
    const wrapper = createElement(
      '<reke-alert variant="warning" dismissible>Warning</reke-alert>',
    );
    const el = wrapper.querySelector('reke-alert')! as RekeAlert;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const violations = results.violations.filter(
      (v) => v.id !== 'color-contrast',
    );
    expect(violations).toEqual([]);

    wrapper.remove();
  });
});
