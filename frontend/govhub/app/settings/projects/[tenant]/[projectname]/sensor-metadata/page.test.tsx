import { render } from '@testing-library/react';
import MetadataCard from '@/app/settings/projects/[tenant]/[projectname]/sensor-metadata/_internal/MetadataCard';
import SensorMetadataPage from '@/app/settings/projects/[tenant]/[projectname]/sensor-metadata/page';

jest.mock('@/app/meta', () => ({
  mkMetadata: jest.fn(),
}));

jest.mock(
  '@/app/settings/projects/[tenant]/[projectname]/sensor-metadata/_internal/MetadataCard',
  () => ({
    __esModule: true,
    default: jest.fn(() => <div>metadata-card</div>),
  }),
);

const metadataCardMock = MetadataCard as jest.Mock;

describe('SensorMetadataPage', () => {
  beforeEach(() => {
    metadataCardMock.mockClear();
  });

  it('renders metadata card with resolved tenant and project params', async () => {
    const params = { tenant: 'tenant-42', projectname: 'project-7' };

    const { getByText } = render(
      await SensorMetadataPage({ params: Promise.resolve(params) }),
    );

    expect(getByText('metadata-card')).toBeInTheDocument();
    expect(metadataCardMock).toHaveBeenCalledWith(
      expect.objectContaining({ tenant: 'tenant-42', project: 'project-7' }),
      undefined,
    );
  });
});
