import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UploadButton from './UploadButton';
import { requestPresignedUploadUrl } from '@/app/settings/projects/[tenant]/[projectname]/sensor-metadata/_internal/actions';
import { uploadSensorMetadata } from '@/app/_lib/sensor-metadata/client';
import { UdpToast } from 'udp-ui/components';
import { useRouter } from 'next/navigation';
import { ObjectUploadTestIds } from '@/app/filemanager/_internal/testIds';

jest.mock(
  '@/app/settings/projects/[tenant]/[projectname]/sensor-metadata/_internal/actions',
  () => ({
    requestPresignedUploadUrl: jest.fn(),
  }),
);
jest.mock('@/app/_lib/sensor-metadata/client', () => ({
  uploadSensorMetadata: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpToast: jest.fn(),
}));

const requestPresignedUploadUrlMock =
  requestPresignedUploadUrl as jest.MockedFunction<
    typeof requestPresignedUploadUrl
  >;
const uploadSensorMetadataMock = uploadSensorMetadata as jest.MockedFunction<
  typeof uploadSensorMetadata
>;
const useRouterMock = useRouter as jest.MockedFunction<typeof useRouter>;
const UdpToastMock = UdpToast as unknown as jest.Mock;

const successToastMock = jest.fn();
const errorToastMock = jest.fn();
const refreshMock = jest.fn();

describe('UploadButton', () => {
  const user = userEvent.setup();
  const tenant = 'tenant-a';
  const project = 'project-b';

  const openModal = async () => {
    render(<UploadButton tenant={tenant} project={project} />);
    await user.click(
      screen.getByRole('button', { name: /Meta-daten hochladen/i }),
    );
  };

  beforeEach(() => {
    requestPresignedUploadUrlMock.mockReset();
    uploadSensorMetadataMock.mockReset();
    successToastMock.mockReset();
    errorToastMock.mockReset();
    refreshMock.mockReset();
    UdpToastMock.mockReset().mockImplementation((_, type) =>
      type === 'error' ? errorToastMock : successToastMock,
    );
    useRouterMock.mockReturnValue({
      refresh: refreshMock,
    } as unknown as ReturnType<typeof useRouter>);
  });

  it('renders modal content when opened', async () => {
    await openModal();

    expect(
      screen.getByRole('button', { name: /Datei hochladen/ }),
    ).toBeInTheDocument();
  });

  it('disables replace button when file is invalid', async () => {
    await openModal();

    const invalidFile = new File(['content'], 'data.txt', {
      type: 'text/plain',
    });
    const input = screen.getByTestId(ObjectUploadTestIds.fileInput);
    await user.upload(input, invalidFile);

    expect(
      screen.getByRole('button', { name: /Datei hochladen/ }),
    ).toBeDisabled();
  });

  it('uploads metadata and shows success toast', async () => {
    requestPresignedUploadUrlMock.mockResolvedValue({
      uploadUrl: 'https://upload',
      expiresAt: 123,
    });
    uploadSensorMetadataMock.mockResolvedValue(undefined);

    await openModal();

    const file = new File(['content'], 'metadata.csv', { type: 'text/csv' });
    const input = screen.getByTestId(ObjectUploadTestIds.fileInput);
    await user.upload(input, file);

    const submit = screen.getByRole('button', { name: /Datei hochladen/ });
    await user.click(submit);

    await waitFor(() =>
      expect(uploadSensorMetadataMock).toHaveBeenCalledWith(
        file,
        'https://upload',
        expect.any(Function),
      ),
    );
    expect(requestPresignedUploadUrlMock).toHaveBeenCalledWith(tenant, project);
    await waitFor(() => expect(successToastMock).toHaveBeenCalled());
    expect(errorToastMock).not.toHaveBeenCalled();
    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
  });

  it('shows error toast when upload fails', async () => {
    requestPresignedUploadUrlMock.mockResolvedValue({
      uploadUrl: 'https://upload',
      expiresAt: 123,
    });
    uploadSensorMetadataMock.mockRejectedValue(new Error('fail'));

    await openModal();

    const file = new File(['content'], 'metadata.csv', { type: 'text/csv' });
    const input = screen.getByTestId(ObjectUploadTestIds.fileInput);
    await user.upload(input, file);

    const submit = screen.getByRole('button', { name: /Datei hochladen/ });
    await user.click(submit);

    await waitFor(() => expect(errorToastMock).toHaveBeenCalled());
    expect(successToastMock).not.toHaveBeenCalled();
  });

  it('shows error toast when presign request fails', async () => {
    requestPresignedUploadUrlMock.mockRejectedValue(
      new Error('presign failed'),
    );

    await openModal();

    const file = new File(['content'], 'metadata.csv', { type: 'text/csv' });
    const input = screen.getByTestId(ObjectUploadTestIds.fileInput);
    await user.upload(input, file);

    const submit = screen.getByRole('button', { name: /Datei hochladen/ });
    await user.click(submit);

    await waitFor(() => expect(errorToastMock).toHaveBeenCalled());
    expect(uploadSensorMetadataMock).not.toHaveBeenCalled();
  });

  it('shows correct button text when replace prop is true', async () => {
    render(<UploadButton tenant={tenant} project={project} replace />);

    await user.click(
      screen.getByRole('button', { name: /Meta-Daten austauschen/ }),
    );

    expect(
      screen.getByRole('button', { name: /Datei ersetzen/ }),
    ).toBeInTheDocument();
  });
});
