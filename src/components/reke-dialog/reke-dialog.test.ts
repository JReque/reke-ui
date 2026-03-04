import { describe, it, expect, vi } from 'vitest';
import './reke-dialog.js';
import type { RekeDialog } from './reke-dialog.js';
import { runAxe } from '../../test-utils/a11y.js';

function createElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.backgroundColor = '#0A0A0B';
  wrapper.style.padding = '16px';
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

async function waitForUpdate(el: RekeDialog): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

describe('reke-dialog', () => {
  // --- RENDERING ---

  it('is not visible when closed', async () => {
    const wrapper = createElement(
      '<reke-dialog heading="Test Dialog"><p>Body</p></reke-dialog>',
    );
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    await waitForUpdate(el);

    expect(el.open).toBe(false);

    const backdrop = el.shadowRoot!.querySelector('.backdrop');
    expect(backdrop).toBeNull();

    wrapper.remove();
  });

  it('is visible when open', async () => {
    const wrapper = createElement(
      '<reke-dialog heading="Test Dialog" open><p>Body</p></reke-dialog>',
    );
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    await waitForUpdate(el);

    expect(el.open).toBe(true);

    const backdrop = el.shadowRoot!.querySelector('.backdrop');
    expect(backdrop).toBeTruthy();

    const dialog = el.shadowRoot!.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog!.getAttribute('aria-modal')).toBe('true');
    expect(dialog!.getAttribute('aria-label')).toBe('Test Dialog');

    const title = el.shadowRoot!.querySelector('.dialog-title');
    expect(title).toBeTruthy();
    expect(title!.textContent).toBe('Test Dialog');

    wrapper.remove();
  });

  // --- BEHAVIOR ---

  it('closes on backdrop click', async () => {
    const wrapper = createElement(
      '<reke-dialog heading="Test Dialog" open><p>Body</p></reke-dialog>',
    );
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    await waitForUpdate(el);

    const backdrop = el.shadowRoot!.querySelector('.backdrop')! as HTMLElement;
    backdrop.click();
    await waitForUpdate(el);

    expect(el.open).toBe(false);

    const backdropAfter = el.shadowRoot!.querySelector('.backdrop');
    expect(backdropAfter).toBeNull();

    wrapper.remove();
  });

  it('closes on Escape key', async () => {
    const wrapper = createElement(
      '<reke-dialog heading="Test Dialog" open><p>Body</p></reke-dialog>',
    );
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    await waitForUpdate(el);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await waitForUpdate(el);

    expect(el.open).toBe(false);

    wrapper.remove();
  });

  it('emits reke-close when dialog closes', async () => {
    const wrapper = createElement(
      '<reke-dialog heading="Test Dialog" open><p>Body</p></reke-dialog>',
    );
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-close', handler);

    el.close();
    await waitForUpdate(el);

    expect(handler).toHaveBeenCalledOnce();

    wrapper.remove();
  });

  // --- DRAWER ---

  it('renders as drawer when variant="drawer"', async () => {
    const wrapper = createElement(
      '<reke-dialog heading="Drawer" variant="drawer" open><p>Content</p></reke-dialog>',
    );
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    await waitForUpdate(el);

    const drawer = el.shadowRoot!.querySelector('.drawer');
    expect(drawer).toBeTruthy();
    expect(drawer!.classList.contains('drawer--right')).toBe(true);

    const backdrop = el.shadowRoot!.querySelector('.backdrop--drawer');
    expect(backdrop).toBeTruthy();

    wrapper.remove();
  });

  it('renders drawer on left side', async () => {
    const wrapper = createElement(
      '<reke-dialog heading="Left" variant="drawer" position="left" open><p>Content</p></reke-dialog>',
    );
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    await waitForUpdate(el);

    const drawer = el.shadowRoot!.querySelector('.drawer--left');
    expect(drawer).toBeTruthy();

    const backdrop = el.shadowRoot!.querySelector('.backdrop--left');
    expect(backdrop).toBeTruthy();

    wrapper.remove();
  });

  it('drawer closes on backdrop click', async () => {
    const wrapper = createElement(
      '<reke-dialog heading="Drawer" variant="drawer" open><p>Content</p></reke-dialog>',
    );
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    await waitForUpdate(el);

    const backdrop = el.shadowRoot!.querySelector('.backdrop')! as HTMLElement;
    backdrop.click();
    await waitForUpdate(el);

    expect(el.open).toBe(false);

    wrapper.remove();
  });

  // --- ACCESSIBILITY ---

  it('passes axe-core a11y audit when open', async () => {
    const wrapper = createElement(
      '<reke-dialog heading="Accessible Dialog" open><p>Dialog body content</p></reke-dialog>',
    );
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const violations = results.violations.filter(
      (v) => v.id !== 'color-contrast',
    );
    expect(violations).toEqual([]);

    wrapper.remove();
  });
});
