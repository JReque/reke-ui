import { describe, it, expect, vi } from 'vitest';
import './reke-toggle.js';
import type { RekeToggle } from './reke-toggle.js';
import { runAxe } from '../../test-utils/a11y.js';

function createElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.backgroundColor = '#0A0A0B';
  wrapper.style.padding = '16px';
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

async function waitForUpdate(el: RekeToggle): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

describe('reke-toggle', () => {
  // --- RENDERING ---

  it('renders unchecked by default', async () => {
    const wrapper = createElement(
      '<reke-toggle label="Toggle me"></reke-toggle>',
    );
    const el = wrapper.querySelector('reke-toggle')! as RekeToggle;
    await waitForUpdate(el);

    expect(el.checked).toBe(false);
    expect(el.disabled).toBe(false);

    const toggle = el.shadowRoot!.querySelector('[role="switch"]')!;
    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute('aria-checked')).toBe('false');

    const track = el.shadowRoot!.querySelector('.track')!;
    expect(track.classList.contains('track--checked')).toBe(false);

    wrapper.remove();
  });

  it('renders checked when checked attribute is set', async () => {
    const wrapper = createElement(
      '<reke-toggle label="Toggle me" checked></reke-toggle>',
    );
    const el = wrapper.querySelector('reke-toggle')! as RekeToggle;
    await waitForUpdate(el);

    expect(el.checked).toBe(true);

    const toggle = el.shadowRoot!.querySelector('[role="switch"]')!;
    expect(toggle.getAttribute('aria-checked')).toBe('true');

    const track = el.shadowRoot!.querySelector('.track')!;
    expect(track.classList.contains('track--checked')).toBe(true);

    const thumb = el.shadowRoot!.querySelector('.thumb')!;
    expect(thumb.classList.contains('thumb--checked')).toBe(true);

    wrapper.remove();
  });

  // --- BEHAVIOR ---

  it('toggles on click', async () => {
    const wrapper = createElement(
      '<reke-toggle label="Toggle me"></reke-toggle>',
    );
    const el = wrapper.querySelector('reke-toggle')! as RekeToggle;
    await waitForUpdate(el);

    const toggle = el.shadowRoot!.querySelector('[role="switch"]')! as HTMLElement;
    toggle.click();
    await waitForUpdate(el);

    expect(el.checked).toBe(true);

    toggle.click();
    await waitForUpdate(el);

    expect(el.checked).toBe(false);

    wrapper.remove();
  });

  it('emits reke-change with checked detail', async () => {
    const wrapper = createElement(
      '<reke-toggle label="Toggle me"></reke-toggle>',
    );
    const el = wrapper.querySelector('reke-toggle')! as RekeToggle;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-change', handler);

    const toggle = el.shadowRoot!.querySelector('[role="switch"]')! as HTMLElement;
    toggle.click();
    await waitForUpdate(el);

    expect(handler).toHaveBeenCalledOnce();
    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({ checked: true });

    wrapper.remove();
  });

  it('does not toggle when disabled', async () => {
    const wrapper = createElement(
      '<reke-toggle label="Toggle me" disabled></reke-toggle>',
    );
    const el = wrapper.querySelector('reke-toggle')! as RekeToggle;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-change', handler);

    const toggle = el.shadowRoot!.querySelector('[role="switch"]')! as HTMLElement;
    toggle.click();
    await waitForUpdate(el);

    expect(el.checked).toBe(false);
    expect(handler).not.toHaveBeenCalled();

    wrapper.remove();
  });

  // --- ACCESSIBILITY ---

  it('passes axe-core a11y audit', async () => {
    const wrapper = createElement(
      '<reke-toggle label="Toggle me"></reke-toggle>',
    );
    const el = wrapper.querySelector('reke-toggle')! as RekeToggle;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    expect(results.violations).toEqual([]);

    wrapper.remove();
  });

  it('passes a11y audit for disabled toggle', async () => {
    const wrapper = createElement(
      '<reke-toggle label="Toggle me" disabled></reke-toggle>',
    );
    const el = wrapper.querySelector('reke-toggle')! as RekeToggle;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const nonContrastViolations = results.violations.filter(
      (v) => v.id !== 'color-contrast',
    );
    expect(nonContrastViolations).toEqual([]);

    wrapper.remove();
  });
});
