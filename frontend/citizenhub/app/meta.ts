import type { Metadata } from 'next';
import { publicAttributes } from '@/app/_lib/resource-api/attributes/publicAttributes';

interface MetadataProps {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const mkMetadata: (mkProps?: {
  pageName?: string | ((params: { [key: string]: string }) => string);
  mkDescription?: (tenantName?: string) => string;
}) => (props: MetadataProps) => Promise<Metadata> =
  ({
    pageName,
    mkDescription = (tenantName?: string) =>
      `Citizen Hub${tenantName ? ` ${tenantName}` : ''}`,
  } = {}) =>
  async ({ params: paramsPromise }) => {
    let tenantName: string | undefined;
    const params = await paramsPromise;
    const tenant = params['tenant'];

    if (tenant) {
      const publicAttrs = await publicAttributes(tenant);
      tenantName = publicAttrs.tenantDisplayName;
    }

    const mkTitle = () => {
      const _pageName = pageName
        ? `${typeof pageName === 'string' ? pageName : pageName(params)} | `
        : '';
      return `${_pageName}UCH${tenantName ? ` ${tenantName}` : ''}`;
    };

    return {
      title: mkTitle(),
      description: mkDescription(tenantName),
    };
  };
