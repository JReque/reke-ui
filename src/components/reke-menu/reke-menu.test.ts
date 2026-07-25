import { describe, expect, it, vi } from 'vitest';
import './reke-menu.js';
import '../reke-menu-item/reke-menu-item.js';
import { runAxe } from '../../test-utils/a11y.js';
import type { RekeMenu } from './reke-menu.js';

function createElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.backgroundColor = '#0A0A0B';
  wrapper.style.padding = '16px';
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

async function waitForUpdate(el: RekeMenu): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

const MENU = `
  <reke-menu x="20" y="20">
    <reke-menu-item>Rename</reke-menu-item>
    <reke-menu-item variant="danger">Delete</reke-menu-item>
  </reke-menu>
`;

describe('reke-menu', () => {
  // --- RENDERING ---

  it('renders nothing when closed', async () => {
    const wrapper = createElement(MENU);
    const el = wrapper.querySelector('reke-menu')! as RekeMenu;
    await waitForUpdate(el);

    expect(el.shadowRoot!.querySelector('.menu')).toBeNull();

    wrapper.remove();
  });

  it('renders the menu container when open', async () => {
    const wrapper = createElement(MENU);
    const el = wrapper.querySelector('reke-menu')! as RekeMenu;
    el.open = true;
    await waitForUpdate(el);

    const menu = el.shadowRoot!.querySelector('.menu')!;
    expect(menu).toBeTruthy();
    expect(menu.getAttribute('role')).toBe('menu');

    wrapper.remove();
  });

  it('positions the menu at the given coordinates', async () => {
    const wrapper = createElement(MENU);
    const el = wrapper.querySelector('reke-menu')! as RekeMenu;
    el.open = true;
    await waitForUpdate(el);

    const menu = el.shadowRoot!.querySelector<HTMLElement>('.menu')!;
    expect(getComputedStyle(menu).position).toBe('fixed');
    expect(menu.style.left).toBe('20px');
    expect(menu.style.top).toBe('20px');

    wrapper.remove();
  });

  // --- BEHAVIOR ---

  it('closes on outside click and emits reke-close', async () => {
    const wrapper = createElement(MENU);
    const el = wrapper.querySelector('reke-menu')! as RekeMenu;
    const handler = vi.fn();
    el.addEventListener('reke-close', handler);
    el.open = true;
    await waitForUpdate(el);

    document.body.click();
    await waitForUpdate(el);

    expect(handler).toHaveBeenCalledOnce();
    expect(el.open).toBe(false);

    wrapper.remove();
  });

  it('does not close when clicking inside the menu', async () => {
    const wrapper = createElement(MENU);
    const el = wrapper.querySelector('reke-menu')! as RekeMenu;
    const handler = vi.fn();
    el.addEventListener('reke-close', handler);
    el.open = true;
    await waitForUpdate(el);

    el.shadowRoot!.querySelector<HTMLElement>('.menu')!.click();
    await waitForUpdate(el);

    expect(handler).not.toHaveBeenCalled();
    expect(el.open).toBe(true);

    wrapper.remove();
  });

  it('closes on Escape', async () => {
    const wrapper = createElement(MENU);
    const el = wrapper.querySelector('reke-menu')! as RekeMenu;
    const handler = vi.fn();
    el.addEventListener('reke-close', handler);
    el.open = true;
    await waitForUpdate(el);

    const item = el.querySelector('reke-menu-item')!;
    item.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }),
    );
    await waitForUpdate(el);

    expect(handler).toHaveBeenCalledOnce();
    expect(el.open).toBe(false);

    wrapper.remove();
  });

  it('closes when an item is selected', async () => {
    const wrapper = createElement(MENU);
    const el = wrapper.querySelector('reke-menu')! as RekeMenu;
    const closeHandler = vi.fn();
    el.addEventListener('reke-close', closeHandler);
    el.open = true;
    await waitForUpdate(el);

    const item = el.querySelector('reke-menu-item')!;
    item.shadowRoot!.querySelector('button')!.click();
    await waitForUpdate(el);

    expect(closeHandler).toHaveBeenCalledOnce();
    expect(el.open).toBe(false);

    wrapper.remove();
  });

  it('moves focus with ArrowDown / ArrowUp', async () => {
    const wrapper = createElement(MENU);
    const el = wrapper.querySelector('reke-menu')! as RekeMenu;
    el.open = true;
    await waitForUpdate(el);

    const items = el.querySelectorAll('reke-menu-item');
    // First item is focused on open.
    expect(document.activeElement).toBe(items[0]);

    items[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }),
    );
    await waitForUpdate(el);
    expect(document.activeElement).toBe(items[1]);

    items[1].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, composed: true }),
    );
    await waitForUpdate(el);
    expect(document.activeElement).toBe(items[0]);

    wrapper.remove();
  });

  it('jumps to first / last item with Home / End', async () => {
    const wrapper = createElement(MENU);
    const el = wrapper.querySelector('reke-menu')! as RekeMenu;
    el.open = true;
    await waitForUpdate(el);

    const items = el.querySelectorAll('reke-menu-item');
    items[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', bubbles: true, composed: true }),
    );
    await waitForUpdate(el);
    expect(document.activeElement).toBe(items[items.length - 1]);

    items[items.length - 1].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true, composed: true }),
    );
    await waitForUpdate(el);
    expect(document.activeElement).toBe(items[0]);

    wrapper.remove();
  });

  it('skips disabled items during keyboard navigation', async () => {
    const wrapper = createElement(`
      <reke-menu x="20" y="20">
        <reke-menu-item>Rename</reke-menu-item>
        <reke-menu-item disabled>Archive</reke-menu-item>
        <reke-menu-item variant="danger">Delete</reke-menu-item>
      </reke-menu>
    `);
    const el = wrapper.querySelector('reke-menu')! as RekeMenu;
    el.open = true;
    await waitForUpdate(el);

    const allItems = el.querySelectorAll('reke-menu-item');
    const [rename, , del] = allItems;
    // First enabled item is focused on open.
    expect(document.activeElement).toBe(rename);

    rename.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }),
    );
    await waitForUpdate(el);
    // Disabled "Archive" is skipped — focus lands on "Delete".
    expect(document.activeElement).toBe(del);

    wrapper.remove();
  });

  // --- ACCESSIBILITY ---

  it('passes axe-core a11y audit when open', async () => {
    const wrapper = createElement(MENU);
    const el = wrapper.querySelector('reke-menu')! as RekeMenu;
    el.open = true;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const nonContrast = results.violations.filter((v) => v.id !== 'color-contrast');
    expect(nonContrast).toEqual([]);

    wrapper.remove();
  });
});
