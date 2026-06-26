import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DownloadButton from './DownloadButton';
import { MetadataCardTestIds } from './testIds';
import { UdpToast } from 'udp-ui/components';
import { mkDownloadUrl } from '@/app/_lib/sensor-metadata/common';

const refreshMock = jest.fn();

jest.mock('@/app/_lib/sensor-metadata/common', () => ({
  mkDownloadUrl: jest.fn(),
}));
jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpToast: jest.fn(),
}));

const mkDownloadUrlMock = mkDownloadUrl as jest.MockedFunction<
  typeof mkDownloadUrl
>;

const UdpToastMock = UdpToast as unknown as jest.Mock;
const successToastMock = jest.fn();
const errorToastMock = jest.fn();

describe('DownloadButton', () => {
  const user = userEvent.setup();
  const defaultProps = {
    tenant: 'tenant-1',
    project: 'project-1',
  };

  beforeEach(() => {
    mkDownloadUrlMock.mockReset();
    successToastMock.mockReset();
    errorToastMock.mockReset();
    refreshMock.mockReset();
    UdpToastMock.mockReset().mockImplementation((_, type) =>
      type === 'error' ? errorToastMock : successToastMock,
    );
  });

  it('shows tooltip on hover', async () => {
    render(<DownloadButton {...defaultProps} />);

    const button = screen.getByTestId(MetadataCardTestIds.downloadButton);
    expect(button).toBeInTheDocument();

    await user.hover(button);
    expect(
      await screen.findByText('Meta-Daten herunterladen'),
    ).toBeInTheDocument();
  });

  it('download button has the correct href', async () => {
    const internalDownloadUrl = 'internal/api/download';
    mkDownloadUrlMock.mockReturnValue(internalDownloadUrl);

    render(<DownloadButton {...defaultProps} />);

    expect(mkDownloadUrlMock).toHaveBeenCalledWith(
      defaultProps.tenant,
      defaultProps.project,
    );

    const downloadButton = screen.getByTestId(
      MetadataCardTestIds.downloadButton,
    );
    expect(downloadButton).toHaveAttribute('href', internalDownloadUrl);
  });
});
