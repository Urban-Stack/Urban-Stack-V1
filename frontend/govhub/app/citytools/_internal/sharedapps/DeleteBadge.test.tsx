import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteBadge, { internal } from './DeleteBadge';
import { UdpToast } from 'udp-ui/components';
import { createRef, RefObject } from 'react';

const refreshMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ refresh: refreshMock })),
}));

jest.mock('./actions', () => ({
  deleteSharedApp: jest.fn(),
}));

jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpToast: jest.fn(),
}));

const UdpToastMock = UdpToast as unknown as jest.Mock;
const successToastMock = jest.fn();
const errorToastMock = jest.fn();

describe('FormContent', () => {
  const { FormContent } = internal;
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
        displayName='App X'
        isLoading={false}
        closeModal={closeModal}
        initialFocusRef={initialFocusRef as RefObject<HTMLElement>}
      />,
    );

    expect(UdpToastMock).not.toHaveBeenCalled();
    expect(successToastMock).not.toHaveBeenCalled();
    expect(errorToastMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it('shows success toast', () => {
    render(
      <FormContent
        state={{ isInitial: false, data: {} }}
        displayName='App X'
        isLoading={false}
        closeModal={closeModal}
        initialFocusRef={initialFocusRef as RefObject<HTMLElement>}
      />,
    );

    expect(successToastMock).toHaveBeenCalled();
    expect(errorToastMock).not.toHaveBeenCalled();
    expect(refreshMock).toHaveBeenCalled();
  });
  it('shows error toast', () => {
    render(
      <FormContent
        state={{ isInitial: false, errors: {} }}
        displayName='App X'
        isLoading={false}
        closeModal={closeModal}
        initialFocusRef={initialFocusRef as RefObject<HTMLElement>}
      />,
    );

    expect(errorToastMock).toHaveBeenCalled();
    expect(successToastMock).not.toHaveBeenCalled();
    expect(refreshMock).toHaveBeenCalled();
  });
});

describe('DeleteBadge', () => {
  const user = userEvent.setup();

  const defaultProps = {
    tenant: 'tenant-1',
    name: 'app-x',
    displayName: 'App X',
  };

  it('shows the tooltip on hover', async () => {
    render(<DeleteBadge {...defaultProps} />);

    const badge = screen.getByRole('button');
    await user.hover(badge);

    expect(screen.getByText('Shared App löschen')).toBeInTheDocument();
  });

  it('renders the badge and opens modal on click', async () => {
    render(<DeleteBadge {...defaultProps} />);

    const badge = screen.getByRole('button');
    expect(badge).toBeInTheDocument();

    expect(screen.queryByText('Shared App löschen?')).not.toBeInTheDocument();

    await user.click(badge);

    expect(screen.getByText('Shared App löschen?')).toBeInTheDocument();
  });
});
