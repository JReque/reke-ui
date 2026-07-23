import { describe, expect, it, vi } from 'vitest';
import './reke-menu-item.js';
import { runAxe } from '../../test-utils/a11y.js';
import type { RekeMenuItem } from './reke-menu-item.js';

function createElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.backgroundColor = '#0A0A0B';
  wrapper.style.padding = '16px';
  // role=menu parent so the slotted menuitem has a valid a11y parent.
  wrapper.setAttribute('role', 'menu');
  wrapper.setAttribute('aria-label', 'Test menu');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

async function waitForUpdate(el: RekeMenuItem): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

describe('reke-menu-item', () => {
  // --- RENDERING ---

  it('renders label with menuitem role', async () => {
    const wrapper = createElement('<reke-menu-item>Rename</reke-menu-item>');
    const el = wrapper.querySelector('reke-menu-item')! as RekeMenuItem;
    await waitForUpdate(el);

    const button = el.shadowRoot!.querySelector('button')!;
    expect(button.getAttribute('role')).toBe('menuitem');
    expect(el.textContent!.trim()).toBe('Rename');

    wrapper.remove();
  });

  it('applies danger variant class', async () => {
    const wrapper = createElement('<reke-menu-item variant="danger">Delete</reke-menu-item>');
    const el = wrapper.querySelector('reke-menu-item')! as RekeMenuItem;
    await waitForUpdate(el);

    expect(el.shadowRoot!.querySelector('button')!.classList.contains('item--danger')).toBe(true);

    wrapper.remove();
  });

  // --- BEHAVIOR ---

  it('emits reke-select on click', async () => {
    const wrapper = createElement('<reke-menu-item>Rename</reke-menu-item>');
    const el = wrapper.querySelector('reke-menu-item')! as RekeMenuItem;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-select', handler);
    el.shadowRoot!.querySelector('button')!.click();

    expect(handler).toHaveBeenCalledOnce();

    wrapper.remove();
  });

  it('does not emit reke-select when disabled', async () => {
    const wrapper = createElement('<reke-menu-item disabled>Rename</reke-menu-item>');
    const el = wrapper.querySelector('reke-menu-item')! as RekeMenuItem;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-select', handler);
    el.shadowRoot!.querySelector('button')!.click();

    expect(handler).not.toHaveBeenCalled();

    wrapper.remove();
  });

  // --- ACCESSIBILITY ---

  it('passes axe-core a11y audit', async () => {
    const wrapper = createElement('<reke-menu-item>Rename</reke-menu-item>');
    const el = wrapper.querySelector('reke-menu-item')! as RekeMenuItem;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const nonContrast = results.violations.filter((v) => v.id !== 'color-contrast');
    expect(nonContrast).toEqual([]);

    wrapper.remove();
  });
});
