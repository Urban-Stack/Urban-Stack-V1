import React from 'react';
import { render } from '@testing-library/react';
import ToolCards, { CityToolCardsTestIds } from './ToolCards';
import { StaticApps } from '@/app/_lib/resource-api/staticapps';
import { internal } from '@/app/_lib/resource-api/staticapps/internal';
import { FuncMock } from '@/app/_test/utils';
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation';
import {
  PublicSharedApp,
  SharedApp,
} from '@/app/_lib/resource-api/sharedapps/internal';
import { CITYTOOL_CATEGORY_ORDER } from '@/app/citytools/_internal/categories';
import {
  DedicatedApps,
  DedicatedAppInfo,
} from '@/app/_lib/resource-api/dedicatedapps';

const CITYTOOL_BASE_URL = 'https://citytools.urbanstack.de';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

jest.mock('@/app/citytools/_internal/staticapps/StaticAppCard', () => ({
  __esModule: true,
  default: ({ staticApp }: { staticApp: { name: string } }) => (
    <div data-testid='staticappcard'>{staticApp.name}</div>
  ),
}));

jest.mock('@/app/citytools/_internal/sharedapps/SharedAppCard', () => ({
  __esModule: true,
  default: ({ sharedApp }: { sharedApp: { name: string } }) => (
    <div data-testid='sharedappcard'>{sharedApp.name}</div>
  ),
}));

jest.mock('@/app/citytools/_internal/sharedapps/PublicSharedAppCard', () => ({
  __esModule: true,
  default: ({ publicSharedApp }: { publicSharedApp: { name: string } }) => (
    <div data-testid='publicsharedappcard'>{publicSharedApp.name}</div>
  ),
}));

jest.mock('@/app/citytools/_internal/dedicatedapps/DedicatedAppCard', () => ({
  __esModule: true,
  default: ({ dedicatedApp }: { dedicatedApp: { name: string } }) => (
    <div data-testid='dedicatedappcard'>{dedicatedApp.name}</div>
  ),
}));

const mockUseSearchParams = useSearchParams as unknown as FuncMock<
  typeof useSearchParams
>;

const TENANT = 'guetersloh';

beforeEach(() => {
  jest.clearAllMocks();
  mockUseSearchParams.mockReturnValue(
    new URLSearchParams() as ReadonlyURLSearchParams,
  );
});

const base = internal.mkStaticAppInfo('tool', '/new-topic?category=test', {
  displayName: 'Tool',
  description: 'desc',
  categories: [],
  showInCitizenHub: true,
  showInGovHub: true,
});

const dedicatedBase: DedicatedAppInfo = {
  name: 'dedicated-tool',
  requestCityToolLink: '/new-topic?category=test',
  meta: {
    displayName: 'Dedicated Tool',
    description: 'desc',
    categories: [],
  },
  _tag: 'DedicatedAppInfo',
};

const EMPTY: StaticApps = {
  all: new Map(),
  installed: new Map(),
  _tag: 'StaticApps',
};

const BASE: StaticApps = {
  ...EMPTY,
  all: new Map([[base.name, base]]),
};

const MANY: StaticApps = {
  ...EMPTY,
  all: new Map([
    [base.name, base],
    ['tool2', { ...base, name: 'tool2' }],
  ]),
};

const EMPTY_DEDICATED = {
  all: new Map(),
  installed: new Map(),
  tenant: TENANT,
  _tag: 'DedicatedApps',
} satisfies DedicatedApps;

const BASE_DEDICATED = {
  ...EMPTY_DEDICATED,
  all: new Map([[dedicatedBase.name, dedicatedBase]]),
} satisfies DedicatedApps;

describe('Fallback', () => {
  it('renders no-CityTools fallback if there are no CityTools', () => {
    const component = render(
      <ToolCards
        isCitytoolAdmin
        isSharedAppAdmin
        isDedicatedAppAdmin
        tenant={TENANT}
        staticApps={EMPTY}
        staticAppBaseUrl={CITYTOOL_BASE_URL}
        sharedApps={[]}
        publicSharedApps={[]}
        dedicatedApps={EMPTY_DEDICATED}
      />,
    );
    expect(
      component.getByTestId(CityToolCardsTestIds.noCityTools),
    ).toBeInTheDocument();
    expect(
      component.queryByTestId(CityToolCardsTestIds.noSearchResult),
    ).not.toBeInTheDocument();
  });

  it('renders no-SearchResult fallback if filtered list is empty', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams({
        search: 'no-results',
      }) as ReadonlyURLSearchParams,
    );

    const component = render(
      <ToolCards
        isCitytoolAdmin
        isSharedAppAdmin
        isDedicatedAppAdmin
        tenant={TENANT}
        staticApps={BASE}
        staticAppBaseUrl={CITYTOOL_BASE_URL}
        sharedApps={[]}
        publicSharedApps={[]}
        dedicatedApps={EMPTY_DEDICATED}
      />,
    );

    expect(
      component.getByTestId(CityToolCardsTestIds.noSearchResult),
    ).toBeInTheDocument();
    expect(
      component.queryByTestId(CityToolCardsTestIds.noCityTools),
    ).not.toBeInTheDocument();
  });

  it('renders cards grid when tools exist', () => {
    const component = render(
      <ToolCards
        isCitytoolAdmin
        isSharedAppAdmin
        isDedicatedAppAdmin
        tenant={TENANT}
        staticApps={MANY}
        staticAppBaseUrl={CITYTOOL_BASE_URL}
        sharedApps={[]}
        publicSharedApps={[]}
        dedicatedApps={EMPTY_DEDICATED}
      />,
    );
    const cards = component.getAllByTestId('staticappcard');
    const renderedNames = cards.map((c) => c.textContent);
    const expectedNames = Array.from(MANY.all.keys());

    expect(
      component.queryByTestId(CityToolCardsTestIds.noCityTools),
    ).not.toBeInTheDocument();
    expect(
      component.queryByTestId(CityToolCardsTestIds.noSearchResult),
    ).not.toBeInTheDocument();
    expect(cards).toHaveLength(MANY.all.size);
    expect(renderedNames).toEqual(expectedNames);
  });
});

