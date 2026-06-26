import { render } from '@testing-library/react';
import { _internal } from '@/app/settings/tenants/TenantSettingsContent';
import { TenantSettingsState } from '@/app/settings/tenants/form';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { FuncMock } from '@/app/_test/utils';
import { TenantSettings } from '@/app/_lib/resource-api/graphql/attributes';
import { mutate, query } from '@/app/_lib/resource-api/client';
import React from 'react';
import { Button, Select, TextInput } from 'flowbite-react';

const { FormContent } = _internal;

jest.mock('@/app/_lib/resource-api/legacy', () => ({
  requireTenant: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
  mutate: jest.fn(),
}));

jest.mock('udp-ui/components', () => ({
  IcSave: () => <svg />,
  UdpButton: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <Button {...props} />
  ),
  UdpColorPicker: (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <Select {...props} />
  ),
  UdpImageInput: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <TextInput {...props} />
  ),
  UdpTextInput: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <TextInput {...props} />
  ),
  UdpToast: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props} />
  ),
}));

const mockQuery = query as jest.Mock;
const mockMutate = mutate as jest.Mock;

const requireTenantMock = requireTenant as unknown as FuncMock<
  typeof requireTenant
>;

const mockTenantSettingsState = {
  data: {
    tenantDisplayName: 'Test Tenant',
    legalNoticeUrl: 'iAmAUrl:)',
    privacyUrl: '(:AnotherUrlYippie',
    contactUrl: 'iAmAUrl:)',
    tenantLogoUrl: '(:AnotherUrlYippie',
    tenantImageUrl: 'iAmAUrl:)',
    citizenHubImageUrl: '(:AnotherUrlYippie',
    tenantCoords: '13:37',
    colorPrimary: 'AAAAAA',
    uchColorPrimary: 'FFFFFF',
    newsUrl: 'iAmAUrl:)',
  },
} as TenantSettingsState;

const mockTenantSettingsStateErrors = {
  data: {
    tenantDisplayName: 'a',
    legalNoticeUrl: 'iAmAUrl:)',
    privacyUrl: '(:AnotherUrlYippie',
    contactUrl: 'iAmAUrl:)',
  },
  errors: {
    tenantDisplayName: ['Tenant-Name muss mindestens 3 Zeichen beinhalten'],
    legalNoticeUrl: ['URL nicht valide'],
    privacyUrl: ['URL nicht valide'],
    contactUrl: ['URL nicht valide'],
  },
};

beforeEach(() => {
  requireTenantMock.mockResolvedValueOnce('tenant-1');
  mockQuery.mockResolvedValue(
    mockTenantSettingsState as unknown as TenantSettings,
  );
  mockMutate.mockReset();
});

describe('FormContent', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <FormContent state={mockTenantSettingsState} />,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with errors', () => {
    const { container } = render(
      <FormContent state={mockTenantSettingsStateErrors} />,
    );
    expect(container).toMatchSnapshot();
  });

  it('disables all inputs when disabled', () => {
    const { container } = render(
      <FormContent state={mockTenantSettingsState} disabled={true} />,
    );

    const inputs = container.querySelectorAll('input');

    inputs.forEach((input) =>
      input.innerText != 'Abbrechen'
        ? expect(input).toBeDisabled()
        : expect(input).not.toBeDisabled(),
    );
  });
});
