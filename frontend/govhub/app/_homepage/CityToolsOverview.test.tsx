import { render } from '@testing-library/react';
import React from 'react';
import { CityTool } from '@/app/_lib/citytools';
import CityToolsOverview from '@/app/_homepage/CityToolsOverview';

const CITYTOOLS = [
  {
    name: 'engimo',
    requestCityToolLink: '/new-topic?category=test',
    finalPath: 'path/engimo',
    isInstalled: true,
    meta: {
      displayName: 'Enigmo',
      description: 'Enigmo description',
      categories: [],
      showInCitizenHub: true,
      showInGovHub: true,
    },
    overallInstalls: {},
    _tag: 'StaticApp',
  },
  {
    name: 'cns',
    requestCityToolLink: '/new-topic?category=test',
    finalPath: 'path/cns',
    isInstalled: true,
    meta: {
      displayName: 'CNS',
      description: 'CNS description',
      categories: [],
      showInCitizenHub: true,
      showInGovHub: true,
    },
    overallInstalls: {},
    _tag: 'StaticApp',
  },
  {
    name: 'dissun',
    requestCityToolLink: '/new-topic?category=test',
    finalPath: 'path/dissun',
    isInstalled: true,
    meta: {
      displayName: 'Dissun',
      description: 'Dissun description',
      categories: [],
      showInCitizenHub: true,
      showInGovHub: true,
    },
    overallInstalls: {},
    _tag: 'StaticApp',
  },
  {
    name: 'vaiiya',
    requestCityToolLink: '/new-topic?category=test',
    finalPath: 'path/vaiiya',
    isInstalled: true,
    meta: {
      displayName: 'Vaiiya',
      description: 'Vaiiya description',
      categories: [],
      showInCitizenHub: true,
      showInGovHub: true,
    },
    overallInstalls: {},
    _tag: 'StaticApp',
  },
  {
    name: 'iseult',
    requestCityToolLink: '/new-topic?category=test',
    finalPath: 'path/iseult',
    isInstalled: true,
    meta: {
      displayName: 'Iseult',
      description: 'Iseult description',
      categories: [],
      showInCitizenHub: true,
      showInGovHub: true,
    },
    overallInstalls: {},
    _tag: 'StaticApp',
  },
] as unknown as CityTool[];

describe('DashboardOverview', () => {
  it('renders without city tools', async () => {
    const { container } = render(
      <CityToolsOverview
        staticAppBaseUrl='uri'
        tenant='guetersloh'
        installedApps={[]}
      />,
    );

    expect(container).toBeVisible();
  });

  it('renders with city tools', async () => {
    const component = render(
      <CityToolsOverview
        staticAppBaseUrl='uri'
        tenant='guetersloh'
        installedApps={[CITYTOOLS[0], CITYTOOLS[1]]}
      />,
    );

    expect(component.getByRole('link', { name: 'Enigmo' })).toBeInTheDocument();
    expect(component.getByRole('link', { name: 'CNS' })).toBeInTheDocument();
  });

  it('limits card max 3 city tools', async () => {
    const component = render(
      <CityToolsOverview
        staticAppBaseUrl='uri'
        tenant='guetersloh'
        installedApps={CITYTOOLS}
      />,
    );

    expect(component.getByRole('link', { name: 'Enigmo' })).toBeInTheDocument();
    expect(component.getByRole('link', { name: 'CNS' })).toBeInTheDocument();
    expect(component.getByRole('link', { name: 'Dissun' })).toBeInTheDocument();
    expect(
      component.queryByRole('link', { name: 'Vaiiya' }),
    ).not.toBeInTheDocument();
    expect(
      component.queryByRole('link', { name: 'Iseult' }),
    ).not.toBeInTheDocument();
  });
});
