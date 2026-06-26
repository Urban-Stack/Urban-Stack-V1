import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ObjectUpload from './ObjectUpload';
import { FuncMock } from '@/app/_test/utils';
import { UdpProgressBarTestId, UdpToast } from 'udp-ui/components';
import { fetchUploadUrl } from '@/app/api/storage/upload/common';
import { uploadWithProgress } from '@/app/_lib/storage/client';
import { ObjectUploadTestIds } from '@/app/filemanager/_internal/testIds';
import { useRouter } from 'next/navigation';
import { fetchExistsFile } from '@/app/api/storage/exists/common';

jest.mock('@/app/_lib/storage/client', () => ({
  uploadWithProgress: jest.fn(),
}));

jest.mock('@/app/api/storage/upload/common', () => ({
  fetchUploadUrl: jest.fn(),
}));

jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpToast: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/app/api/storage/exists/common', () => ({
  fetchExistsFile: jest.fn(),
}));

const UdpToastMock = UdpToast as unknown as jest.Mock;
const fetchUploadUrlMock = fetchUploadUrl as unknown as FuncMock<
  typeof fetchUploadUrl
>;
const uploadWithProgressMock = uploadWithProgress as unknown as FuncMock<
  typeof uploadWithProgress
>;
const routerMock = useRouter as unknown as jest.Mock;
const fetchExistsFileMock = fetchExistsFile as unknown as FuncMock<
  typeof fetchExistsFile
>;

describe('ObjectUpload', () => {
  const user = userEvent.setup();

  const mockSuccessUpload = jest.fn();
  const mockErrorUpload = jest.fn();
  const refreshMock = jest.fn();

  const TEST_FILE = new File(['content'], 'test-file.txt', {
    type: 'text/plain',
  });

  beforeEach(() => {
    jest.clearAllMocks();
    UdpToastMock.mockImplementation((_, type) => {
      if (type === 'success') return mockSuccessUpload;
      if (type === 'error') return mockErrorUpload;
    });
    fetchUploadUrlMock.mockResolvedValue({ url: 'test-url', fields: {} });
    routerMock.mockReturnValue({ refresh: refreshMock });
    fetchExistsFileMock.mockResolvedValue(false);
  });

  it('shows correct text if no file is selected', () => {
    render(<ObjectUpload bucket='test-bucket' />);

    expect(
      screen.getByText('Drag and Drop oder hier klicken, um Datei auszuwählen'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Dateiname nur gültig mit Buchstaben/),
    ).toBeInTheDocument();
  });

  it('shows selected filename and no progressbar if file is selected', async () => {
    render(<ObjectUpload bucket='test-bucket' />);

    const fileInput = screen.getByTestId<HTMLInputElement>(
      ObjectUploadTestIds.fileInput,
    );
    await user.upload(fileInput, TEST_FILE);

    expect(screen.getByText('test-file.txt')).toBeInTheDocument();
    expect(screen.queryByTestId(UdpProgressBarTestId)).not.toBeInTheDocument();
  });

  it('shows progressbar if user submits file', async () => {
    uploadWithProgressMock.mockImplementation(() => new Promise(() => {}));

    render(<ObjectUpload bucket='test-bucket' />);

    const fileInput = screen.getByTestId<HTMLInputElement>(
      ObjectUploadTestIds.fileInput,
    );
    await user.upload(fileInput, TEST_FILE);
    await user.click(screen.getByText('Hochladen'));

    expect(screen.getByTestId(UdpProgressBarTestId)).toBeInTheDocument();
  });

  it('shows success toast if upload succeeds', async () => {
    uploadWithProgressMock.mockResolvedValue(undefined);

    render(<ObjectUpload bucket='test-bucket' />);

    const fileInput = screen.getByTestId<HTMLInputElement>(
      ObjectUploadTestIds.fileInput,
    );
    await user.upload(fileInput, TEST_FILE);
    await user.click(screen.getByText('Hochladen'));

    expect(mockSuccessUpload).toHaveBeenCalled();
    expect(mockErrorUpload).not.toHaveBeenCalled();
    expect(screen.queryByTestId(UdpProgressBarTestId)).not.toBeInTheDocument();
  });

  it('shows error toast if file already exists', async () => {
    fetchExistsFileMock.mockResolvedValue(true);

    render(<ObjectUpload bucket='test-bucket' />);

    const fileInput = screen.getByTestId<HTMLInputElement>(
      ObjectUploadTestIds.fileInput,
    );
    await user.upload(fileInput, TEST_FILE);
    await user.click(screen.getByText('Hochladen'));

    expect(mockErrorUpload).toHaveBeenCalled();
    expect(uploadWithProgressMock).not.toHaveBeenCalled();
  });

  it('shows error toast if upload fails', async () => {
    uploadWithProgressMock.mockRejectedValue(new Error('Upload failed'));

    render(<ObjectUpload bucket='test-bucket' />);

    const fileInput = screen.getByTestId<HTMLInputElement>(
      ObjectUploadTestIds.fileInput,
    );
    await user.upload(fileInput, TEST_FILE);
    await user.click(screen.getByText('Hochladen'));

    expect(mockErrorUpload).toHaveBeenCalled();
    expect(mockSuccessUpload).not.toHaveBeenCalled();
    expect(screen.queryByTestId(UdpProgressBarTestId)).not.toBeInTheDocument();
  });

  it('refreshes the page after successful upload', async () => {
    uploadWithProgressMock.mockResolvedValue(undefined);

    render(<ObjectUpload bucket='test-bucket' />);

    const fileInput = screen.getByTestId<HTMLInputElement>(
      ObjectUploadTestIds.fileInput,
    );
    await user.upload(fileInput, TEST_FILE);
    await user.click(screen.getByText('Hochladen'));

    expect(refreshMock).toHaveBeenCalled();
  });

  it('refreshes the page after failed upload', async () => {
    uploadWithProgressMock.mockRejectedValue(new Error('Upload failed'));

    render(<ObjectUpload bucket='test-bucket' />);

    const fileInput = screen.getByTestId<HTMLInputElement>(
      ObjectUploadTestIds.fileInput,
    );
    await user.upload(fileInput, TEST_FILE);
    await user.click(screen.getByText('Hochladen'));

    expect(refreshMock).toHaveBeenCalled();
  });
});
