import { describe, it, expect, vi } from 'vitest';
import './reke-file-upload.js';
import type { RekeFileUpload } from './reke-file-upload.js';
import { runAxe } from '../../test-utils/a11y.js';

function createElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.backgroundColor = '#0A0A0B';
  wrapper.style.padding = '16px';
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

async function waitForUpdate(el: RekeFileUpload): Promise<void> {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

describe('reke-file-upload', () => {
  // --- RENDERING ---

  it('renders with default state', async () => {
    const wrapper = createElement('<reke-file-upload></reke-file-upload>');
    const el = wrapper.querySelector('reke-file-upload')! as RekeFileUpload;
    await waitForUpdate(el);

    const dropzone = el.shadowRoot!.querySelector('.dropzone');
    expect(dropzone).toBeTruthy();

    const text = el.shadowRoot!.querySelector('.text__primary');
    expect(text).toBeTruthy();
    expect(text!.textContent).toContain('drag or select file');

    wrapper.remove();
  });

  it('renders hint text', async () => {
    const wrapper = createElement(
      '<reke-file-upload hint="Max 10MB"></reke-file-upload>',
    );
    const el = wrapper.querySelector('reke-file-upload')! as RekeFileUpload;
    await waitForUpdate(el);

    const hint = el.shadowRoot!.querySelector('.text__secondary');
    expect(hint).toBeTruthy();
    expect(hint!.textContent).toContain('Max 10MB');

    wrapper.remove();
  });

  it('renders compact variant', async () => {
    const wrapper = createElement(
      '<reke-file-upload compact></reke-file-upload>',
    );
    const el = wrapper.querySelector('reke-file-upload')! as RekeFileUpload;
    await waitForUpdate(el);

    const dropzone = el.shadowRoot!.querySelector('.dropzone--compact');
    expect(dropzone).toBeTruthy();

    wrapper.remove();
  });

  it('renders error state with message', async () => {
    const wrapper = createElement(
      '<reke-file-upload error error-message="Invalid format"></reke-file-upload>',
    );
    const el = wrapper.querySelector('reke-file-upload')! as RekeFileUpload;
    await waitForUpdate(el);

    const errorText = el.shadowRoot!.querySelector('.text__error');
    expect(errorText).toBeTruthy();
    expect(errorText!.textContent).toContain('Invalid format');

    const dropzone = el.shadowRoot!.querySelector('.dropzone--error');
    expect(dropzone).toBeTruthy();

    wrapper.remove();
  });

  // --- BEHAVIOR ---

  it('emits reke-file-select when file is dropped', async () => {
    const wrapper = createElement('<reke-file-upload></reke-file-upload>');
    const el = wrapper.querySelector('reke-file-upload')! as RekeFileUpload;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-file-select', handler);

    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    const dropzone = el.shadowRoot!.querySelector('.dropzone')!;
    const dropEvent = new DragEvent('drop', {
      bubbles: true,
      dataTransfer,
    });
    dropzone.dispatchEvent(dropEvent);
    await waitForUpdate(el);

    expect(handler).toHaveBeenCalledOnce();
    expect((handler.mock.calls[0][0] as CustomEvent).detail.file.name).toBe(
      'test.csv',
    );

    wrapper.remove();
  });

  it('shows file name after selection', async () => {
    const wrapper = createElement('<reke-file-upload></reke-file-upload>');
    const el = wrapper.querySelector('reke-file-upload')! as RekeFileUpload;
    await waitForUpdate(el);

    const file = new File(['test'], 'data.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    const dropzone = el.shadowRoot!.querySelector('.dropzone')!;
    dropzone.dispatchEvent(
      new DragEvent('drop', { bubbles: true, dataTransfer }),
    );
    await waitForUpdate(el);

    const fileName = el.shadowRoot!.querySelector('.text__file');
    expect(fileName).toBeTruthy();
    expect(fileName!.textContent).toContain('data.xlsx');

    wrapper.remove();
  });

  it('clears file with clear() method', async () => {
    const wrapper = createElement('<reke-file-upload></reke-file-upload>');
    const el = wrapper.querySelector('reke-file-upload')! as RekeFileUpload;
    await waitForUpdate(el);

    // Drop a file first
    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const dropzone = el.shadowRoot!.querySelector('.dropzone')!;
    dropzone.dispatchEvent(
      new DragEvent('drop', { bubbles: true, dataTransfer }),
    );
    await waitForUpdate(el);

    const clearHandler = vi.fn();
    el.addEventListener('reke-file-clear', clearHandler);

    el.clear();
    await waitForUpdate(el);

    expect(clearHandler).toHaveBeenCalledOnce();
    const fileName = el.shadowRoot!.querySelector('.text__file');
    expect(fileName).toBeNull();

    wrapper.remove();
  });

  it('does not trigger on drop when disabled', async () => {
    const wrapper = createElement(
      '<reke-file-upload disabled></reke-file-upload>',
    );
    const el = wrapper.querySelector('reke-file-upload')! as RekeFileUpload;
    await waitForUpdate(el);

    const handler = vi.fn();
    el.addEventListener('reke-file-select', handler);

    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    const dropzone = el.shadowRoot!.querySelector('.dropzone')!;
    dropzone.dispatchEvent(
      new DragEvent('drop', { bubbles: true, dataTransfer }),
    );
    await waitForUpdate(el);

    expect(handler).not.toHaveBeenCalled();

    wrapper.remove();
  });

  // --- ACCESSIBILITY ---

  it('passes axe-core a11y audit', async () => {
    const wrapper = createElement('<reke-file-upload></reke-file-upload>');
    const el = wrapper.querySelector('reke-file-upload')! as RekeFileUpload;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const violations = results.violations.filter(
      (v) => v.id !== 'color-contrast',
    );
    expect(violations).toEqual([]);

    wrapper.remove();
  });

  it('passes a11y audit for disabled state', async () => {
    const wrapper = createElement(
      '<reke-file-upload disabled></reke-file-upload>',
    );
    const el = wrapper.querySelector('reke-file-upload')! as RekeFileUpload;
    await waitForUpdate(el);

    const results = await runAxe(wrapper);
    const violations = results.violations.filter(
      (v) => v.id !== 'color-contrast',
    );
    expect(violations).toEqual([]);

    wrapper.remove();
  });
});
