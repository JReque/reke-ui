import { createComponent, type EventName } from '@lit/react';
import React from 'react';

import { RekeButton } from './components/reke-button/reke-button.js';
import { RekeInput } from './components/reke-input/reke-input.js';
import { RekeTextarea } from './components/reke-textarea/reke-textarea.js';
import { RekeCheckbox } from './components/reke-checkbox/reke-checkbox.js';
import { RekeToggle } from './components/reke-toggle/reke-toggle.js';
import { RekeBadge } from './components/reke-badge/reke-badge.js';
import { RekeCard } from './components/reke-card/reke-card.js';
import { RekeTooltip } from './components/reke-tooltip/reke-tooltip.js';
import { RekeDialog } from './components/reke-dialog/reke-dialog.js';
import { RekeSelect } from './components/reke-select/reke-select.js';
import { RekeTable } from './components/reke-table/reke-table.js';
import { RekeDateRange } from './components/reke-date-range/reke-date-range.js';
import { RekeFileUpload } from './components/reke-file-upload/reke-file-upload.js';
import { RekeAlert } from './components/reke-alert/reke-alert.js';
import { RekeToast } from './components/reke-toast/reke-toast.js';
import { RekeChip } from './components/reke-chip/reke-chip.js';

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

export const Select = createComponent({
  tagName: 'reke-select',
  elementClass: RekeSelect,
  react: React,
  events: {
    onRekeChange: 'reke-change' as EventName<CustomEvent<{ value: string }>>,
  },
});

export const Table = createComponent({
  tagName: 'reke-table',
  elementClass: RekeTable,
  react: React,
  events: {
    onRekeRowClick: 'reke-row-click' as EventName<CustomEvent<{ row: unknown; index: number }>>,
    onRekeSort: 'reke-sort' as EventName<CustomEvent<{ key: string; direction: 'asc' | 'desc' }>>,
    onRekeRowExpand: 'reke-row-expand' as EventName<CustomEvent<{ row: unknown; index: number; expanded: boolean }>>,
  },
});

export const DateRange = createComponent({
  tagName: 'reke-date-range',
  elementClass: RekeDateRange,
  react: React,
  events: {
    onRekeChange: 'reke-change' as EventName<CustomEvent<{ from: string; to: string }>>,
    onRekePreset: 'reke-preset' as EventName<CustomEvent<{ preset: string; from: string; to: string }>>,
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
