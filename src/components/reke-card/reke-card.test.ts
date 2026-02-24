import { describe, it, expect } from 'vitest';
import './reke-card.js';
import type { RekeCard } from './reke-card.js';
import { runAxe } from '../../test-utils/a11y.js';

function createElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.backgroundColor = '#0A0A0B';
  wrapper.style.padding = '16px';
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

async function waitForUpdate(el: RekeCard): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

describe('reke-card', () => {
  // --- RENDERING ---

  it('renders with default props', async () => {
    const wrapper = createElement('<reke-card>Card content</reke-card>');
    const el = wrapper.querySelector('reke-card')! as RekeCard;
    await waitForUpdate(el);

    expect(el.variant).toBe('default');
    expect(el.padding).toBe('md');

    const card = el.shadowRoot!.querySelector('.card')!;
    expect(card).toBeTruthy();
    expect(card.classList.contains('card--default')).toBe(true);
    expect(card.classList.contains('card--padding-md')).toBe(true);

    wrapper.remove();
  });

  it('renders all variant classes', async () => {
    const variants = ['default', 'elevated', 'outlined'] as const;

    for (const variant of variants) {
      const wrapper = createElement(
        `<reke-card variant="${variant}">Content</reke-card>`,
      );
      const el = wrapper.querySelector('reke-card')! as RekeCard;
      await waitForUpdate(el);

      const card = el.shadowRoot!.querySelector('.card')!;
      expect(card.classList.contains(`card--${variant}`)).toBe(true);

      wrapper.remove();
    }
  });

  it('renders slots', async () => {
    const wrapper = createElement(`
      <reke-card>
        <span slot="header">Header</span>
        Body content
        <span slot="footer">Footer</span>
      </reke-card>
    `);
    const el = wrapper.querySelector('reke-card')! as RekeCard;
    await waitForUpdate(el);

    const slots = el.shadowRoot!.querySelectorAll('slot');
    const slotNames = Array.from(slots).map((s) => s.name || 'default');
    expect(slotNames).toContain('header');
    expect(slotNames).toContain('default');
    expect(slotNames).toContain('footer');

    wrapper.remove();
  });

  // --- BEHAVIOR ---

  // No interactive behavior for card component.

  // --- ACCESSIBILITY ---

  it('passes axe-core a11y audit', async () => {
    const wrapper = createElement(
      '<reke-card>Accessible card content</reke-card>',
    );
    const el = wrapper.querySelector('reke-card')! as RekeCard;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const violations = results.violations.filter(
      (v) => v.id !== 'color-contrast',
    );
    expect(violations).toEqual([]);

    wrapper.remove();
  });
});
