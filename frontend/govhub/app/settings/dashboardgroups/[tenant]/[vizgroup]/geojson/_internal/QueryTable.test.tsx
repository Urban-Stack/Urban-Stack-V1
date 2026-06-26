import { act, render, screen, waitFor, within } from '@testing-library/react';
import QueryTable, { InternalDeleteBadge } from './QueryTable';
import { QueryTableTestIds } from './testids';
import { PublishedQuery } from '@/app/_lib/resource-api/viz-groups/publishedQueries';
import { SettingsTestIds } from '@/app/settings/_common/testIds';
import { FuncMock } from '@/app/_test/utils';
import { deletePublishedQuery } from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/geojson/_internal/action';
import { UdpToast } from 'udp-ui/components';
import { createRender } from 'udp-ui/test-utils';
import userEvent from '@testing-library/user-event';

const USER = userEvent.setup();

const TENANT = 'tenant1';
const VIZ_GROUP = 'vizGroup1';
const PUBQUERY_URI = 'https://example.com';
const queries: PublishedQuery[] = [
  { name: 'query1', sql: 'SELECT * FROM table1', _tag: 'PublishedQuery' },
  { name: 'query2', sql: 'SELECT * FROM table2', _tag: 'PublishedQuery' },
] as const;
const TEST_INDEX = 1;
const QUERY = queries[TEST_INDEX];

const UdpToastMock = UdpToast as unknown as jest.Mock;
jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpToast: jest.fn(),
}));
const successToastMock = jest.fn();
const errorToastMock = jest.fn();

jest.mock(
  '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/geojson/_internal/action',
  () => ({
    deletePublishedQuery: jest.fn(),
  }),
);
const deletePublishedQueryMock = deletePublishedQuery as unknown as FuncMock<
  typeof deletePublishedQuery
>;

beforeEach(() => {
  jest.clearAllMocks();
  UdpToastMock.mockImplementation((_, type) =>
    type === 'error' ? errorToastMock : successToastMock,
  );
});

describe('content', () => {
  it('renders table with correct headers', () => {
    const component = render(
      <QueryTable
        tenant='t'
        vizGroup='g'
        queries={queries}
        pubqueryUri={PUBQUERY_URI}
      />,
    );
    const table = component.getByTestId(QueryTableTestIds.self);

    expect(table).toBeInTheDocument();
    expect(within(table).getByText('Name')).toBeInTheDocument();
    expect(within(table).getByText('Query')).toBeInTheDocument();
  });

  it('renders a row for each query', () => {
    const component = render(
      <QueryTable
        tenant={TENANT}
        vizGroup={VIZ_GROUP}
        queries={queries}
        pubqueryUri={PUBQUERY_URI}
      />,
    );
    const rows = component.getAllByTestId(QueryTableTestIds.row);

    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText(queries[0].name)).toBeInTheDocument();
    expect(
      within(rows[0]).getByText('SELECT * FROM table1'),
    ).toBeInTheDocument();
    expect(within(rows[1]).getByText(queries[1].name)).toBeInTheDocument();
    expect(
      within(rows[1]).getByText('SELECT * FROM table2'),
    ).toBeInTheDocument();
  });

  it('renders no rows if queries is empty', () => {
    const component = render(
      <QueryTable
        tenant={TENANT}
        vizGroup={VIZ_GROUP}
        queries={[]}
        pubqueryUri={PUBQUERY_URI}
      />,
    );
    expect(component.queryAllByTestId(QueryTableTestIds.row)).toHaveLength(0);
  });

  it('renders a DeleteBadge for each query', () => {
    const component = render(
      <QueryTable
        tenant={TENANT}
        vizGroup={VIZ_GROUP}
        queries={queries}
        pubqueryUri={PUBQUERY_URI}
      />,
    );
    const badges = component.getAllByTestId(SettingsTestIds.deleteBadge);
    expect(badges).toHaveLength(2);
  });

  it('renders an edit badge (UdpBadge) with correct link and icon for each query', () => {
    const component = render(
      <QueryTable
        tenant={TENANT}
        vizGroup={VIZ_GROUP}
        queries={queries}
        pubqueryUri={PUBQUERY_URI}
      />,
    );
    const badges = component.getAllByTestId(QueryTableTestIds.editBadge);

    expect(badges).toHaveLength(2);
  });
});

describe('delete badge', () => {
  const renderDeleteBadge = createRender(InternalDeleteBadge, {
    tenant: TENANT,
    vizGroup: VIZ_GROUP,
    name: QUERY.name,
  });

  const openDeleteModal = async () => {
    await USER.click(screen.getByTestId(SettingsTestIds.deleteBadge));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible());
  };

  describe('structure', () => {
    it('delete badge has correct tooltip', () => {
      renderDeleteBadge();

      expect(screen.getByRole('tooltip')).toHaveTextContent('Query löschen');
    });

    it('delete confirm modal contains correct texts', async () => {
      renderDeleteBadge();
      await openDeleteModal();

      const modal = within(screen.getByRole('dialog'));
      expect(modal.getByRole('heading')).toHaveTextContent('Query löschen');
      expect(modal.getByRole('paragraph')).toHaveTextContent(
        `Query "${QUERY.name}" löschen?`,
      );
      expect(modal.getByRole('button', { name: 'Entfernen' })).toBeVisible();
      expect(modal.getByRole('button', { name: 'Abbrechen' })).toBeVisible();
    });
  });

  describe('delete', () => {
    const confirmDeletion = async () => {
      const submitButton = screen
        .getByRole('dialog')
        .querySelector('button[type="submit"]') as HTMLElement;
      await USER.click(submitButton);
    };

    it('delete badge allows deleting project permission for specific user group', async () => {
      const successState = {};
      deletePublishedQueryMock.mockResolvedValueOnce(successState);
      renderDeleteBadge({
        tenant: TENANT,
        vizGroup: VIZ_GROUP,
        name: QUERY.name,
      });

      await openDeleteModal();
      await confirmDeletion();

      expect(deletePublishedQueryMock).toHaveBeenCalledWith(
        TENANT,
        VIZ_GROUP,
        QUERY.name,
      );
      expect(UdpToastMock).toHaveBeenCalledWith(
        'Query erfolgreich entfernt',
        'success',
      );
      expect(successToastMock).toHaveBeenCalledTimes(1);
      expect(errorToastMock).not.toHaveBeenCalled();
    });

    it('modal shows error messages if deletion fails', async () => {
      const testErrors = ['error #1', 'error #2'];
      deletePublishedQueryMock.mockResolvedValueOnce({
        errors: { general: testErrors },
      });
      renderDeleteBadge();

      await openDeleteModal();
      await act(() => confirmDeletion());

      const modal = screen.getByRole('dialog');
      expect(modal).toBeVisible();
      testErrors.forEach((error) => expect(modal).toHaveTextContent(error));
      expect(successToastMock).not.toHaveBeenCalled();
      expect(errorToastMock).not.toHaveBeenCalled();
    });

    it('shows error toast if deletion rejected', async () => {
      deletePublishedQueryMock.mockRejectedValueOnce(new Error('rejected'));
      renderDeleteBadge();

      await openDeleteModal();
      await act(() => confirmDeletion());

      expect(screen.getByRole('dialog')).toBeVisible();
      expect(UdpToastMock).toHaveBeenCalledWith(
        'Query konnte nicht entfernt werden',
        'error',
      );
      expect(successToastMock).not.toHaveBeenCalled();
      expect(errorToastMock).toHaveBeenCalledTimes(1);
    });
  });
});
