/**
 * React wrapper around `reke-combobox`.
 *
 * Lets React consumers pass `React.ReactNode` (JSX) from `optionRender` while
 * the underlying Lit element receives raw DOM nodes.
 *
 * Returning raw DOM nodes instead of `html\`${host}\`` is deliberate: a
 * `TemplateResult` from a duplicated `lit` instance (npm symlink, Module
 * Federation) fails Lit's brand check and renders as `[object Object]`.
 */
import { createComponent, type EventName } from '@lit/react';
import type { TemplateResult } from 'lit';
import React, { useEffect, useMemo, useRef } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';
import {
  type ComboboxOption,
  type ComboboxOptionRender,
  type ComboboxSize,
  RekeCombobox as RekeComboboxClass,
} from '../components/reke-combobox/reke-combobox.js';

const RawCombobox = createComponent({
  tagName: 'reke-combobox',
  elementClass: RekeComboboxClass,
  react: React,
  events: {
    onRekeChange: 'reke-change' as EventName<CustomEvent<{ value?: string; values?: string[] }>>,
    onRekeSearch: 'reke-search' as EventName<CustomEvent<{ query: string }>>,
  },
});

/**
 * Option renderer. Return any of:
 *  - `ReactNode` (JSX) — bridged via a React root, handed to Lit as a raw DOM node
 *  - `Node` / `HTMLElement` — passed through (escape hatch for hand-built DOM)
 *  - `string` / `TemplateResult` — passed through (Lit-native)
 *
 * Display-only: `label` still drives filtering, the input value and the
 * multi-select summary.
 */
export type ReactComboboxOptionRender = (
  option: ComboboxOption,
  index: number,
) => React.ReactNode | TemplateResult | string | Node;

export interface ComboboxProps {
  value?: string;
  placeholder?: string;
  options?: ComboboxOption[];
  optionRender?: ReactComboboxOptionRender;
  multiple?: boolean;
  tags?: boolean;
  values?: string[];
  disabled?: boolean;
  error?: boolean;
  label?: string;
  emptyText?: string;
  size?: ComboboxSize;
  onRekeChange?: (e: CustomEvent<{ value?: string; values?: string[] }>) => void;
  onRekeSearch?: (e: CustomEvent<{ query: string }>) => void;
  children?: React.ReactNode;
}

type OptionHost = { root: Root; host: HTMLSpanElement; option: ComboboxOption; index: number };

/** Strings, numbers, raw nodes and `TemplateResult`s go to Lit untouched; everything else mounts via a React root. */
function passThroughNonReact(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' || typeof value === 'number') return true;
  if (value instanceof Node) return true;
  return false;
}

/** Renders `element` into `root`. Pass `sync: false` to skip `flushSync` for re-renders of already-mounted roots. */
function renderIntoRoot(root: Root, element: React.ReactNode, sync = true): void {
  if (!sync) {
    root.render(element as React.ReactElement);
    return;
  }
  // flushSync throws if called mid-render; fall back to async render.
  try {
    flushSync(() => {
      root.render(element as React.ReactElement);
    });
  } catch {
    root.render(element as React.ReactElement);
  }
}

function ComboboxInner(props: ComboboxProps, ref: React.Ref<RekeComboboxClass>): React.ReactElement {
  const { optionRender, children, ...rest } = props;

  // Roots keyed by option `value` — a stable identity. Index would shift on
  // every keystroke in the search box, remounting every option.
  const hostsRef = useRef<Map<string, OptionHost>>(new Map());
  const usedRef = useRef<Set<string>>(new Set());

  // Latest closure without changing the property identity handed to Lit.
  const renderRef = useRef<ReactComboboxOptionRender | undefined>(optionRender);
  renderRef.current = optionRender;

  useEffect(() => {
    const hosts = hostsRef.current;
    return () => {
      for (const { root } of hosts.values()) root.unmount();
      hosts.clear();
    };
  }, []);

  usedRef.current = new Set();

  const wrappedRender = useMemo<ComboboxOptionRender | null>(() => {
    if (!optionRender) return null;
    return (option, index) => {
      const callback = renderRef.current;
      if (!callback) return '';
      const out = callback(option, index);
      if (passThroughNonReact(out)) {
        usedRef.current.add(option.value);
        return (out ?? '') as TemplateResult | string | Node;
      }
      let entry = hostsRef.current.get(option.value);
      if (!entry) {
        const host = document.createElement('span');
        // display: contents so the host adds no layout box — React children
        // render as direct children of the <li>.
        host.style.cssText = 'display: contents;';
        entry = { root: createRoot(host), host, option, index };
        hostsRef.current.set(option.value, entry);
      }
      entry.option = option;
      entry.index = index;
      usedRef.current.add(option.value);
      renderIntoRoot(entry.root, out as React.ReactNode);
      return entry.host;
    };
    // Identity flips only on toggle on/off; closure updates go via renderRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!optionRender]);

  // Lit only re-invokes optionRender when it re-renders, so push new closures
  // into already-mounted roots on every parent commit.
  useEffect(() => {
    if (!optionRender) return;
    for (const entry of hostsRef.current.values()) {
      const out = optionRender(entry.option, entry.index);
      if (passThroughNonReact(out)) continue;
      renderIntoRoot(entry.root, out as React.ReactNode, false);
    }
  }, [optionRender]);

  // GC roots for options that no longer exist.
  useEffect(() => {
    const used = usedRef.current;
    for (const [key, entry] of hostsRef.current) {
      if (!used.has(key)) {
        entry.root.unmount();
        hostsRef.current.delete(key);
      }
    }
  });

  return React.createElement(
    RawCombobox,
    {
      ...rest,
      ref,
      optionRender: wrappedRender,
    } as unknown as React.ComponentProps<typeof RawCombobox>,
    children,
  );
}

export const Combobox = React.forwardRef(ComboboxInner);

export type {
  ComboboxOption,
  ComboboxOptionRender,
  ComboboxSize,
} from '../components/reke-combobox/reke-combobox.js';
export { RekeCombobox } from '../components/reke-combobox/reke-combobox.js';
