import { render, screen, waitFor } from '@testing-library/react';
import { internal } from './HelpDeskForm';
import { HelpDeskState } from './_internal/form';
import { UdpToast } from 'udp-ui/components';

jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpToast: jest.fn(),
}));

jest.mock('@/app/helpdesk/_internal/actions', () => ({
  submitRequest: jest.fn(),
}));

const { FormContent } = internal;

const UdpToastMock = UdpToast as unknown as jest.Mock;
const errorToastMock = jest.fn();
const successToastMock = jest.fn();

describe('FormContent', () => {
  beforeEach(() => {
    UdpToastMock.mockReset().mockImplementation((_message, type) =>
      type === 'error' ? errorToastMock : successToastMock,
    );
    errorToastMock.mockReset();
    successToastMock.mockReset();
  });

  it('does not create toasts on initial render', () => {
    const state = { isInitial: true } satisfies HelpDeskState;

    render(<FormContent state={state} isLoading={false} />);

    expect(UdpToastMock).not.toHaveBeenCalled();
    expect(errorToastMock).not.toHaveBeenCalled();
    expect(successToastMock).not.toHaveBeenCalled();
  });

  it('renders form fields with provided values', () => {
    const state = {
      isInitial: true,
      data: { reason: 'Support', description: 'Detailed description' },
    } satisfies HelpDeskState;

    render(<FormContent state={state} isLoading={false} />);

    expect(screen.getByLabelText('Grund*')).toHaveValue('Support');
    expect(screen.getByLabelText(/Beschreibung/)).toHaveValue(
      'Detailed description',
    );
  });

  it('shows error toast when general errors are present', () => {
    const state = {
      isInitial: false,
      errors: { general: ['Fehler 1', 'Fehler 2'] },
    } satisfies HelpDeskState;

    render(<FormContent state={state} isLoading={false} />);

    expect(successToastMock).not.toHaveBeenCalled();
    expect(errorToastMock).toHaveBeenCalled();
  });

  it('shows success toast when request succeeds', async () => {
    const state = {
      data: { reason: 'Support', description: 'Detailed description' },
    } satisfies HelpDeskState;

    render(<FormContent state={state} isLoading={false} />);

    expect(errorToastMock).not.toHaveBeenCalled();
    expect(successToastMock).toHaveBeenCalled();
  });

  it('does not invoke toast handlers when only field errors exist', async () => {
    const state = {
      errors: { reason: ['zu kurz'] },
      data: { reason: 'Ok', description: 'Details' },
    } satisfies HelpDeskState;

    render(<FormContent state={state} isLoading={false} />);

    await waitFor(() => {
      expect(errorToastMock).not.toHaveBeenCalled();
      expect(successToastMock).not.toHaveBeenCalled();
    });
  });
});
