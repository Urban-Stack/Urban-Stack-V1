'use client';

import { useEffect } from 'react';
import { type AppTheme } from '@/lib/theme/theme.ts';

interface UdpThemeApplierProps {
  theme: AppTheme;
}

const UdpThemeApplier = ({ theme }: UdpThemeApplierProps) => {
  useEffect(() => {
    const root = document.documentElement;
    Object.keys(theme).forEach((key) => {
      if (key.startsWith('color-')) {
        root.style.setProperty(`--${key}`, theme[key as keyof AppTheme]);
      }
    });
  }, [theme]);

  return null;
};

export default UdpThemeApplier;
