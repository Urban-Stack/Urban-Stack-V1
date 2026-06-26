import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteButton, { internal } from './DeleteButton';
import { MetadataCardTestIds } from './testIds';
import { createRef, RefObject } from 'react';
import { UdpToast } from 'udp-ui/components';

const { FormContent } = internal;

const refreshMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ refresh: refreshMock })),
}));

jest.mock('./actions', () => ({
  deleteSensorMetadata: jest.fn(),
}));

jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpToast: jest.fn(),
}));

const UdpToastMock = UdpToast as unknown as jest.Mock;
const successToastMock = jest.fn();
const errorToastMock = jest.fn();

describe('FormContent', () => {
  const closeModal = jest.fn();
  const initialFocusRef = createRef();

  beforeEach(() => {
    UdpToastMock.mockReset().mockImplementation((_, type) =>
      type === 'error' ? errorToastMock : successToastMock,
    );
    successToastMock.mockReset();
    errorToastMock.mockReset();
    refreshMock.mockReset();
  });

  it('does not show a toast initially', () => {
    render(
      <FormContent
        state={{ isInitial: true }}
        isLoading={false}
        closeModal={closeModal}
        initialFocusRef={initialFocusRef as RefObject<HTMLElement>}
      />,
    );

    expect(successToastMock).not.toHaveBeenCalled();
    expect(errorToastMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it('shows success toast after successful deletion', () => {
    render(
      <FormContent
        state={{ isInitial: false, data: {} }}
        isLoading={false}
        closeModal={closeModal}
        initialFocusRef={initialFocusRef as RefObject<HTMLElement>}
      />,
    );

    expect(UdpToastMock).toHaveBeenCalledWith(
      'Metadaten wurden erfolgreich gelöscht.',
      'success',
    );
    expect(successToastMock).toHaveBeenCalled();
    expect(errorToastMock).not.toHaveBeenCalled();
    expect(refreshMock).toHaveBeenCalled();
  });

  it('shows error toast when deletion fails', () => {
    render(
      <FormContent
        state={{ isInitial: false, errors: { general: ['boom'] } }}
        isLoading={false}
        closeModal={closeModal}
        initialFocusRef={initialFocusRef as RefObject<HTMLElement>}
      />,
    );

    expect(UdpToastMock).toHaveBeenCalledWith(
      expect.stringContaining('Metadaten konnten nicht gelöscht werden.'),
      'error',
    );
    expect(errorToastMock).toHaveBeenCalled();
    expect(successToastMock).not.toHaveBeenCalled();
    expect(refreshMock).toHaveBeenCalled();
  });
});

describe('DeleteButton', () => {
  const user = userEvent.setup();
  const defaultProps = {
    tenant: 'tenant-1',
    project: 'project-1',
  };

  it('shows tooltip on hover and opens modal on click', async () => {
    render(<DeleteButton {...defaultProps} />);

    const button = screen.getByTestId(MetadataCardTestIds.deleteButton);
    expect(button).toBeInTheDocument();

    await user.hover(button);
    expect(await screen.findByText('Meta-Daten löschen')).toBeInTheDocument();

    expect(screen.queryByText('Meta-Daten löschen?')).not.toBeInTheDocument();
    await user.click(button);
    expect(await screen.findByText('Meta-Daten löschen?')).toBeInTheDocument();
  });
});
