import type { Preview } from '@storybook/web-components';
import '../src/tokens/reke-tokens.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0A0A0B' },
        { name: 'surface', value: '#1A1A1A' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
};

export default preview;
