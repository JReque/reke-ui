import { describe, expect, it, vi } from 'vitest';
import './reke-dialog.js';
import { runAxe } from '../../test-utils/a11y.js';
import type { RekeDialog } from './reke-dialog.js';

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
    const wrapper = createElement('<reke-dialog heading="Test Dialog"><p>Body</p></reke-dialog>');
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

    // The panel outlives `open` by the exit animation, then unmounts.
    await new Promise((r) => setTimeout(r, 500));
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

  // --- FOCUS MANAGEMENT ---

  it('moves focus into the dialog when it opens', async () => {
    const wrapper = createElement(
      '<button id="trigger">open</button><reke-dialog heading="Test Dialog"><button id="inner">ok</button></reke-dialog>',
    );
    const trigger = wrapper.querySelector('#trigger')! as HTMLButtonElement;
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    await waitForUpdate(el);

    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    el.show();
    await waitForUpdate(el);

    // Focus must land inside the dialog, not stay on the trigger behind it.
    expect(document.activeElement).not.toBe(trigger);
    expect(el.shadowRoot!.activeElement).toBe(el.shadowRoot!.querySelector('.close-btn'));

    wrapper.remove();
  });

  it('focuses slotted content when there is no heading', async () => {
    const wrapper = createElement('<reke-dialog><button id="inner">ok</button></reke-dialog>');
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    const inner = wrapper.querySelector('#inner')! as HTMLButtonElement;
    await waitForUpdate(el);

    el.show();
    await waitForUpdate(el);

    expect(document.activeElement).toBe(inner);

    wrapper.remove();
  });

  it('restores focus to the trigger when it closes', async () => {
    const wrapper = createElement(
      '<button id="trigger">open</button><reke-dialog heading="Test Dialog"><button id="inner">ok</button></reke-dialog>',
    );
    const trigger = wrapper.querySelector('#trigger')! as HTMLButtonElement;
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    await waitForUpdate(el);

    trigger.focus();
    el.show();
    await waitForUpdate(el);

    el.close();
    await waitForUpdate(el);

    expect(document.activeElement).toBe(trigger);

    wrapper.remove();
  });

  it('traps Tab from the last focusable back to the first', async () => {
    const wrapper = createElement(
      '<button id="trigger">open</button><reke-dialog heading="Test Dialog" open><button id="inner">ok</button></reke-dialog>',
    );
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    const inner = wrapper.querySelector('#inner')! as HTMLButtonElement;
    await waitForUpdate(el);

    // `#inner` is the last focusable: close-btn (shadow header) comes before it.
    inner.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await waitForUpdate(el);

    expect(el.shadowRoot!.activeElement).toBe(el.shadowRoot!.querySelector('.close-btn'));

    wrapper.remove();
  });

  it('traps Shift+Tab from the first focusable back to the last', async () => {
    const wrapper = createElement(
      '<button id="trigger">open</button><reke-dialog heading="Test Dialog" open><button id="inner">ok</button></reke-dialog>',
    );
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    const inner = wrapper.querySelector('#inner')! as HTMLButtonElement;
    await waitForUpdate(el);

    const closeBtn = el.shadowRoot!.querySelector('.close-btn')! as HTMLButtonElement;
    closeBtn.focus();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }),
    );
    await waitForUpdate(el);

    expect(document.activeElement).toBe(inner);

    wrapper.remove();
  });

  it('pulls focus back in when Tab fires from outside the dialog', async () => {
    const wrapper = createElement(
      '<button id="trigger">open</button><reke-dialog heading="Test Dialog" open><button id="inner">ok</button></reke-dialog>',
    );
    const trigger = wrapper.querySelector('#trigger')! as HTMLButtonElement;
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    await waitForUpdate(el);

    trigger.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await waitForUpdate(el);

    expect(document.activeElement).not.toBe(trigger);

    wrapper.remove();
  });

  it('does not trap Tab while closed', async () => {
    const wrapper = createElement(
      '<button id="trigger">open</button><reke-dialog heading="Test Dialog"><button id="inner">ok</button></reke-dialog>',
    );
    const trigger = wrapper.querySelector('#trigger')! as HTMLButtonElement;
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    await waitForUpdate(el);

    trigger.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await waitForUpdate(el);

    expect(document.activeElement).toBe(trigger);

    wrapper.remove();
  });

  // --- SCROLL LOCK ---

  it('locks body scroll while open and restores it on close', async () => {
    const wrapper = createElement('<reke-dialog heading="Test Dialog"><p>Body</p></reke-dialog>');
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    await waitForUpdate(el);

    expect(document.body.style.overflow).not.toBe('hidden');

    el.show();
    await waitForUpdate(el);
    expect(document.body.style.overflow).toBe('hidden');

    el.close();
    await waitForUpdate(el);
    expect(document.body.style.overflow).not.toBe('hidden');

    wrapper.remove();
  });

  it('releases the scroll lock when removed while still open', async () => {
    const wrapper = createElement(
      '<reke-dialog heading="Test Dialog" open><p>Body</p></reke-dialog>',
    );
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    await waitForUpdate(el);

    expect(document.body.style.overflow).toBe('hidden');

    wrapper.remove();
    await new Promise((r) => setTimeout(r, 0));

    expect(document.body.style.overflow).not.toBe('hidden');
  });

  // --- TRANSITIONS ---

  it('keeps the panel mounted while the exit animation runs', async () => {
    const wrapper = createElement(
      '<reke-dialog heading="Test Dialog" open><p>Body</p></reke-dialog>',
    );
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    await waitForUpdate(el);

    el.close();
    await waitForUpdate(el);

    // `open` is already false, but the panel survives so it can animate out.
    expect(el.open).toBe(false);
    const panel = el.shadowRoot!.querySelector('.dialog');
    expect(panel).toBeTruthy();
    expect(panel!.classList.contains('is-closing')).toBe(true);

    wrapper.remove();
  });

  it('unmounts the panel once the exit animation finishes', async () => {
    const wrapper = createElement(
      '<reke-dialog heading="Test Dialog" open><p>Body</p></reke-dialog>',
    );
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    await waitForUpdate(el);

    el.close();
    await waitForUpdate(el);
    expect(el.shadowRoot!.querySelector('.dialog')).toBeTruthy();

    await new Promise((r) => setTimeout(r, 500));

    expect(el.shadowRoot!.querySelector('.backdrop')).toBeNull();
    expect(el.shadowRoot!.querySelector('.dialog')).toBeNull();

    wrapper.remove();
  });

  it('cancels the exit when reopened mid-animation', async () => {
    const wrapper = createElement(
      '<reke-dialog heading="Test Dialog" open><p>Body</p></reke-dialog>',
    );
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    await waitForUpdate(el);

    el.close();
    await waitForUpdate(el);
    expect(el.shadowRoot!.querySelector('.dialog.is-closing')).toBeTruthy();

    el.show();
    await waitForUpdate(el);

    const panel = el.shadowRoot!.querySelector('.dialog');
    expect(panel).toBeTruthy();
    expect(panel!.classList.contains('is-closing')).toBe(false);

    // The cancelled exit must not unmount the reopened dialog later.
    await new Promise((r) => setTimeout(r, 500));
    expect(el.shadowRoot!.querySelector('.dialog')).toBeTruthy();

    wrapper.remove();
  });

  it('animates the drawer out as well', async () => {
    const wrapper = createElement(
      '<reke-dialog heading="Drawer" variant="drawer" open><p>Content</p></reke-dialog>',
    );
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    await waitForUpdate(el);

    el.close();
    await waitForUpdate(el);

    const drawer = el.shadowRoot!.querySelector('.drawer');
    expect(drawer).toBeTruthy();
    expect(drawer!.classList.contains('is-closing')).toBe(true);

    wrapper.remove();
  });

  it('releases focus and scroll lock immediately, not after the animation', async () => {
    const wrapper = createElement(
      '<button id="trigger">open</button><reke-dialog heading="Test Dialog"><p>Body</p></reke-dialog>',
    );
    const trigger = wrapper.querySelector('#trigger')! as HTMLButtonElement;
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    await waitForUpdate(el);

    trigger.focus();
    el.show();
    await waitForUpdate(el);

    el.close();
    await waitForUpdate(el);

    // A keyboard user must get focus back right away, even while the panel
    // is still on screen animating out.
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).not.toBe('hidden');

    wrapper.remove();
  });

  it('drops the exit animation when the element is removed mid-close', async () => {
    const wrapper = createElement(
      '<reke-dialog heading="Test Dialog" open><p>Body</p></reke-dialog>',
    );
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    await waitForUpdate(el);

    el.close();
    await waitForUpdate(el);
    wrapper.remove();

    await new Promise((r) => setTimeout(r, 500));

    expect(document.body.style.overflow).not.toBe('hidden');
  });

  // --- ACCESSIBILITY ---

  it('passes axe-core a11y audit when open', async () => {
    const wrapper = createElement(
      '<reke-dialog heading="Accessible Dialog" open><p>Dialog body content</p></reke-dialog>',
    );
    const el = wrapper.querySelector('reke-dialog')! as RekeDialog;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const violations = results.violations.filter((v) => v.id !== 'color-contrast');
    expect(violations).toEqual([]);

    wrapper.remove();
  });
});