describe('Component selection', () => {
  const sharedApp = {
    name: 'shared-app-1',
    displayName: 'Shared App 1',
    description: 'shared desc',
    categories: [],
    adminContact: 'admin@shared.app',
    url: 'https://shared.app/one',
    status: 'running',
    ready: true,
    _tag: 'SharedApp',
  } satisfies SharedApp;

  const publicSharedApp = {
    name: 'public-app-1',
    displayName: 'Public App 1',
    description: 'public desc',
    categories: CITYTOOL_CATEGORY_ORDER.slice(1, 2),
    adminContact: 'admin@public.app',
    tenant: 'tenant-a',
    tenantDisplayName: 'Tenant A',
    url: 'https://public.app/one',
    _tag: 'PublicSharedApp',
  } satisfies PublicSharedApp;

  it('renders the correct card for CityTool', () => {
    const component = render(
      <ToolCards
        isCitytoolAdmin
        isSharedAppAdmin
        isDedicatedAppAdmin
        tenant={TENANT}
        staticApps={BASE}
        staticAppBaseUrl={CITYTOOL_BASE_URL}
        sharedApps={[]}
        publicSharedApps={[]}
        dedicatedApps={EMPTY_DEDICATED}
      />,
    );

    expect(component.getByTestId('staticappcard')).toBeInTheDocument();
    expect(component.queryByTestId('sharedappcard')).not.toBeInTheDocument();
    expect(
      component.queryByTestId('publicsharedappcard'),
    ).not.toBeInTheDocument();
  });

  it('renders the correct card for SharedApps', () => {
    const component = render(
      <ToolCards
        isCitytoolAdmin
        isSharedAppAdmin
        isDedicatedAppAdmin
        tenant={TENANT}
        staticApps={EMPTY}
        staticAppBaseUrl={CITYTOOL_BASE_URL}
        sharedApps={[sharedApp]}
        publicSharedApps={[]}
        dedicatedApps={EMPTY_DEDICATED}
      />,
    );

    expect(component.queryByTestId('staticappcard')).not.toBeInTheDocument();
    expect(component.queryByTestId('sharedappcard')).toBeInTheDocument();
    expect(
      component.queryByTestId('publicsharedappcard'),
    ).not.toBeInTheDocument();
  });

  it('renders the correct card for PublicSharedApps', () => {
    const component = render(
      <ToolCards
        isCitytoolAdmin
        isSharedAppAdmin
        isDedicatedAppAdmin
        tenant={TENANT}
        staticApps={EMPTY}
        staticAppBaseUrl={CITYTOOL_BASE_URL}
        sharedApps={[]}
        publicSharedApps={[publicSharedApp]}
        dedicatedApps={EMPTY_DEDICATED}
      />,
    );

    expect(component.queryByTestId('staticappcard')).not.toBeInTheDocument();
    expect(component.queryByTestId('sharedappcard')).not.toBeInTheDocument();
    expect(component.queryByTestId('publicsharedappcard')).toBeInTheDocument();
  });

  it('renders the correct card for DedicatedApps', () => {
    const component = render(
      <ToolCards
        isCitytoolAdmin
        isSharedAppAdmin
        isDedicatedAppAdmin
        tenant={TENANT}
        staticApps={EMPTY}
        staticAppBaseUrl={CITYTOOL_BASE_URL}
        sharedApps={[]}
        publicSharedApps={[]}
        dedicatedApps={BASE_DEDICATED}
      />,
    );

    expect(component.queryByTestId('staticappcard')).not.toBeInTheDocument();
    expect(component.queryByTestId('sharedappcard')).not.toBeInTheDocument();
    expect(
      component.queryByTestId('publicsharedappcard'),
    ).not.toBeInTheDocument();
    expect(component.getByTestId('dedicatedappcard')).toBeInTheDocument();
  });

  it('renders all types of cards when all types of tools are provided', () => {
    const component = render(
      <ToolCards
        isCitytoolAdmin
        isSharedAppAdmin
        isDedicatedAppAdmin
        tenant={TENANT}
        staticApps={BASE}
        staticAppBaseUrl={CITYTOOL_BASE_URL}
        sharedApps={[sharedApp]}
        publicSharedApps={[publicSharedApp]}
        dedicatedApps={BASE_DEDICATED}
      />,
    );

    expect(component.getByTestId('staticappcard')).toBeInTheDocument();
    expect(component.getByTestId('sharedappcard')).toBeInTheDocument();
    expect(component.getByTestId('publicsharedappcard')).toBeInTheDocument();
    expect(component.getByTestId('dedicatedappcard')).toBeInTheDocument();
  });
});
