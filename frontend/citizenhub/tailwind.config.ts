import type { Config } from 'tailwindcss';
import { udpUi } from 'udp-ui/tailwind';
import flowbiteReact from 'flowbite-react/plugin/tailwindcss';

const config: Config = {
  ...udpUi.config,
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    udpUi.content(),
    '.flowbite-react/class-list.json',
  ],

  plugins: [flowbiteReact],
};
export default config;
