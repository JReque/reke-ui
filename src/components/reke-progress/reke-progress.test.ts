import { describe, expect, it } from 'vitest';
import './reke-progress.js';
import { runAxe } from '../../test-utils/a11y.js';
import type { RekeProgress } from './reke-progress.js';

function createElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

async function waitForUpdate(el: RekeProgress): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

function track(el: RekeProgress): HTMLElement {
  return el.shadowRoot!.querySelector('.track')!;
}

function segments(el: RekeProgress): HTMLElement[] {
  return Array.from(el.shadowRoot!.querySelectorAll('.segment'));
}

describe('reke-progress', () => {
  // --- RENDERING ---

  it('renders with default props', async () => {
    const wrapper = createElement('<reke-progress></reke-progress>');
    const el = wrapper.querySelector('reke-progress')! as RekeProgress;
    await waitForUpdate(el);

    expect(el.value).toBe(0);
    expect(el.color).toBe('');
    expect(el.segments).toEqual([]);
    expect(el.indeterminate).toBe(false);

    expect(track(el)).toBeTruthy();
    expect(segments(el)).toHaveLength(1);
    expect(segments(el)[0].style.width).toBe('0%');

    wrapper.remove();
  });

  it('reflects value to the fill width', async () => {
    const wrapper = createElement('<reke-progress value="40"></reke-progress>');
    const el = wrapper.querySelector('reke-progress')! as RekeProgress;
    await waitForUpdate(el);

    expect(el.value).toBe(40);
    expect(segments(el)[0].style.width).toBe('40%');

    wrapper.remove();
  });

  it('applies a custom color', async () => {
    const wrapper = createElement('<reke-progress value="50" color="#FF00FF"></reke-progress>');
    const el = wrapper.querySelector('reke-progress')! as RekeProgress;
    await waitForUpdate(el);

    expect(segments(el)[0].style.backgroundColor).toBe('rgb(255, 0, 255)');

    wrapper.remove();
  });

  it('renders up to 3 segments with the correct widths', async () => {
    const wrapper = createElement('<reke-progress></reke-progress>');
    const el = wrapper.querySelector('reke-progress')! as RekeProgress;
    el.segments = [
      { value: 10, color: '#22C55E' },
      { value: 20, color: '#3B82F6' },
      { value: 60, color: '#F59E0B' },
    ];
    await waitForUpdate(el);

    const parts = segments(el);
    expect(parts).toHaveLength(3);
    expect(parts.map((p) => p.style.width)).toEqual(['10%', '20%', '60%']);

    wrapper.remove();
  });

  it('ignores a 4th segment', async () => {
    const wrapper = createElement('<reke-progress></reke-progress>');
    const el = wrapper.querySelector('reke-progress')! as RekeProgress;
    el.segments = [
      { value: 10, color: '#22C55E' },
      { value: 20, color: '#3B82F6' },
      { value: 30, color: '#F59E0B' },
      { value: 40, color: '#EF4444' },
    ];
    await waitForUpdate(el);

    expect(segments(el)).toHaveLength(3);

    wrapper.remove();
  });

  it('clamps the accumulated segment width at 100', async () => {
    const wrapper = createElement('<reke-progress></reke-progress>');
    const el = wrapper.querySelector('reke-progress')! as RekeProgress;
    el.segments = [
      { value: 50, color: '#22C55E' },
      { value: 60, color: '#3B82F6' },
      { value: 70, color: '#F59E0B' },
    ];
    await waitForUpdate(el);

    expect(segments(el).map((p) => p.style.width)).toEqual(['50%', '50%', '0%']);

    wrapper.remove();
  });

  // --- BEHAVIOR ---

  it('clamps a value below 0', async () => {
    const wrapper = createElement('<reke-progress value="-20"></reke-progress>');
    const el = wrapper.querySelector('reke-progress')! as RekeProgress;
    await waitForUpdate(el);

    expect(el.value).toBe(0);
    expect(el.getAttribute('value')).toBe('0');
    expect(segments(el)[0].style.width).toBe('0%');
    expect(track(el).getAttribute('aria-valuenow')).toBe('0');

    wrapper.remove();
  });

  it('clamps a value above 100', async () => {
    const wrapper = createElement('<reke-progress value="150"></reke-progress>');
    const el = wrapper.querySelector('reke-progress')! as RekeProgress;
    await waitForUpdate(el);

    expect(el.value).toBe(100);
    expect(el.getAttribute('value')).toBe('100');
    expect(segments(el)[0].style.width).toBe('100%');
    expect(track(el).getAttribute('aria-valuenow')).toBe('100');

    wrapper.remove();
  });

  it('normalizes a non-numeric value attribute to 0', async () => {
    const wrapper = createElement('<reke-progress value="abc"></reke-progress>');
    const el = wrapper.querySelector('reke-progress')! as RekeProgress;
    await waitForUpdate(el);

    expect(el.value).toBe(0);
    expect(el.getAttribute('value')).toBe('0');

    wrapper.remove();
  });

  it('normalizes the value property when set out of range at runtime', async () => {
    const wrapper = createElement('<reke-progress value="40"></reke-progress>');
    const el = wrapper.querySelector('reke-progress')! as RekeProgress;
    await waitForUpdate(el);

    el.value = 150;
    await waitForUpdate(el);
    expect(el.value).toBe(100);

    el.value = -20;
    await waitForUpdate(el);
    expect(el.value).toBe(0);

    wrapper.remove();
  });

  it('falls back to single-value mode when segments is an empty array', async () => {
    const wrapper = createElement('<reke-progress value="40"></reke-progress>');
    const el = wrapper.querySelector('reke-progress')! as RekeProgress;
    el.segments = [];
    await waitForUpdate(el);

    const parts = segments(el);
    expect(parts).toHaveLength(1);
    expect(parts[0].style.width).toBe('40%');
    expect(track(el).getAttribute('aria-valuenow')).toBe('40');

    wrapper.remove();
  });

  it('gives segments precedence over value', async () => {
    const wrapper = createElement('<reke-progress value="90" color="#FF0000"></reke-progress>');
    const el = wrapper.querySelector('reke-progress')! as RekeProgress;
    el.segments = [
      { value: 10, color: '#22C55E' },
      { value: 20, color: '#3B82F6' },
    ];
    await waitForUpdate(el);

    const parts = segments(el);
    expect(parts).toHaveLength(2);
    expect(parts.map((p) => p.style.width)).toEqual(['10%', '20%']);
    expect(parts[0].style.backgroundColor).toBe('rgb(34, 197, 94)');

    wrapper.remove();
  });

  it('ignores value and segments when indeterminate', async () => {
    const wrapper = createElement('<reke-progress value="40" indeterminate></reke-progress>');
    const el = wrapper.querySelector('reke-progress')! as RekeProgress;
    el.segments = [
      { value: 10, color: '#22C55E' },
      { value: 20, color: '#3B82F6' },
    ];
    await waitForUpdate(el);

    const parts = segments(el);
    expect(parts).toHaveLength(1);
    expect(parts[0].classList.contains('segment--indeterminate')).toBe(true);
    expect(parts[0].style.width).toBe('');

    wrapper.remove();
  });

  it('toggles the indeterminate class reactively', async () => {
    const wrapper = createElement('<reke-progress value="40"></reke-progress>');
    const el = wrapper.querySelector('reke-progress')! as RekeProgress;
    await waitForUpdate(el);

    expect(segments(el)[0].classList.contains('segment--indeterminate')).toBe(false);

    el.indeterminate = true;
    await waitForUpdate(el);

    expect(segments(el)[0].classList.contains('segment--indeterminate')).toBe(true);
    expect(el.hasAttribute('indeterminate')).toBe(true);

    wrapper.remove();
  });

  // --- ACCESSIBILITY ---

  it('exposes the progressbar role and aria bounds in determinate mode', async () => {
    const wrapper = createElement('<reke-progress value="40"></reke-progress>');
    const el = wrapper.querySelector('reke-progress')! as RekeProgress;
    await waitForUpdate(el);

    const bar = track(el);
    expect(bar.getAttribute('role')).toBe('progressbar');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
    expect(bar.getAttribute('aria-valuenow')).toBe('40');

    wrapper.remove();
  });

  it('sets aria-valuenow to the segment total in segments mode', async () => {
    const wrapper = createElement('<reke-progress></reke-progress>');
    const el = wrapper.querySelector('reke-progress')! as RekeProgress;
    el.segments = [
      { value: 10, color: '#22C55E' },
      { value: 20, color: '#3B82F6' },
      { value: 60, color: '#F59E0B' },
    ];
    await waitForUpdate(el);

    expect(track(el).getAttribute('aria-valuenow')).toBe('90');

    wrapper.remove();
  });

  it('omits aria-valuenow in indeterminate mode', async () => {
    const wrapper = createElement('<reke-progress value="40" indeterminate></reke-progress>');
    const el = wrapper.querySelector('reke-progress')! as RekeProgress;
    await waitForUpdate(el);

    expect(track(el).hasAttribute('aria-valuenow')).toBe(false);

    wrapper.remove();
  });

  it('forwards an aria-label set after first render', async () => {
    const wrapper = createElement('<reke-progress value="40"></reke-progress>');
    const el = wrapper.querySelector('reke-progress')! as RekeProgress;
    await waitForUpdate(el);

    expect(track(el).hasAttribute('aria-label')).toBe(false);

    el.setAttribute('aria-label', 'Upload progress');
    await waitForUpdate(el);

    expect(track(el).getAttribute('aria-label')).toBe('Upload progress');

    wrapper.remove();
  });

  it('forwards an aria-label set after first render in indeterminate mode', async () => {
    const wrapper = createElement('<reke-progress indeterminate></reke-progress>');
    const el = wrapper.querySelector('reke-progress')! as RekeProgress;
    await waitForUpdate(el);

    expect(track(el).hasAttribute('aria-label')).toBe(false);

    el.setAttribute('aria-label', 'Loading');
    await waitForUpdate(el);

    expect(track(el).getAttribute('aria-label')).toBe('Loading');

    wrapper.remove();
  });

  it('passes axe-core a11y audit in default state', async () => {
    const wrapper = createElement(
      '<reke-progress aria-label="Upload progress" value="40"></reke-progress>',
    );
    const el = wrapper.querySelector('reke-progress')! as RekeProgress;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    expect(results.violations).toEqual([]);

    wrapper.remove();
  });

  it('passes axe-core a11y audit in segments mode', async () => {
    const wrapper = createElement('<reke-progress aria-label="Storage usage"></reke-progress>');
    const el = wrapper.querySelector('reke-progress')! as RekeProgress;
    el.segments = [
      { value: 10, color: '#22C55E' },
      { value: 20, color: '#3B82F6' },
      { value: 60, color: '#F59E0B' },
    ];
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    expect(results.violations).toEqual([]);

    wrapper.remove();
  });

  it('passes axe-core a11y audit in indeterminate mode', async () => {
    const wrapper = createElement(
      '<reke-progress aria-label="Loading" indeterminate></reke-progress>',
    );
    const el = wrapper.querySelector('reke-progress')! as RekeProgress;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    expect(results.violations).toEqual([]);

    wrapper.remove();
  });
});
