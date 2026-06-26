import type { Config } from 'tailwindcss';
import { udpUi } from '@/lib/tailwind';
import flowbiteReact from 'flowbite-react/plugin/tailwindcss';

const config: Config = {
  ...udpUi.config,
  content: [
    './lib/**/*.{js,ts,jsx,tsx}',
    '.storybook/util/**/*.{ts,tsx}',
    '.flowbite-react/class-list.json',
  ],

  plugins: [flowbiteReact],
};

export default config;
