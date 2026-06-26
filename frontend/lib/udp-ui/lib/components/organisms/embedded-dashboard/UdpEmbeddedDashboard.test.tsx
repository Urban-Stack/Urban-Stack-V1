import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import AppDashboard, { SUPERSET_DASHBOARD_TITLE } from './UdpEmbeddedDashboard';

const TEST_DASHBOARD_SLUG = 'tenant_vizgroup_name';
const TEST_SUPERSET_URI = 'https://superset.data-hub.local';

describe('snapshot', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <AppDashboard
        supersetBaseUrl={TEST_SUPERSET_URI}
        slug={TEST_DASHBOARD_SLUG}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with additional classes', () => {
    const { container } = render(
      <AppDashboard
        supersetBaseUrl={TEST_SUPERSET_URI}
        slug={TEST_DASHBOARD_SLUG}
        className={'pt-8'}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});

describe('iframe', () => {
  it('renders iframe for the Superset dashboard of the given dashboard slug', () => {
    const dashboard = render(
      <AppDashboard
        supersetBaseUrl={TEST_SUPERSET_URI}
        slug={TEST_DASHBOARD_SLUG}
      />,
    );

    const iframe = dashboard.getByTitle(SUPERSET_DASHBOARD_TITLE);
    expect(iframe).toBeVisible();
    expect(iframe).toHaveAttribute(
      'src',
      `${TEST_SUPERSET_URI}/superset/dashboard/${TEST_DASHBOARD_SLUG}/?standalone=1&edit=false`,
    );
  });
});

describe('edit mode', () => {
  const editQueryParamTestCases = [
    {
      isEditMode: true,
      testCaseExpectedMode: 'edit mode',
      expectedQueryParam: 'edit=true',
    },
    {
      isEditMode: false,
      testCaseExpectedMode: 'default mode',
      expectedQueryParam: 'edit=false',
    },
    {
      isEditMode: undefined,
      testCaseExpectedMode: 'default mode',
      expectedQueryParam: 'edit=false',
    },
  ];
  it.each(editQueryParamTestCases)(
    'shows iframe in $testCaseExpectedMode if query parameter "edit" is $isEditMode',
    ({ isEditMode, expectedQueryParam }) => {
      const dashboard = render(
        <AppDashboard
          supersetBaseUrl={TEST_SUPERSET_URI}
          slug={TEST_DASHBOARD_SLUG}
          editMode={isEditMode}
        />,
      );

      const iframe = dashboard.getByTitle(SUPERSET_DASHBOARD_TITLE);
      expect(iframe).toHaveAttribute(
        'src',
        `${TEST_SUPERSET_URI}/superset/dashboard/${TEST_DASHBOARD_SLUG}/?standalone=1&${expectedQueryParam}`,
      );
    },
  );
});
