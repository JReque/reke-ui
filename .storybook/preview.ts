import type { Preview } from '@storybook/web-components';
import '../src/tokens/reke-tokens.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Theme for reke-ui components',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'auto', title: 'Auto (OS)', icon: 'browser' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'dark',
  },
  parameters: {
    backgrounds: { disable: true },
  },
  decorators: [
    (story, context) => {
      const theme = context.globals.theme ?? 'dark';

      if (theme === 'auto') {
        document.documentElement.setAttribute('data-reke-theme', 'auto');
        const isLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        document.body.style.backgroundColor = isLight ? '#FFFFFF' : '#0A0A0B';
      } else {
        document.documentElement.setAttribute('data-reke-theme', theme);
        document.body.style.backgroundColor =
          theme === 'light' ? '#FFFFFF' : '#0A0A0B';
      }

      return story();
    },
  ],
};

export default preview;
