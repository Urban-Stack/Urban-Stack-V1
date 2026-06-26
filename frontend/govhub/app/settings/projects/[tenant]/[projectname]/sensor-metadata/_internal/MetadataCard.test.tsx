import { render, screen } from '@testing-library/react';
import { getMetadata } from '@/app/_lib/sensor-metadata/metadata';
import MetadataCard from './MetadataCard';
import { UdpCard } from 'udp-ui/components';
import DeleteButton from '@/app/settings/projects/[tenant]/[projectname]/sensor-metadata/_internal/DeleteButton';
import UploadButton from '@/app/settings/projects/[tenant]/[projectname]/sensor-metadata/_internal/UploadButton';
import DownloadButton from '@/app/settings/projects/[tenant]/[projectname]/sensor-metadata/_internal/DownloadButton';

jest.mock('@/app/_lib/sensor-metadata/metadata', () => ({
  getMetadata: jest.fn(),
}));

jest.mock('./DeleteButton', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid='delete-button' />),
}));

jest.mock('./UploadButton', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid='upload-button' />),
}));

jest.mock('./DownloadButton', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid='download-button' />),
}));

jest.mock('udp-ui/components', () => ({
  UdpCard: jest.fn(({ children }) => (
    <div data-testid='udp-card'>{children}</div>
  )),
}));

const getMetadataMock = getMetadata as jest.MockedFunction<typeof getMetadata>;
const UdpCardMock = UdpCard as unknown as jest.Mock;
const DeleteButtonMock = DeleteButton as jest.Mock;
const UploadButtonMock = UploadButton as jest.Mock;
const DownloadButtonMock = DownloadButton as jest.Mock;

describe('MetadataCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correct buttons when metadata exists', async () => {
    getMetadataMock.mockResolvedValueOnce({ count: 2 });

    render(await MetadataCard({ tenant: 'tenant-1', project: 'project-1' }));

    expect(UdpCardMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Sensor-Meta-Daten hochgeladen',
        description: 'Eine Datei mit Sensor-Meta-Daten wurde hochgeladen.',
        color: 'primary',
      }),
      undefined,
    );

    expect(screen.getByTestId('udp-card')).toBeInTheDocument();
    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    expect(screen.queryByTestId('upload-button')).toBeInTheDocument();
    expect(screen.queryByTestId('download-button')).toBeInTheDocument();
    expect(UploadButtonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant: 'tenant-1',
        project: 'project-1',
        replace: true,
      }),
      undefined,
    );
    expect(DownloadButtonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant: 'tenant-1',
        project: 'project-1',
      }),
      undefined,
    );
    expect(DeleteButtonMock).toHaveBeenCalledWith(
      expect.objectContaining({ tenant: 'tenant-1', project: 'project-1' }),
      undefined,
    );
  });

  it('renders correct buttons when metadata is missing', async () => {
    getMetadataMock.mockResolvedValueOnce({ count: 0 });

    render(await MetadataCard({ tenant: 'tenant-2', project: 'project-2' }));

    expect(UdpCardMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Noch keine Sensor-Meta-Daten vorhanden',
        description: 'Laden Sie hier Ihre Sensor-Meta-Daten hoch.',
        color: 'warning',
      }),
      undefined,
    );

    expect(screen.getByTestId('udp-card')).toBeInTheDocument();
    expect(screen.queryByTestId('download-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument();
    expect(screen.getByTestId('upload-button')).toBeInTheDocument();
    expect(UploadButtonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant: 'tenant-2',
        project: 'project-2',
        replace: false,
      }),
      undefined,
    );
    expect(DownloadButtonMock).not.toHaveBeenCalled();
    expect(DeleteButtonMock).not.toHaveBeenCalled();
  });
});
