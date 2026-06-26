import { CreateDashboard } from '@/app/_lib/superset/types';
import { ZodError } from 'zod';

describe('CreateDashboard', () => {
  const vizGroup = { name: 'sccon', tenant: 'guetersloh' } as const;

  it('throws ZodError on dashboard title too short', () => {
    const title = 'xs';

    expect(() => CreateDashboard.parse({ title, vizGroup })).toThrow(ZodError);
  });

  it('throws ZodError on dashboard title too long', () => {
    const title =
      'tooLong_crduujisacfctqitlrbymonauexhkgeysabqwgzjlcsynwcnppxvmsfik';

    expect(() => CreateDashboard.parse({ title, vizGroup })).toThrow(ZodError);
  });

  it('throws ZodError if vizGroup is missing', () => {
    const title = 'min';

    expect(() => CreateDashboard.parse({ title })).toThrow(ZodError);
  });

  it('throws ZodError if parts of vizGroup are missing', () => {
    const title = 'min';

    expect(() =>
      CreateDashboard.parse({
        title,
        vizGroup: { name: 'sccon' },
      }),
    ).toThrow(ZodError);
  });

  it.each([
    'min',
    'max_enhicrduujisacfctqitlrbymonauexhkgeysabqwgzjlcsynwcnppxvmsfi',
  ])(`successfully parses dashboard title for valid length`, (title) => {
    const parsed = CreateDashboard.parse({ title, vizGroup });

    expect(parsed).toEqual({ title, vizGroup });
  });
});
