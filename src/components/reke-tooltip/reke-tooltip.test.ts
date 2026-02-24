import { describe, it, expect } from 'vitest';
import './reke-tooltip.js';
import type { RekeTooltip } from './reke-tooltip.js';
import { runAxe } from '../../test-utils/a11y.js';

function createElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.backgroundColor = '#0A0A0B';
  wrapper.style.padding = '16px';
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

async function waitForUpdate(el: RekeTooltip): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

describe('reke-tooltip', () => {
  // --- RENDERING ---

  it('renders with text', async () => {
    const wrapper = createElement(
      '<reke-tooltip text="Help"><button>Hover me</button></reke-tooltip>',
    );
    const el = wrapper.querySelector('reke-tooltip')! as RekeTooltip;
    await waitForUpdate(el);

    expect(el.text).toBe('Help');

    const tooltip = el.shadowRoot!.querySelector('[role="tooltip"]')!;
    expect(tooltip).toBeTruthy();
    expect(tooltip.textContent!.trim()).toBe('Help');

    wrapper.remove();
  });

  it('is hidden by default', async () => {
    const wrapper = createElement(
      '<reke-tooltip text="Help"><button>Hover me</button></reke-tooltip>',
    );
    const el = wrapper.querySelector('reke-tooltip')! as RekeTooltip;
    await waitForUpdate(el);

    const tooltip = el.shadowRoot!.querySelector('[role="tooltip"]')!;
    expect(tooltip.classList.contains('tooltip--visible')).toBe(false);

    wrapper.remove();
  });

  // --- BEHAVIOR ---

  it('shows on mouseenter', async () => {
    const wrapper = createElement(
      '<reke-tooltip text="Help" delay="0"><button>Hover me</button></reke-tooltip>',
    );
    const el = wrapper.querySelector('reke-tooltip')! as RekeTooltip;
    await waitForUpdate(el);

    const triggerWrapper = el.shadowRoot!.querySelector('.wrapper')!;
    triggerWrapper.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

    // Wait for delay (0ms) + Lit update
    await new Promise((r) => setTimeout(r, 50));
    await waitForUpdate(el);

    const tooltip = el.shadowRoot!.querySelector('[role="tooltip"]')!;
    expect(tooltip.classList.contains('tooltip--visible')).toBe(true);

    wrapper.remove();
  });

  it('hides on mouseleave', async () => {
    const wrapper = createElement(
      '<reke-tooltip text="Help" delay="0"><button>Hover me</button></reke-tooltip>',
    );
    const el = wrapper.querySelector('reke-tooltip')! as RekeTooltip;
    await waitForUpdate(el);

    const triggerWrapper = el.shadowRoot!.querySelector('.wrapper')!;
    triggerWrapper.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 50));
    await waitForUpdate(el);

    triggerWrapper.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 50));
    await waitForUpdate(el);

    const tooltip = el.shadowRoot!.querySelector('[role="tooltip"]')!;
    expect(tooltip.classList.contains('tooltip--visible')).toBe(false);

    wrapper.remove();
  });

  // --- ACCESSIBILITY ---

  it('passes axe-core a11y audit', async () => {
    const wrapper = createElement(
      '<reke-tooltip text="Help"><button>Hover me</button></reke-tooltip>',
    );
    const el = wrapper.querySelector('reke-tooltip')! as RekeTooltip;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    expect(results.violations).toEqual([]);

    wrapper.remove();
  });
});
