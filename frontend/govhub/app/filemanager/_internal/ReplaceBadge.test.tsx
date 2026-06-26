import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReplaceBadge from './ReplaceBadge';
import { ObjectUploadTestIds } from '@/app/filemanager/_internal/testIds';
import { UdpToast } from 'udp-ui/components';
import { refreshDataset } from '@/app/filemanager/_internal/dataset/actions';
import { FuncMock } from '@/app/_test/utils';
import { uploadWithProgress } from '@/app/_lib/storage/client';

jest.mock('@/app/api/storage/upload/common', () => ({
  fetchUploadUrl: jest.fn(() =>
    Promise.resolve({
      url: 'mock-url',
      fields: {},
    }),
  ),
}));
jest.mock('@/app/_lib/storage/client', () => ({
  uploadWithProgress: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ refresh: jest.fn() })),
}));
jest.mock('@/app/filemanager/_internal/dataset/actions', () => ({
  refreshDataset: jest.fn(),
}));

jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpToast: jest.fn(),
}));

const UdpToastMock = UdpToast as unknown as jest.Mock;
const successToastMock = jest.fn();
const errorToastMock = jest.fn();

const refreshDatasetMock = refreshDataset as FuncMock<typeof refreshDataset>;
const uploadWithProgressMock = uploadWithProgress as FuncMock<
  typeof uploadWithProgress
>;

describe('ReplaceBadge', () => {
  const user = userEvent.setup();

  const defaultProps = {
    objectKey: 'file.csv',
    bucket: 'bucket',
    tenant: 'tenant',
    project: 'project',
    dataset: 'dataset',
  };

  beforeEach(() => {
    UdpToastMock.mockReset().mockImplementation((_, type) =>
      type === 'error' ? errorToastMock : successToastMock,
    );
    successToastMock.mockReset();
    errorToastMock.mockReset();
    refreshDatasetMock.mockReset();
    uploadWithProgressMock.mockReset();
  });

  it('renders badge and modal title', async () => {
    render(<ReplaceBadge {...defaultProps} />);

    await user.click(screen.getByRole('button'));

    expect(
      screen.getByRole('button', { name: /datei ersetzen/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Datei "file.csv" ersetzen?')).toBeInTheDocument();
  });

  it('shows tooltip on hover', async () => {
    render(<ReplaceBadge {...defaultProps} />);

    const badge = screen.getByRole('button');
    await user.hover(badge);

    expect(screen.getByText('Datei ersetzen')).toBeInTheDocument();
  });

  it('calls uploadWithProgress and refreshDataset on valid upload', async () => {
    uploadWithProgressMock.mockImplementation(() => Promise.resolve());
    refreshDatasetMock.mockImplementation(() => Promise.resolve({}));

    render(<ReplaceBadge {...defaultProps} />);
    await user.click(screen.getByRole('button'));

    const file = new File(['content'], 'file.csv', { type: 'text/plain' });
    const input = screen.getByTestId(ObjectUploadTestIds.fileInput);

    await user.upload(input, file);

    const replaceButton = screen.getByRole('button', {
      name: /datei ersetzen/i,
    });
    await user.click(replaceButton);

    expect(uploadWithProgressMock).toHaveBeenCalledWith(
      file,
      expect.any(Object),
      expect.any(Function),
    );
    expect(refreshDatasetMock).toHaveBeenCalledWith(
      'tenant',
      'project',
      'dataset',
      'bucket',
    );
  });

  it('disables replace button for invalid file', async () => {
    const user = userEvent.setup();
    render(<ReplaceBadge {...defaultProps} />);
    await user.click(screen.getByRole('button'));

    const file = new File(['content'], 'invalid.csv', { type: 'text/plain' });
    const input = screen.getByTestId(ObjectUploadTestIds.fileInput);
    await user.upload(input, file);

    const replaceButton = screen.getByRole('button', {
      name: /datei ersetzen/i,
    });
    expect(replaceButton).toBeDisabled();
  });

  it('calls success toast on file replace success', async () => {
    uploadWithProgressMock.mockImplementation(() => Promise.resolve());
    refreshDatasetMock.mockImplementation(() => Promise.resolve({}));

    render(<ReplaceBadge {...defaultProps} />);
    await user.click(screen.getByRole('button'));

    const file = new File(['content'], 'file.csv', { type: 'text/plain' });
    const input = screen.getByTestId(ObjectUploadTestIds.fileInput);

    await user.upload(input, file);

    const replaceButton = screen.getByRole('button', {
      name: /datei ersetzen/i,
    });
    await user.click(replaceButton);

    expect(successToastMock).toHaveBeenCalled();
    expect(errorToastMock).not.toHaveBeenCalled();
  });

  it('calls error toast if upload fails', async () => {
    uploadWithProgressMock.mockImplementation(() => Promise.reject());

    render(<ReplaceBadge {...defaultProps} />);
    await user.click(screen.getByRole('button'));

    const file = new File(['content'], 'file.csv', { type: 'text/plain' });
    const input = screen.getByTestId(ObjectUploadTestIds.fileInput);

    await user.upload(input, file);

    const replaceButton = screen.getByRole('button', {
      name: /datei ersetzen/i,
    });
    await user.click(replaceButton);

    expect(successToastMock).not.toHaveBeenCalled();
    expect(errorToastMock).toHaveBeenCalled();
  });

  it('calls error toast if dataset refresh fails', async () => {
    uploadWithProgressMock.mockImplementation(() => Promise.resolve());
    refreshDatasetMock.mockImplementation(() => Promise.reject());

    render(<ReplaceBadge {...defaultProps} />);
    await user.click(screen.getByRole('button'));

    const file = new File(['content'], 'file.csv', { type: 'text/plain' });
    const input = screen.getByTestId(ObjectUploadTestIds.fileInput);

    await user.upload(input, file);

    const replaceButton = screen.getByRole('button', {
      name: /datei ersetzen/i,
    });
    await user.click(replaceButton);

    expect(successToastMock).not.toHaveBeenCalled();
    expect(errorToastMock).toHaveBeenCalled();
  });
});
