import { describe, it, expect } from 'vitest';
import './reke-badge.js';
import type { RekeBadge } from './reke-badge.js';
import { runAxe } from '../../test-utils/a11y.js';

function createElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.backgroundColor = '#0A0A0B';
  wrapper.style.padding = '16px';
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

async function waitForUpdate(el: RekeBadge): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

describe('reke-badge', () => {
  // --- RENDERING ---

  it('renders with default props', async () => {
    const wrapper = createElement('<reke-badge>Badge</reke-badge>');
    const el = wrapper.querySelector('reke-badge')! as RekeBadge;
    await waitForUpdate(el);

    expect(el.variant).toBe('default');
    expect(el.size).toBe('md');

    const badge = el.shadowRoot!.querySelector('span')!;
    expect(badge).toBeTruthy();
    expect(badge.classList.contains('badge--default')).toBe(true);
    expect(badge.classList.contains('badge--md')).toBe(true);

    wrapper.remove();
  });

  it('renders all variant classes', async () => {
    const variants = [
      'default',
      'primary',
      'secondary',
      'danger',
      'warning',
      'success',
    ] as const;

    for (const variant of variants) {
      const wrapper = createElement(
        `<reke-badge variant="${variant}">${variant}</reke-badge>`,
      );
      const el = wrapper.querySelector('reke-badge')! as RekeBadge;
      await waitForUpdate(el);

      const badge = el.shadowRoot!.querySelector('span')!;
      expect(badge.classList.contains(`badge--${variant}`)).toBe(true);

      wrapper.remove();
    }
  });

  it('renders all size classes', async () => {
    const sizes = ['sm', 'md'] as const;

    for (const size of sizes) {
      const wrapper = createElement(
        `<reke-badge size="${size}">${size}</reke-badge>`,
      );
      const el = wrapper.querySelector('reke-badge')! as RekeBadge;
      await waitForUpdate(el);

      const badge = el.shadowRoot!.querySelector('span')!;
      expect(badge.classList.contains(`badge--${size}`)).toBe(true);

      wrapper.remove();
    }
  });

  it('reflects attributes correctly', async () => {
    const wrapper = createElement(
      '<reke-badge variant="danger" size="sm">Error</reke-badge>',
    );
    const el = wrapper.querySelector('reke-badge')! as RekeBadge;
    await waitForUpdate(el);

    expect(el.variant).toBe('danger');
    expect(el.size).toBe('sm');
    expect(el.getAttribute('variant')).toBe('danger');
    expect(el.getAttribute('size')).toBe('sm');

    wrapper.remove();
  });

  // --- BEHAVIOR ---

  // Badge is presentational — no behavior tests needed.

  // --- ACCESSIBILITY ---

  it('passes axe-core a11y audit', async () => {
    const wrapper = createElement('<reke-badge>Status</reke-badge>');
    const el = wrapper.querySelector('reke-badge')! as RekeBadge;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    expect(results.violations).toEqual([]);

    wrapper.remove();
  });
});
