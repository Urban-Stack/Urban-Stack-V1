import React, { RefObject } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContainerLogsModal, { internal } from './ContainerLogsModal';
import { ContainerLogModalTestIds } from './testIds';
import { UdpSpinnerTestId } from 'udp-ui/components';
import { UseContainerInfoHook } from '@/app/_lib/resource-api/common/containerinfo';
import { mkError, mkSuccess } from '@/app/api/_common/containerinfo';
import { mkContainerInfo } from '@/app/_lib/resource-api/common/containerinfo';

const USER = userEvent.setup();
const { Modal } = internal;

const mkInfo = (overrides?: {
  name?: string;
  status?: 'running' | 'waiting' | 'unknown';
  ready?: boolean;
  logs?: string;
  restartCount?: number;
  waitingReason?: string;
  waitingMessage?: string;
}) =>
  mkContainerInfo(
    overrides?.name ?? 'app-x',
    overrides?.status ?? 'running',
    overrides?.ready ?? true,
    overrides?.logs ?? 'log-line-1',
    overrides?.restartCount,
    overrides?.waitingReason,
    overrides?.waitingMessage,
  );

const mkMockHook = (
  overrides: Partial<ReturnType<UseContainerInfoHook>>,
): UseContainerInfoHook =>
  jest.fn().mockReturnValue({
    data: undefined,
    isLoading: false,
    error: undefined,
    ...overrides,
  });

const renderModal = (hook: UseContainerInfoHook) =>
  render(
    <Modal
      tenant='t1'
      name='app-x'
      useContainerInfo={hook}
      initialFocusRef={React.createRef<HTMLElement>() as RefObject<HTMLElement>}
      closeModal={() => {}}
    />,
  );

describe('ContainerLogsModal', () => {
  it('opens the modal when clicked on the children', async () => {
    const hook = mkMockHook({ data: mkSuccess(mkInfo()), isLoading: false });

    render(
      <ContainerLogsModal tenant='t1' appName='app-x' useContainerInfo={hook}>
        <button>open</button>
      </ContainerLogsModal>,
    );

    await USER.click(screen.getByRole('button', { name: 'open' }));
    expect(screen.getByText('Log-Ausgabe:')).toBeInTheDocument();
  });

  it('renders the error callout in case of error', () => {
    const hook = mkMockHook({
      isLoading: false,
      error: new Error(mkError('boom').error),
    });

    renderModal(hook);
    expect(
      screen.getByText('Fehler beim Abrufen der Container-Logs'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Log-Ausgabe:')).not.toBeInTheDocument();
  });

  it('renders the warning callout when a reason exists', () => {
    const hook = mkMockHook({
      data: mkSuccess(mkInfo({ waitingReason: 'Reason X', logs: '' })),
      isLoading: false,
    });

    renderModal(hook);
    expect(screen.getByText('Container meldet Warnungen')).toBeInTheDocument();
    expect(screen.getByText('Grund')).toBeInTheDocument();
    expect(screen.getByText('Reason X')).toBeInTheDocument();
  });

  it('renders the warning callout when a message exists', () => {
    const hook = mkMockHook({
      data: mkSuccess(mkInfo({ waitingMessage: 'Msg Y', logs: '' })),
      isLoading: false,
    });

    renderModal(hook);
    expect(screen.getByText('Container meldet Warnungen')).toBeInTheDocument();
    expect(screen.getByText('Warnung')).toBeInTheDocument();
    expect(screen.getByText('Msg Y')).toBeInTheDocument();
  });

  it('shows the latest updatedAt timestamp if available', () => {
    const now = new Date('2024-09-25');
    jest.useFakeTimers().setSystemTime(now);
    const hook = mkMockHook({ data: mkSuccess(mkInfo()), isLoading: false });

    renderModal(hook);

    const expected = new Date(now).toLocaleTimeString('de-DE');
    expect(
      screen.getByText(`Zuletzt geupdated: ${expected}`),
    ).toBeInTheDocument();

    jest.useRealTimers();
  });

  it('shows the log output if available', () => {
    const logs = 'alpha\nbeta';
    const hook = mkMockHook({
      data: mkSuccess(mkInfo({ logs })),
      isLoading: false,
    });

    renderModal(hook);
    const pre = screen.getByTestId(ContainerLogModalTestIds.logOutput);
    expect(pre).toHaveTextContent(/alpha\s*beta/);
  });

  it('shows spinner when loading', () => {
    const hook = mkMockHook({ isLoading: true, data: undefined });

    renderModal(hook);
    expect(screen.getByTestId(UdpSpinnerTestId)).toBeInTheDocument();
  });

  it('shows text indicating no log entries if no logs are available', () => {
    const hook = mkMockHook({
      data: mkSuccess(mkInfo({ logs: '' })),
      isLoading: false,
    });

    renderModal(hook);
    expect(screen.getByText('Keine Logeinträge vorhanden')).toBeInTheDocument();
  });

  it('allows copying logs if available and shows success message', async () => {
    const writeTextMock = jest
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue();
    const hook = mkMockHook({
      data: mkSuccess(mkInfo({ logs: 'to-copy' })),
      isLoading: false,
    });

    renderModal(hook);
    await USER.click(
      screen.getByRole('button', { name: /Container-Logs kopieren/i }),
    );

    expect(writeTextMock).toHaveBeenCalledWith('to-copy');
    expect(
      screen.getByTestId(ContainerLogModalTestIds.copyMessage),
    ).toHaveTextContent('Container-Logs wurden in die Zwischenablage kopiert');
  });

  it('shows the error message if copy fails', async () => {
    jest
      .spyOn(navigator.clipboard, 'writeText')
      .mockRejectedValue(new Error('denied'));
    const hook = mkMockHook({
      data: mkSuccess(mkInfo({ logs: 'to-copy' })),
      isLoading: false,
    });

    renderModal(hook);
    await USER.click(
      screen.getByRole('button', { name: /Container-Logs kopieren/i }),
    );

    expect(
      screen.getByTestId(ContainerLogModalTestIds.copyMessage),
    ).toHaveTextContent('Kopieren fehlgeschlagen: denied');
  });

  it('does not show copy button when no logs exist', () => {
    const hook = mkMockHook({
      data: mkSuccess(mkInfo({ logs: '' })),
      isLoading: false,
    });

    renderModal(hook);
    expect(
      screen.queryByRole('button', { name: /Container-Logs kopieren/i }),
    ).not.toBeInTheDocument();
  });
});
