import axe, { type AxeResults } from 'axe-core';

export async function runAxe(container: HTMLElement): Promise<AxeResults> {
  await new Promise((r) => setTimeout(r, 50));
  return axe.run(container);
}
