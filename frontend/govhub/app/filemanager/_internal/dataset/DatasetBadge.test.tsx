import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DatasetBadge, { internal } from './DatasetBadge';
import { StorageObject } from '@/app/_lib/storage/common';
import { Dataset } from '@/app/_lib/resource-api/project/dataset';
import { UdpClientModal, UdpToast } from 'udp-ui/components';
import { ObjectTableTestIds } from '../testIds';
import {
  createDataset,
  deleteDataset,
} from '@/app/filemanager/_internal/dataset/actions';
import { FuncMock } from '@/app/_test/utils';
import React, { RefObject } from 'react';
import { DatasetBadgeTestIds as TestIds } from '@/app/filemanager/_internal/dataset/testIds';

const UdpClientModalMock = UdpClientModal as unknown as jest.Mock;
jest.mock('udp-ui/components', () => {
  const actual = jest.requireActual('udp-ui/components');
  return {
    ...actual,
    UdpToast: jest.fn(),
    UdpBadge: jest.fn(({ children, disabled }) => (
      <button data-testid={ObjectTableTestIds.datasetBadge} disabled={disabled}>
        {children}
      </button>
    )),
    UdpClientModal: jest.fn((props) => actual.UdpClientModal(props)),
  };
});

jest.mock('./actions', () => ({
  createDataset: jest.fn(),
  deleteDataset: jest.fn(),
}));

const successToast = jest.fn();
const errorToast = jest.fn();

const createDatasetMock = createDataset as FuncMock<typeof createDataset>;
const deleteDatasetMock = deleteDataset as FuncMock<typeof deleteDataset>;

const refreshMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
    refresh: refreshMock.mockReset(),
  });
});

const { FormContentCreate, FormContentDelete } = internal;

const createTestStorageObject = (
  key: string,
  filetype: string,
): StorageObject => ({
  key,
  lastModified: new Date('2023-01-01'),
  sizeInBytes: 1024,
  downloadHref: `/download/${key}`,
  filetype,
  _tag: 'StorageObject',
});

const createTestDataset = (objectKey: string): Dataset => ({
  name: '',
  format: 'csv',
  path: objectKey,
  _tag: 'Dataset',
});

beforeAll(() => {
  (UdpToast as jest.Mock).mockImplementation((_, type) =>
    type === 'error' ? errorToast : successToast,
  );
});

beforeEach(() => {
  successToast.mockReset();
  errorToast.mockReset();
  createDatasetMock.mockReset();
  deleteDatasetMock.mockReset();
});

