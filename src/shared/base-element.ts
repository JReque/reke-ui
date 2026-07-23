import { LitElement } from 'lit';

export class RekeElement extends LitElement {
  // delegatesFocus routes host .focus() and click-to-focus to the first
  // focusable node in the shadow tree (e.g. the inner <input>).
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  protected emit<T>(name: string, detail?: T): boolean {
    return this.dispatchEvent(
      new CustomEvent(name, {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail,
      }),
    );
  }
}
