import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './reke-menu.js';
import '../reke-menu-item/reke-menu-item.js';
import '../reke-button/reke-button.js';
import type { RekeMenu } from './reke-menu.js';

const meta: Meta = {
  title: 'Components/Menu',
  component: 'reke-menu',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/** Reports the selected action in the story's status line (no `alert`). */
function report(e: Event, action: string) {
  const status = (e.currentTarget as HTMLElement).closest('.demo')?.querySelector('.status');
  if (status) status.textContent = `Selected: ${action}`;
}

const statusStyle = 'margin-top:12px;font-family:monospace;font-size:12px;color:#8A8A8A';

/** Dropdown anchored below a trigger button. Click the button to toggle. */
export const AnchoredToButton: Story = {
  render: () => html`
    <div class="demo">
      <reke-button
        @reke-click=${(e: Event) => {
          const menu = (e.currentTarget as HTMLElement).nextElementSibling as RekeMenu;
          menu.anchor = e.currentTarget as HTMLElement;
          menu.open = !menu.open;
        }}
      >
        Actions
      </reke-button>
      <reke-menu @reke-close=${(e: Event) => ((e.currentTarget as RekeMenu).open = false)}>
        <reke-menu-item @reke-select=${(e: Event) => report(e, 'Rename')}>Rename</reke-menu-item>
        <reke-menu-item @reke-select=${(e: Event) => report(e, 'Duplicate')}>Duplicate</reke-menu-item>
        <reke-menu-item variant="danger" @reke-select=${(e: Event) => report(e, 'Delete')}>
          Delete
        </reke-menu-item>
      </reke-menu>
      <output class="status" style=${statusStyle}>No action yet</output>
    </div>
  `,
};

/** Context menu opened at the cursor via right-click. */
export const ContextMenu: Story = {
  render: () => html`
    <div class="demo">
      <div
        style="height:180px;border:1px dashed #333;border-radius:4px;display:grid;place-items:center;color:#666;font-family:monospace"
        @contextmenu=${(e: MouseEvent) => {
          e.preventDefault();
          const menu = (e.currentTarget as HTMLElement).querySelector('reke-menu') as RekeMenu;
          menu.x = e.clientX;
          menu.y = e.clientY;
          menu.open = true;
        }}
      >
        Right-click anywhere in this area
        <reke-menu @reke-close=${(e: Event) => ((e.currentTarget as RekeMenu).open = false)}>
          <reke-menu-item @reke-select=${(e: Event) => report(e, 'Cut')}>Cut</reke-menu-item>
          <reke-menu-item @reke-select=${(e: Event) => report(e, 'Copy')}>Copy</reke-menu-item>
          <reke-menu-item @reke-select=${(e: Event) => report(e, 'Paste')}>Paste</reke-menu-item>
          <reke-menu-item variant="danger" @reke-select=${(e: Event) => report(e, 'Delete')}>
            Delete
          </reke-menu-item>
        </reke-menu>
      </div>
      <output class="status" style=${statusStyle}>No action yet</output>
    </div>
  `,
};

/** Items with leading icons, a danger action, and a disabled (skipped by keyboard nav) item. */
export const IconsAndStates: Story = {
  render: () => html`
    <div class="demo">
      <reke-button
        @reke-click=${(e: Event) => {
          const menu = (e.currentTarget as HTMLElement).nextElementSibling as RekeMenu;
          menu.anchor = e.currentTarget as HTMLElement;
          menu.open = !menu.open;
        }}
      >
        Row actions
      </reke-button>
      <reke-menu @reke-close=${(e: Event) => ((e.currentTarget as RekeMenu).open = false)}>
        <reke-menu-item @reke-select=${(e: Event) => report(e, 'Edit')}>
          <span slot="prefix">&#9998;</span> Edit
        </reke-menu-item>
        <reke-menu-item @reke-select=${(e: Event) => report(e, 'Share')}>
          <span slot="prefix">&#8599;</span> Share
        </reke-menu-item>
        <reke-menu-item disabled>
          <span slot="prefix">&#128274;</span> Archive (disabled)
        </reke-menu-item>
        <reke-menu-item variant="danger" @reke-select=${(e: Event) => report(e, 'Delete')}>
          <span slot="prefix">&#128465;</span> Delete
        </reke-menu-item>
      </reke-menu>
      <output class="status" style=${statusStyle}>No action yet</output>
    </div>
  `,
};