describe('DatasetBadge', () => {
  const user = userEvent.setup();

  const defaultProps = {
    tenant: 'test-tenant',
    project: 'test-project',
    bucket: 'test-bucket',
  };

  test.each(['txt', 'pdf', 'doc'])(
    'renders disabled badge for %s file which cannot be used for dataset',
    (filetype) => {
      const object = createTestStorageObject('test.' + filetype, filetype);

      render(<DatasetBadge {...defaultProps} object={object} canManageFiles />);

      const badge = screen.getByTestId(ObjectTableTestIds.datasetBadge);
      expect(badge).toBeVisible();
      expect(badge).toHaveTextContent('Nicht Verknüpft');
      expect(badge).toHaveAttribute('disabled');
    },
  );

  test.each(['csv', 'json'])(
    'renders badge not disabled for %s which can be used for dataset and not linked',
    (filetype) => {
      const object = createTestStorageObject('test.' + filetype, filetype);

      render(
        <DatasetBadge
          {...defaultProps}
          object={object}
          dataset={undefined}
          canManageFiles
        />,
      );

      const badge = screen.getByTestId(ObjectTableTestIds.datasetBadge);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Nicht Verknüpft');
      expect(badge).not.toHaveAttribute('disabled');
    },
  );

  test.each(['csv', 'json'])(
    'renders badge not disabled for %s which can be used for dataset and is linked',
    (filetype) => {
      const object = createTestStorageObject('test.' + filetype, filetype);
      const dataset = createTestDataset(object.key);

      render(
        <DatasetBadge
          {...defaultProps}
          object={object}
          dataset={dataset}
          canManageFiles
        />,
      );

      const badge = screen.getByTestId(ObjectTableTestIds.datasetBadge);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Verknüpft');
      expect(badge).not.toHaveAttribute('disabled');
    },
  );

  it('opens create modal when clicking on badge with no dataset', async () => {
    const user = userEvent.setup();
    const object = createTestStorageObject('test.csv', 'csv');

    render(
      <DatasetBadge
        {...defaultProps}
        object={object}
        dataset={undefined}
        canManageFiles
      />,
    );

    const badge = screen.getByTestId(ObjectTableTestIds.datasetBadge);
    await user.click(badge);

    const createModal = screen.getByTestId(TestIds.createModal);
    await waitFor(() => expect(createModal).toBeVisible());
    expect(UdpClientModalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Datei verknüpfen',
        size: 'lg',
      }),
      undefined,
    );
    expect(
      screen.getByText('Datei "test.csv" mit Dashboards verknüpfen?'),
    ).toBeVisible();
  });

  it('opens delete modal when clicking on enabled badge and linked', async () => {
    const user = userEvent.setup();
    const object = createTestStorageObject('test.csv', 'csv');
    const dataset = createTestDataset(object.key);

    render(
      <DatasetBadge
        {...defaultProps}
        object={object}
        dataset={dataset}
        canManageFiles
      />,
    );

    const badge = screen.getByTestId(ObjectTableTestIds.datasetBadge);
    await user.click(badge);

    const deleteModal = screen.getByTestId(TestIds.deleteModal);
    await waitFor(() => expect(deleteModal).toBeVisible());
    expect(UdpClientModalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Verknüpfung aufheben',
        size: 'xl',
      }),
      undefined,
    );
    expect(
      screen.getByText('Verknüpfung zu "test.csv" wirklich aufheben?'),
    ).toBeVisible();
  });

  it('shows success toast when create succeeds', async () => {
    const object = createTestStorageObject('test.csv', 'csv');
    createDatasetMock.mockResolvedValueOnce({ data: {} });

    render(
      <DatasetBadge
        {...defaultProps}
        object={object}
        dataset={undefined}
        canManageFiles
      />,
    );

    const badge = screen.getByTestId(ObjectTableTestIds.datasetBadge);
    await user.click(badge);

    const submitBtn = screen.getByText('Verknüpfung erstellen');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(successToast).toHaveBeenCalled();
      expect(errorToast).not.toHaveBeenCalled();
    });
  });

  it('shows error toast when create fails', async () => {
    const object = createTestStorageObject('test.csv', 'csv');
    createDatasetMock.mockResolvedValueOnce({
      errors: { general: ['Validation failed'] },
    });

    render(
      <DatasetBadge
        {...defaultProps}
        object={object}
        dataset={undefined}
        canManageFiles
      />,
    );

    const badge = screen.getByTestId(ObjectTableTestIds.datasetBadge);
    await user.click(badge);

    const submitBtn = screen.getByText('Verknüpfung erstellen');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(errorToast).toHaveBeenCalled();
      expect(successToast).not.toHaveBeenCalled();
    });
  });

  it('shows success toast when delete succeeds', async () => {
    const object = createTestStorageObject('test.csv', 'csv');
    const dataset = createTestDataset(object.key);
    deleteDatasetMock.mockResolvedValueOnce({ data: {} });

    render(
      <DatasetBadge
        {...defaultProps}
        object={object}
        dataset={dataset}
        canManageFiles
      />,
    );

    const badge = screen.getByTestId(ObjectTableTestIds.datasetBadge);
    await user.click(badge);

    const submitBtn = screen.getByRole('button', {
      name: 'Verknüpfung aufheben',
    });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(successToast).toHaveBeenCalled();
      expect(errorToast).not.toHaveBeenCalled();
    });
  });

  it('shows error toast when delete fails', async () => {
    const object = createTestStorageObject('test.csv', 'csv');
    const dataset = createTestDataset(object.key);
    deleteDatasetMock.mockResolvedValueOnce({
      errors: { general: ['Delete failed'] },
    });

    render(
      <DatasetBadge
        {...defaultProps}
        object={object}
        dataset={dataset}
        canManageFiles
      />,
    );

    const badge = screen.getByTestId(ObjectTableTestIds.datasetBadge);
    await user.click(badge);

    const submitBtn = screen.getByRole('button', {
      name: 'Verknüpfung aufheben',
    });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(successToast).not.toHaveBeenCalled();
      expect(errorToast).toHaveBeenCalled();
    });
  });
});

