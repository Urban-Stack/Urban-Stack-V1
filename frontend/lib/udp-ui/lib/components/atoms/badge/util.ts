import { UdpBadgeColor } from '@/lib/components/atoms/badge/UdpBadge';

export const COLOR_CLASS: Record<UdpBadgeColor, string> = {
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  danger: 'bg-danger-100 text-danger-700',
} as const;

export const COLOR_CLASS_CLICKABLE: Record<UdpBadgeColor, string> = {
  primary: 'hover:bg-primary-200 focus:ring-primary-200',
  success: 'hover:bg-success-200 focus:ring-success-300 text-success-800',
  warning: 'hover:bg-warning-200 focus:ring-warning-300 text-warning-800',
  danger: 'hover:bg-danger-200 focus:ring-danger-300',
} as const;

export const COLOR_CLASS_DISABLED: Record<UdpBadgeColor, string> = {
  primary: 'bg-primary-100 text-primary-200',
  success: 'bg-success-50 text-success-200',
  warning: 'bg-warning-50 text-warning-200',
  danger: 'bg-danger-50 text-danger-200',
} as const;
