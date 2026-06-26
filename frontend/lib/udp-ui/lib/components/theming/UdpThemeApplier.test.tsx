import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import UdpThemeApplier from './UdpThemeApplier';
import { type AppTheme, DEFAULT_THEME } from '@/lib/theme/theme.ts';

describe('UdpThemeApplier', () => {
  const testCases: { description: string; theme: AppTheme }[] = [
    {
      description: 'should apply default theme',
      theme: DEFAULT_THEME,
    },
    {
      description: 'should apply fetched theme',
      theme: {
        'color-primary-950': '231, 58%, 29%',
        'color-primary-900': '215.5 100% 34.5%',
        'color-primary-800': '215.5 76.1% 41%',
        'color-primary-700': '215.3 58% 47.6%',
        'color-primary-600': '215.6 52.8% 54.3%',
        'color-primary-500': '215.7 53% 60.8%',
        'color-primary-400': '215.5 53% 67.5%',
        'color-primary-300': '215.1 52.2% 73.7%',
        'color-primary-200': '215.8 52% 80.4%',
        'color-primary-100': '216 52.2% 86.9%',
        'color-primary-50': '233 27% 94%',
      },
    },
  ];

  it.each(testCases)('$description', async ({ theme }) => {
    render(<UdpThemeApplier theme={theme} />);

    await waitFor(() => {
      Object.keys(theme).forEach((key) => {
        if (key.startsWith('color-')) {
          expect(
            getComputedStyle(document.documentElement).getPropertyValue(
              `--${key}`,
            ),
          ).toBe(theme[key as keyof AppTheme]);
        }
      });
    });
  });

  it('should override default theme if new theme is passed', async () => {
    const newTheme = {
      'color-primary-900': '0 0% 0%',
      'color-primary-800': '0 0% 0%',
      'color-primary-700': '0 0% 0%',
      'color-primary-600': '0 0% 0%',
      'color-primary-500': '0 0% 0%',
      'color-primary-400': '0 0% 0%',
      'color-primary-300': '0 0% 0%',
      'color-primary-200': '0 0% 0%',
      'color-primary-100': '0 0% 0%',
      'color-primary-50': '0 0% 0%',
    } as AppTheme;

    render(<UdpThemeApplier theme={newTheme} />);

    await waitFor(() => {
      Object.keys(newTheme).forEach((key) => {
        expect(
          getComputedStyle(document.documentElement).getPropertyValue(
            `--${key}`,
          ),
        ).toBe(newTheme[key as keyof AppTheme]);
      });
    });
  });
});
