import { describe, it, expect, vi } from 'vitest';
import './reke-toast.js';
import type { RekeToast } from './reke-toast.js';
import { runAxe } from '../../test-utils/a11y.js';

function createElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.backgroundColor = '#0A0A0B';
  wrapper.style.padding = '16px';
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

async function waitForUpdate(el: RekeToast): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

describe('reke-toast', () => {
  // --- RENDERING ---

  it('renders with default props', async () => {
    const wrapper = createElement(
      '<reke-toast message="File saved"></reke-toast>',
    );
    const el = wrapper.querySelector('reke-toast')! as RekeToast;
    await waitForUpdate(el);

    expect(el.variant).toBe('success');
    const toast = el.shadowRoot!.querySelector('.toast');
    expect(toast).toBeTruthy();
    expect(toast!.classList.contains('toast--success')).toBe(true);

    const message = el.shadowRoot!.querySelector('.toast__message');
    expect(message!.textContent).toContain('File saved');

    wrapper.remove();
  });

  it('renders all variants', async () => {
    const variants = ['success', 'error', 'warning', 'info'] as const;
    for (const variant of variants) {
      const wrapper = createElement(
        `<reke-toast variant="${variant}" message="Test"></reke-toast>`,
      );
      const el = wrapper.querySelector('reke-toast')! as RekeToast;
      await waitForUpdate(el);

      const toast = el.shadowRoot!.querySelector('.toast');
      expect(toast!.classList.contains(`toast--${variant}`)).toBe(true);

      wrapper.remove();
    }
  });

  it('renders action button when action prop is set', async () => {
    const wrapper = createElement(
      '<reke-toast message="Error" action="reintentar()"></reke-toast>',
    );
    const el = wrapper.querySelector('reke-toast')! as RekeToast;
    await waitForUpdate(el);

    const actionBtn = el.shadowRoot!.querySelector('.toast__action');
    expect(actionBtn).toBeTruthy();
    expect(actionBtn!.textContent).toContain('reintentar()');

    wrapper.remove();
  });

  it('does not render action button by default', async () => {
    const wrapper = createElement(
      '<reke-toast message="Success"></reke-toast>',
    );
    const el = wrapper.querySelector('reke-toast')! as RekeToast;
    await waitForUpdate(el);

    const actionBtn = el.shadowRoot!.querySelector('.toast__action');
    expect(actionBtn).toBeNull();

    wrapper.remove();
  });

  it('always renders close button', async () => {
    const wrapper = createElement(
      '<reke-toast message="Info"></reke-toast>',
    );
    const el = wrapper.querySelector('reke-toast')! as RekeToast;
    await waitForUpdate(el);

    const closeBtn = el.shadowRoot!.querySelector('.toast__close');
    expect(closeBtn).toBeTruthy();

    wrapper.remove();
  });

  // --- BEHAVIOR ---

  it('emits reke-close and removes itself on dismiss', async () => {
    const wrapper = createElement(
      '<reke-toast message="Bye"></reke-toast>',
    );
    const el = wrapper.querySelector('reke-toast')! as RekeToast;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-close', handler);

    const closeBtn = el.shadowRoot!.querySelector(
      '.toast__close',
    )! as HTMLElement;
    closeBtn.click();

    expect(handler).toHaveBeenCalledOnce();
    expect(wrapper.querySelector('reke-toast')).toBeNull();

    wrapper.remove();
  });

  it('emits reke-action when action button is clicked', async () => {
    const wrapper = createElement(
      '<reke-toast message="Failed" action="retry()"></reke-toast>',
    );
    const el = wrapper.querySelector('reke-toast')! as RekeToast;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-action', handler);

    const actionBtn = el.shadowRoot!.querySelector(
      '.toast__action',
    )! as HTMLElement;
    actionBtn.click();

    expect(handler).toHaveBeenCalledOnce();

    wrapper.remove();
  });

  it('auto-dismisses after duration', async () => {
    const wrapper = createElement(
      '<reke-toast message="Auto" duration="100"></reke-toast>',
    );
    const el = wrapper.querySelector('reke-toast')! as RekeToast;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-close', handler);

    await new Promise((r) => setTimeout(r, 200));

    expect(handler).toHaveBeenCalledOnce();

    wrapper.remove();
  });

  // --- ACCESSIBILITY ---

  it('has role="status"', async () => {
    const wrapper = createElement(
      '<reke-toast message="Saved"></reke-toast>',
    );
    const el = wrapper.querySelector('reke-toast')! as RekeToast;
    await waitForUpdate(el);

    const toast = el.shadowRoot!.querySelector('[role="status"]');
    expect(toast).toBeTruthy();

    wrapper.remove();
  });

  it('passes axe-core a11y audit', async () => {
    const wrapper = createElement(
      '<reke-toast message="Operation completed"></reke-toast>',
    );
    const el = wrapper.querySelector('reke-toast')! as RekeToast;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const violations = results.violations.filter(
      (v) => v.id !== 'color-contrast',
    );
    expect(violations).toEqual([]);

    wrapper.remove();
  });

  it('passes a11y audit with action button', async () => {
    const wrapper = createElement(
      '<reke-toast variant="error" message="Connection failed" action="reintentar()"></reke-toast>',
    );
    const el = wrapper.querySelector('reke-toast')! as RekeToast;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const violations = results.violations.filter(
      (v) => v.id !== 'color-contrast',
    );
    expect(violations).toEqual([]);

    wrapper.remove();
  });
});
