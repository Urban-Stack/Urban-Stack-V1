import type { Config } from 'tailwindcss';

// header: 4rem
// main padding: 2 * 1.5rem
// footer: 3.5rem
const viewHeightPage = { vhp: 'calc(100vh - 4rem - 3rem - 3.5rem)' };

const userConfig: Partial<Config> = {
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      height: {
        ...viewHeightPage,
      },
      minHeight: {
        ...viewHeightPage,
      },
      maxHeight: {
        ...viewHeightPage,
      },
      // Colors defined in Figma: https://www.figma.com/design/lK8UW1OroyKkz1dpehYVic/UGH?node-id=990-6390&t=mzVvTMYhOk2xWLah-4
      colors: {
        primary: {
          '900': 'hsl(var(--color-primary-900))',
          '800': 'hsl(var(--color-primary-800))',
          '700': 'hsl(var(--color-primary-700))',
          '600': 'hsl(var(--color-primary-600))',
          '500': 'hsl(var(--color-primary-500))',
          '400': 'hsl(var(--color-primary-400))',
          '300': 'hsl(var(--color-primary-300))',
          '200': 'hsl(var(--color-primary-200))',
          '100': 'hsl(var(--color-primary-100))',
          '50': 'hsl(var(--color-primary-50))',
        },
        gray: {
          '950': '#0A0C10',
          '900': '#131720',
          '800': '#29303D',
          '700': '#444955',
          '600': '#5E636E',
          '500': '#787D87',
          '400': '#93979F',
          '300': '#AEB2B7',
          '200': '#CACCCE',
          '100': '#E5E5E5',
          '50': '#F2F2F2',
        },
        success: {
          '950': '#05140B',
          '900': '#0A2917',
          '800': '#14522E',
          '700': '#1F7A44',
          '600': '#29A35B',
          '500': '#33CC72',
          '400': '#5CD68E',
          '300': '#85E0AA',
          '200': '#ADEBC7',
          '100': '#D6F5E3',
          '50': '#E7F9EE',
        },
        warning: {
          '950': '#191000',
          '900': '#332100',
          '800': '#654201',
          '700': '#986301',
          '600': '#CA8402',
          '500': '#FDA502',
          '400': '#FDB735',
          '300': '#FEC967',
          '200': '#FEDB9A',
          '100': '#FFEDCC',
          '50': '#FFF6E6',
        },
        danger: {
          '950': '#180302',
          '900': '#2F0604',
          '800': '#5F0D07',
          '700': '#8E130B',
          '600': '#BE1A0E',
          '500': '#ED2012',
          '400': '#F14D41',
          '300': '#F47971',
          '200': '#F8A6A0',
          '100': '#FBD2D0',
          '50': '#FDE9E7',
        },
      },
    },
  },
};

interface Content {
  base?: string;
}

const content = ({ base = './' }: Content = {}) => {
  const path = 'node_modules/udp-ui/dist/**/*.{js,jsx}';
  return `${base}${path}`;
};

export const udpUi: {
  config: Partial<Config>;
  content: ({ base }?: Content) => string;
} = {
  config: userConfig,
  content,
};
