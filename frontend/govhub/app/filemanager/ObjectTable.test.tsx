import React from 'react';
import { render, screen, within } from '@testing-library/react';
import ObjectTable from './ObjectTable';
import { ObjectTableTestIds } from '@/app/filemanager/_internal/testIds';
import { StorageObject } from '@/app/_lib/storage/common';
import { Dataset } from '@/app/_lib/resource-api/project/dataset';

jest.mock(
  '@/app/filemanager/_internal/delete/DeleteBadge',
  () =>
    ({ objectKey }: { objectKey: string }) => (
      <div>MockedDeleteBadge: {objectKey}</div>
    ),
);

jest.mock('@/app/filemanager/_internal/dataset/DatasetBadge', () => ({
  __esModule: true,
  default: () => (
    <div data-testid={ObjectTableTestIds.datasetBadge}>MockedDatasetBadge</div>
  ),
}));

jest.mock('@/app/filemanager/_internal/ReplaceBadge', () => ({
  __esModule: true,
  default: () => <div>MockedReplaceBadge</div>,
}));

const testObjects: StorageObject[] = [
  {
    key: 'file1.csv',
    sizeInBytes: 100,
    downloadHref: '/download/file1.csv',
    lastModified: new Date(),
    filetype: 'csv',
    _tag: 'StorageObject',
  },
  {
    key: 'file2.txt',
    sizeInBytes: 200,
    downloadHref: '/download/file2.txt',
    lastModified: new Date(),
    filetype: 'txt',
    _tag: 'StorageObject',
  },
] as const;

const noDatasets: ReadonlyMap<string, Dataset> = new Map();

describe('ObjectTable', () => {
  it('renders the correct table headers', () => {
    render(
      <ObjectTable
        tenant='guetersloh'
        project='hamster'
        bucket='test-bucket'
        objects={testObjects}
        datasets={noDatasets}
        canManageFiles
      />,
    );

    expect(screen.getAllByRole('columnheader')).toHaveLength(5);
    expect(screen.getByText(/Dateiname/i)).toBeInTheDocument();
    expect(screen.getByText(/Zuletzt geändert/i)).toBeInTheDocument();
    expect(screen.getByText(/Größe/i)).toBeInTheDocument();
    expect(screen.getByText(/Dataset erstellt/i)).toBeInTheDocument();
  });

  it('renders correct row count and cell content', () => {
    render(
      <ObjectTable
        tenant='guetersloh'
        project='hamster'
        bucket='test-bucket'
        objects={testObjects}
        datasets={noDatasets}
        canManageFiles
      />,
    );

    const rows = screen.getAllByTestId(ObjectTableTestIds.tableRow);
    expect(rows).toHaveLength(2);
    expect(screen.getByText('file1.csv')).toBeInTheDocument();
    expect(screen.getByText('file2.txt')).toBeInTheDocument();
  });

  it('the action container is in the document but not visible', () => {
    render(
      <ObjectTable
        tenant='guetersloh'
        project='hamster'
        bucket='test-bucket'
        objects={testObjects}
        datasets={noDatasets}
        canManageFiles
      />,
    );

    screen
      .getAllByTestId(ObjectTableTestIds.deleteBadge)
      .forEach((db) =>
        expect(db).toHaveClass('group-hover:visible', 'lg:invisible'),
      );
    screen
      .getAllByTestId(ObjectTableTestIds.downloadBadge)
      .forEach((db) =>
        expect(db).toHaveClass('group-hover:visible', 'lg:invisible'),
      );
  });

  it('the delete badge is not in the document if the user cannot manage files', () => {
    render(
      <ObjectTable
        tenant='guetersloh'
        project='hamster'
        bucket='test-bucket'
        objects={testObjects}
        datasets={noDatasets}
        canManageFiles={false}
      />,
    );

    const deleteBadges = screen.queryAllByTestId(
      ObjectTableTestIds.deleteBadge,
    );
    expect(deleteBadges.length).toBe(0);

    screen
      .getAllByTestId(ObjectTableTestIds.downloadBadge)
      .forEach((db) =>
        expect(db).toHaveClass('group-hover:visible', 'lg:invisible'),
      );
  });

  it('should contain download badge with correct hrefs', () => {
    render(
      <ObjectTable
        tenant='guetersloh'
        project='hamster'
        bucket='test-bucket'
        objects={testObjects}
        datasets={noDatasets}
        canManageFiles
      />,
    );

    const expectedDownloadHrefs = new Map(
      testObjects.map((object) => [object.key, object.downloadHref]),
    );

    const rows = screen.getAllByTestId(ObjectTableTestIds.tableRow);
    expect(rows).toHaveLength(2);
    rows.forEach((row) => {
      const fileName = within(row).getAllByRole('cell')[0].textContent;

      expect(fileName).toBeDefined();
      expect(
        within(row).getByTestId(ObjectTableTestIds.downloadBadge),
      ).toBeInTheDocument();
      expect(
        within(
          within(row).getByTestId(ObjectTableTestIds.downloadBadge),
        ).getByRole('link'),
      ).toHaveAttribute('href', expectedDownloadHrefs.get(fileName ?? ''));
    });
  });

  it('should contain dataset badge', () => {
    render(
      <ObjectTable
        tenant='guetersloh'
        project='hamster'
        bucket='test-bucket'
        objects={testObjects}
        datasets={noDatasets}
        canManageFiles
      />,
    );
    const rows = screen.getAllByTestId(ObjectTableTestIds.tableRow);
    rows.forEach((row) => {
      expect(
        within(row).getByTestId(ObjectTableTestIds.datasetBadge),
      ).toBeInTheDocument();
    });
  });

  describe('replace badge', () => {
    it('should contain replace badge if dataset exists', () => {
      render(
        <ObjectTable
          tenant='guetersloh'
          project='hamster'
          bucket='test-bucket'
          objects={testObjects}
          datasets={
            new Map<string, Dataset>([
              [
                'file1.csv',
                {
                  name: 'test-dataset',
                  format: 'csv',
                  path: 'file1.csv',
                  _tag: 'Dataset',
                },
              ],
            ])
          }
          canManageFiles
        />,
      );
      const replaceBadges = screen.getAllByTestId(
        ObjectTableTestIds.replaceBadge,
      );
      expect(replaceBadges).toHaveLength(1);
    });

    it('should not contain replace badge if no dataset exists', () => {
      render(
        <ObjectTable
          tenant='guetersloh'
          project='hamster'
          bucket='test-bucket'
          objects={testObjects}
          datasets={noDatasets}
          canManageFiles
        />,
      );
      const replaceBadges = screen.queryAllByTestId(
        ObjectTableTestIds.replaceBadge,
      );
      expect(replaceBadges).toHaveLength(0);
    });

    it('should not contain replace badge if user cannot manage files', () => {
      render(
        <ObjectTable
          tenant='guetersloh'
          project='hamster'
          bucket='test-bucket'
          objects={testObjects}
          datasets={
            new Map<string, Dataset>([
              [
                'file1.csv',
                {
                  name: 'test-dataset',
                  format: 'csv',
                  path: 'file1.csv',
                  _tag: 'Dataset',
                },
              ],
            ])
          }
          canManageFiles={false}
        />,
      );
      const replaceBadges = screen.queryAllByTestId(
        ObjectTableTestIds.replaceBadge,
      );
      expect(replaceBadges).toHaveLength(0);
    });
  });
});
