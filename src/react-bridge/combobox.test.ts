/**
 * React bridge tests for `reke-combobox`.
 *
 * Same constraints as `table.test.ts`: Vitest browser mode (real Chromium),
 * real React + react-dom, no JSX so the file stays a plain `.ts`.
 *
 * The regression target: a `TemplateResult` built by a duplicated `lit`
 * instance fails Lit's brand check and renders as `[object Object]`. The
 * bridge MUST hand Lit raw DOM nodes for React output.
 */

import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import type { ComboboxOption, RekeCombobox } from '../components/reke-combobox/reke-combobox.js';
import { Combobox, type ComboboxProps } from './combobox.js';

const options: ComboboxOption[] = [
  { value: 'btc', label: 'Bitcoin' },
  { value: 'eth', label: 'Ethereum' },
  { value: 'sol', label: 'Solana' },
];

async function mountBridge(initialProps: ComboboxProps): Promise<{
  wrapper: HTMLElement;
  getCombobox: () => RekeCombobox;
  rerender: (props: ComboboxProps) => Promise<void>;
  unmount: () => void;
}> {
  const wrapper = document.createElement('div');
  document.body.appendChild(wrapper);

  const root = ReactDOMClient.createRoot(wrapper);
  const render = (props: ComboboxProps) =>
    root.render(React.createElement(Combobox as React.ComponentType<ComboboxProps>, props));

  const flush = async () => {
    await new Promise((r) => setTimeout(r, 0));
    const el = wrapper.querySelector('reke-combobox') as RekeCombobox | null;
    if (el) await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
  };

  render(initialProps);
  await flush();

  const getCombobox = (): RekeCombobox => {
    const el = wrapper.querySelector('reke-combobox');
    if (!el) throw new Error('reke-combobox not mounted');
    return el as RekeCombobox;
  };

  return {
    wrapper,
    getCombobox,
    rerender: async (props: ComboboxProps) => {
      render(props);
      await flush();
    },
    unmount: () => {
      root.unmount();
      wrapper.remove();
    },
  };
}

async function settle(el: RekeCombobox): Promise<void> {
  await new Promise((r) => setTimeout(r, 0));
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

/** Focus opens the dropdown. */
async function openDropdown(el: RekeCombobox): Promise<void> {
  const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
  input.dispatchEvent(new FocusEvent('focus'));
  await settle(el);
}

describe('react-bridge / Combobox', () => {
  it('optionRender returning JSX renders real DOM and never emits `[object Object]`', async () => {
    const Row: React.FC<{ option: ComboboxOption }> = ({ option }) =>
      React.createElement('span', { 'data-testid': `opt-${option.value}` }, option.label);

    const { getCombobox, unmount } = await mountBridge({
      options,
      optionRender: (option) => React.createElement(Row, { option }),
    });

    const el = getCombobox();
    await openDropdown(el);

    const rendered = el.shadowRoot!.querySelector('[data-testid="opt-btc"]');
    expect(rendered).toBeTruthy();
    expect(rendered!.textContent).toBe('Bitcoin');
    expect(el.shadowRoot!.querySelectorAll('[data-testid^="opt-"]').length).toBe(3);
    expect((el.shadowRoot!.textContent ?? '').includes('[object Object]')).toBe(false);

    unmount();
  });

  it('optionRender returning a string passes through without mounting a React root', async () => {
    const { getCombobox, unmount } = await mountBridge({
      options,
      optionRender: (option) => `plain-${option.label}`,
    });

    const el = getCombobox();
    await openDropdown(el);

    const items = el.shadowRoot!.querySelectorAll('li[part="option"]');
    expect(items.length).toBe(3);
    expect(items[0].textContent).toContain('plain-Bitcoin');
    // No host <span style="display: contents"> was created for a string return,
    // i.e. no React root was mounted — the string went straight to Lit.
    expect(items[0].querySelector('span[style*="contents"]')).toBeNull();
    expect(items[0].querySelector('span')).toBeNull();

    unmount();
  });

  it('clicking custom-rendered content still fires reke-change', async () => {
    const onRekeChange = vi.fn();

    const { getCombobox, unmount } = await mountBridge({
      options,
      onRekeChange,
      optionRender: (option) =>
        React.createElement('b', { 'data-testid': `opt-${option.value}` }, option.label),
    });

    const el = getCombobox();
    await openDropdown(el);

    const target = el.shadowRoot!.querySelector('[data-testid="opt-eth"]') as HTMLElement;
    target.click();
    await settle(el);

    expect(onRekeChange).toHaveBeenCalledTimes(1);
    expect(onRekeChange.mock.calls[0][0].detail).toEqual({ value: 'eth' });
    expect(el.value).toBe('eth');

    unmount();
  });

  it('releases React roots for options that no longer exist', async () => {
    const unmountSpy = vi.fn();
    const Row: React.FC<{ option: ComboboxOption }> = ({ option }) => {
      React.useEffect(() => () => unmountSpy(option.value), [option.value]);
      return React.createElement('span', { 'data-testid': `opt-${option.value}` }, option.label);
    };
    const optionRender = (option: ComboboxOption) => React.createElement(Row, { option });

    const { getCombobox, rerender, unmount } = await mountBridge({ options, optionRender });

    const el = getCombobox();
    await openDropdown(el);
    expect(el.shadowRoot!.querySelectorAll('[data-testid^="opt-"]').length).toBe(3);

    // Drop 'sol' — its root must be unmounted and removed.
    await rerender({ options: options.slice(0, 2), optionRender });
    await settle(el);

    expect(el.shadowRoot!.querySelectorAll('[data-testid^="opt-"]').length).toBe(2);
    expect(unmountSpy).toHaveBeenCalledWith('sol');
    expect(unmountSpy).not.toHaveBeenCalledWith('btc');

    unmount();
  });

  it('unmounting the bridge unmounts every cached React root', async () => {
    const unmountSpy = vi.fn();
    const Row: React.FC<{ option: ComboboxOption }> = ({ option }) => {
      React.useEffect(() => () => unmountSpy(), []);
      return React.createElement('span', null, option.label);
    };

    const { getCombobox, unmount } = await mountBridge({
      options,
      optionRender: (option) => React.createElement(Row, { option }),
    });

    await openDropdown(getCombobox());
    unmount();

    expect(unmountSpy).toHaveBeenCalled();
  });
});
