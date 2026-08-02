import { createComponent, type EventName } from '@lit/react';
import React from 'react';
import { RekeAlert } from './components/reke-alert/reke-alert.js';
import { RekeBadge } from './components/reke-badge/reke-badge.js';
import { RekeButton } from './components/reke-button/reke-button.js';
import { RekeCard } from './components/reke-card/reke-card.js';
import { RekeCheckbox } from './components/reke-checkbox/reke-checkbox.js';
import { RekeChip } from './components/reke-chip/reke-chip.js';
import { RekeCombobox } from './components/reke-combobox/reke-combobox.js';
import { RekeDateRange } from './components/reke-date-range/reke-date-range.js';
import { RekeDialog } from './components/reke-dialog/reke-dialog.js';
import { RekeFileUpload } from './components/reke-file-upload/reke-file-upload.js';
import { RekeInput } from './components/reke-input/reke-input.js';
import { RekeMenu } from './components/reke-menu/reke-menu.js';
import { RekeMenuItem } from './components/reke-menu-item/reke-menu-item.js';
import { RekeProgress } from './components/reke-progress/reke-progress.js';
import { RekeSelect } from './components/reke-select/reke-select.js';
import { RekeTextarea } from './components/reke-textarea/reke-textarea.js';
import { RekeToast } from './components/reke-toast/reke-toast.js';
import { RekeToggle } from './components/reke-toggle/reke-toggle.js';
import { RekeTooltip } from './components/reke-tooltip/reke-tooltip.js';

export const Button = createComponent({
  tagName: 'reke-button',
  elementClass: RekeButton,
  react: React,
  events: {
    onRekeClick: 'reke-click' as EventName<CustomEvent>,
  },
});

export const Input = createComponent({
  tagName: 'reke-input',
  elementClass: RekeInput,
  react: React,
  events: {
    onRekeInput: 'reke-input' as EventName<CustomEvent<{ value: string }>>,
    onRekeChange: 'reke-change' as EventName<CustomEvent<{ value: string }>>,
  },
});

export const Textarea = createComponent({
  tagName: 'reke-textarea',
  elementClass: RekeTextarea,
  react: React,
  events: {
    onRekeInput: 'reke-input' as EventName<CustomEvent<{ value: string }>>,
    onRekeChange: 'reke-change' as EventName<CustomEvent<{ value: string }>>,
  },
});

export const Checkbox = createComponent({
  tagName: 'reke-checkbox',
  elementClass: RekeCheckbox,
  react: React,
  events: {
    onRekeChange: 'reke-change' as EventName<CustomEvent<{ checked: boolean }>>,
  },
});

export const Toggle = createComponent({
  tagName: 'reke-toggle',
  elementClass: RekeToggle,
  react: React,
  events: {
    onRekeChange: 'reke-change' as EventName<CustomEvent<{ checked: boolean }>>,
  },
});

export const Badge = createComponent({
  tagName: 'reke-badge',
  elementClass: RekeBadge,
  react: React,
});

// Display-only, so no events to map. `segments` is declared attribute: false on
// the element, and @lit/react assigns it as a property — arrays survive intact.
export const Progress = createComponent({
  tagName: 'reke-progress',
  elementClass: RekeProgress,
  react: React,
});
// Re-exported so React consumers can type a segments array without reaching
// past the bridge into the element module.
export type { RekeProgressSegment } from './components/reke-progress/reke-progress.js';

export const Card = createComponent({
  tagName: 'reke-card',
  elementClass: RekeCard,
  react: React,
});

export const Tooltip = createComponent({
  tagName: 'reke-tooltip',
  elementClass: RekeTooltip,
  react: React,
});

export const Dialog = createComponent({
  tagName: 'reke-dialog',
  elementClass: RekeDialog,
  react: React,
  events: {
    onRekeClose: 'reke-close' as EventName<CustomEvent>,
  },
});

export const Menu = createComponent({
  tagName: 'reke-menu',
  elementClass: RekeMenu,
  react: React,
  events: {
    onRekeClose: 'reke-close' as EventName<CustomEvent>,
  },
});

export const MenuItem = createComponent({
  tagName: 'reke-menu-item',
  elementClass: RekeMenuItem,
  react: React,
  events: {
    onRekeSelect: 'reke-select' as EventName<CustomEvent>,
  },
});

export const Select = createComponent({
  tagName: 'reke-select',
  elementClass: RekeSelect,
  react: React,
  events: {
    onRekeChange: 'reke-change' as EventName<CustomEvent<{ value: string }>>,
  },
});

export const Combobox = createComponent({
  tagName: 'reke-combobox',
  elementClass: RekeCombobox,
  react: React,
  events: {
    onRekeChange: 'reke-change' as EventName<CustomEvent<{ value: string }>>,
    onRekeSearch: 'reke-search' as EventName<CustomEvent<{ query: string }>>,
  },
});

export type {
  ReactExpandedRowRenderer,
  ReactTableColumn,
  TableColumn,
  TableProps,
  TableRow,
} from './react-bridge/table.js';
export { Table } from './react-bridge/table.js';

export const DateRange = createComponent({
  tagName: 'reke-date-range',
  elementClass: RekeDateRange,
  react: React,
  events: {
    onRekeChange: 'reke-change' as EventName<CustomEvent<{ from: string; to: string }>>,
    onRekePreset: 'reke-preset' as EventName<
      CustomEvent<{ preset: string; from: string; to: string }>
    >,
  },
});

export const FileUpload = createComponent({
  tagName: 'reke-file-upload',
  elementClass: RekeFileUpload,
  react: React,
  events: {
    onRekeFileSelect: 'reke-file-select' as EventName<CustomEvent<{ file: File }>>,
    onRekeFileClear: 'reke-file-clear' as EventName<CustomEvent>,
  },
});

export const Alert = createComponent({
  tagName: 'reke-alert',
  elementClass: RekeAlert,
  react: React,
  events: {
    onRekeClose: 'reke-close' as EventName<CustomEvent>,
  },
});

export const Toast = createComponent({
  tagName: 'reke-toast',
  elementClass: RekeToast,
  react: React,
  events: {
    onRekeClose: 'reke-close' as EventName<CustomEvent>,
    onRekeAction: 'reke-action' as EventName<CustomEvent>,
  },
});

export const Chip = createComponent({
  tagName: 'reke-chip',
  elementClass: RekeChip,
  react: React,
  events: {
    onRekeClick: 'reke-click' as EventName<CustomEvent>,
    onRekeDismiss: 'reke-dismiss' as EventName<CustomEvent>,
  },
});
