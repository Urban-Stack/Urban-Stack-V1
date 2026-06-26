import type { Metadata } from 'next';
import { requireTenantMeta } from '@/app/_lib/resource-api/legacy';

interface MetadataProps {
  params?: Promise<{ [key: string]: string }>;
}

export const mkMetadata: (mkProps?: {
  pageName?: string | ((params: { [key: string]: string }) => string);
  mkDescription?: (tenantName?: string) => string;
}) => (props: MetadataProps) => Promise<Metadata> =
  ({
    pageName,
    mkDescription = (tenantName?: string) =>
      `Urban Government Hub${tenantName ? ` ${tenantName}` : ''}`,
  } = {}) =>
  async ({ params: paramsPromise }) => {
    const tenantMeta = await requireTenantMeta();
    const tenantName = tenantMeta['tenant-name'];
    const params = (await paramsPromise) ?? {};

    const mkTitle = () => {
      const _pageName = pageName
        ? `${typeof pageName === 'string' ? pageName : pageName(params)} | `
        : '';
      return `${_pageName}UGH${tenantName ? ` ${tenantName}` : ''}`;
    };

    return {
      title: mkTitle(),
      description: mkDescription(tenantName),
    };
  };
