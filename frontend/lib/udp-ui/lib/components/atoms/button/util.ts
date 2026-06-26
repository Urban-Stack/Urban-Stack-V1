import { UdpButtonColor } from '@/lib/components/atoms/button/UdpButton.tsx';
import { twMerge } from 'tailwind-merge';

export const COLOR_CLASS: Record<UdpButtonColor, string> = {
  primary: twMerge(
    'bg-primary-700 text-white',
    'hover:bg-primary-600 active:bg-primary-600',
    'focus:ring-primary-200',
    'disabled:bg-primary-200',
    'data-[loading=true]:bg-primary-600',
  ),
  secondary: twMerge(
    'bg-primary-100 text-primary-700',
    'hover:bg-primary-200 active:bg-primary-200',
    'focus:ring-primary-200',
    'disabled:bg-primary-100 disabled:text-primary-200',
    'data-[loading=true]:bg-primary-200',
  ),
  tertiary: twMerge(
    'bg-transparent text-primary-700',
    'hover:bg-primary-100 active:bg-primary-100',
    'focus:ring-primary-200 focus:text-primary-600',
    'disabled:bg-transparent disabled:text-primary-200',
    'data-[loading=true]:bg-primary-100',
  ),
  success: twMerge(
    'bg-success-100 text-success-700',
    'hover:bg-success-200 hover:text-success-800 active:bg-success-200 active:text-success-800',
    'focus:ring-success-300 focus:text-success-800',
    'disabled:bg-success-50 disabled:text-success-200',
    'data-[loading=true]:bg-success-200',
  ),
  warning: twMerge(
    'bg-warning-100 text-warning-700',
    'hover:bg-warning-200 hover:text-warning-800 active:bg-warning-200 active:text-warning-800',
    'focus:ring-warning-300 focus:text-warning-800',
    'disabled:bg-warning-50 disabled:text-warning-200',
    'data-[loading=true]:bg-warning-200',
  ),
  danger: twMerge(
    'bg-danger-100 text-danger-700',
    'hover:bg-danger-200 active:bg-danger-200',
    'focus:ring-danger-300 focus:text-danger-800',
    'disabled:bg-danger-50 disabled:text-danger-200',
    'data-[loading=true]:bg-danger-200',
  ),
} as const;
