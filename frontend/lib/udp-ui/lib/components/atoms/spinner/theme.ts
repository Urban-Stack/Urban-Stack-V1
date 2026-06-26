import { DeepPartial } from 'flowbite-react/types';
import { SpinnerTheme } from 'flowbite-react';

export const SPINNER_THEME = {
  primary: {
    base: 'text-primary-200',
    color: {
      default: 'fill-primary-500',
    },
  },
  secondary: {
    base: 'text-primary-300',
    color: {
      default: 'fill-primary-700',
    },
  },
  tertiary: {
    base: 'text-primary-200',
    color: {
      default: 'fill-primary-700',
    },
  },
  success: {
    base: 'text-white',
    color: {
      default: 'fill-success-800',
    },
  },
  warning: {
    base: 'text-white',
    color: {
      default: 'fill-warning-800',
    },
  },
  danger: {
    base: 'text-white',
    color: {
      default: 'fill-danger-800',
    },
  },
} satisfies Readonly<Record<string, DeepPartial<SpinnerTheme>>>;