describe('FormContentCreate', () => {
  const ref = React.createRef<HTMLElement>() as RefObject<HTMLElement>;
  const mockCloseModal = jest.fn();

  beforeEach(() => {
    mockCloseModal.mockReset();
  });

  it('renders form content with buttons', () => {
    render(
      <FormContentCreate
        filename='kobold.csv'
        isLoading={false}
        initialFocusRef={ref}
        closeModal={mockCloseModal}
      />,
    );

    expect(
      screen.getByText('Datei "kobold.csv" mit Dashboards verknüpfen?'),
    ).toBeInTheDocument();
    expect(screen.getByText('Verknüpfung erstellen')).toBeInTheDocument();
    expect(screen.getByText('Abbrechen')).toBeInTheDocument();
  });

  it('submit button gets reference for initial focus component', () => {
    const ref = React.createRef<HTMLElement>() as RefObject<HTMLElement>;

    render(
      <FormContentCreate
        filename='kobold.csv'
        isLoading={false}
        initialFocusRef={ref}
        closeModal={mockCloseModal}
      />,
    );

    expect(ref.current).toEqual(
      screen.getByRole('button', { name: 'Verknüpfung erstellen' }),
    );
  });

  it('calls closeModal when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <FormContentCreate
        filename='kobold.csv'
        isLoading={false}
        initialFocusRef={ref}
        closeModal={mockCloseModal}
      />,
    );

    const cancelButton = screen.getByText('Abbrechen');
    await user.click(cancelButton);

    expect(mockCloseModal).toHaveBeenCalled();
  });
});

describe('FormContentDelete', () => {
  const ref = React.createRef<HTMLElement>() as RefObject<HTMLElement>;
  const mockCloseModal = jest.fn();

  beforeEach(() => {
    mockCloseModal.mockReset();
  });

  it('renders form content with buttons', () => {
    render(
      <FormContentDelete
        filename='kobold.csv'
        isLoading={false}
        initialFocusRef={ref}
        closeModal={mockCloseModal}
      />,
    );

    expect(
      screen.getByText('Verknüpfung zu "kobold.csv" wirklich aufheben?'),
    ).toBeInTheDocument();
    expect(screen.getByText('Verknüpfung aufheben')).toBeInTheDocument();
    expect(screen.getByText('Abbrechen')).toBeInTheDocument();
  });

  it('cancel button gets reference for initial focus component', () => {
    const ref = React.createRef<HTMLElement>() as RefObject<HTMLElement>;

    render(
      <FormContentDelete
        filename='kobold.csv'
        isLoading={false}
        initialFocusRef={ref}
        closeModal={mockCloseModal}
      />,
    );

    expect(ref.current).toEqual(
      screen.getByRole('button', { name: 'Abbrechen' }),
    );
  });

  it('calls closeModal when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <FormContentDelete
        filename='kobold.csv'
        isLoading={false}
        initialFocusRef={ref}
        closeModal={mockCloseModal}
      />,
    );

    const cancelButton = screen.getByText('Abbrechen');
    await user.click(cancelButton);

    expect(mockCloseModal).toHaveBeenCalled();
  });
});
