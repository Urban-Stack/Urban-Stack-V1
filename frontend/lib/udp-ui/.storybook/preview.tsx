import type { Preview } from '@storybook/react';
import '@fontsource/poppins/100.css';
import '@fontsource/poppins/200.css';
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '@fontsource/poppins/900.css';
import '@/lib/index.css';
import './util/test-theme.css';
import { ThemeConfig } from 'flowbite-react';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'white',
      values: [
        { name: 'white', value: '#FFFFFF' },
        { name: 'gray', value: '#F6F6F6' },
      ],
    },
  },

  decorators: [
    (Story) => {
      return (
        <div style={{ fontFamily: 'Poppins, sans-serif' }}>
          <ThemeConfig dark={false} />
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
