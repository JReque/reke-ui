import { LitElement } from 'lit';

export class RekeElement extends LitElement {
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
