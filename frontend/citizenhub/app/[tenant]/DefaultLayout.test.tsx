import React from 'react';
import { publicAttributes } from '@/app/_lib/resource-api/attributes/publicAttributes';
import { notFound } from 'next/navigation';
import AppDefaultLayout from '@/app/[tenant]/DefaultLayout';
import { FuncMock } from '@/app/_test/utils';

const publicAttributesMock: FuncMock<typeof publicAttributes> =
  publicAttributes as unknown as jest.Mock;

const notFoundMock = notFound as jest.MockedFunction<() => never>;

jest.mock('@/app/_lib/resource-api/attributes/publicAttributes');
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));
jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(() => 'https://example.com'),
}));
jest.mock('@/app/[tenant]/AppNavbar', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid='navbar' />),
}));

const tenant = 'demo';
const children = <div data-testid='child'>Hello</div>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AppDefaultLayout', () => {
  it.each([
    [
      'legalNoticeUrl',
      '',
      'https://example.com/privacy',
      'https://example.com/contact',
    ],
    [
      'privacyUrl',
      'https://example.com/legal',
      '',
      'https://example.com/contact',
    ],
    [
      'contactUrl',
      'https://example.com/legal',
      'https://example.com/privacy',
      '',
    ],
  ])(
    'calls notFound if %s is missing',
    async (_, legalNoticeUrl, privacyUrl, contactUrl) => {
      publicAttributesMock.mockResolvedValue({
        legalNoticeUrl,
        privacyUrl,
        contactUrl,
        tenantLogo: '/logo.png',
      });

      await AppDefaultLayout({ tenant, children });

      expect(notFoundMock).toHaveBeenCalled();
    },
  );

  it('does not call notFound if all required URLs are present', async () => {
    publicAttributesMock.mockResolvedValue({
      legalNoticeUrl: 'https://example.com/legal',
      privacyUrl: 'https://example.com/privacy',
      contactUrl: 'https://example.com/contact',
      tenantLogo: '/logo.png',
    });

    const result = await AppDefaultLayout({ tenant, children });

    expect(notFoundMock).not.toHaveBeenCalled();
    expect(result.props.children).toBeDefined();
  });
});
