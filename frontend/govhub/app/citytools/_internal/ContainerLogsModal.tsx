import { MouseEventHandler, ReactElement, RefObject, useState } from 'react';
import {
  IcCheckCircle,
  IcClone,
  IcInfoCircle,
  UdpButton,
  UdpClientModal,
  UdpClientModalContentProps,
  UdpSpinner,
} from 'udp-ui/components';
import { ContainerLogModalTestIds } from '@/app/citytools/_internal/testIds';
import { twMerge } from 'tailwind-merge';
import { UseContainerInfoHook } from '@/app/_lib/resource-api/common/containerinfo';

type ContainerInfoData = ReturnType<UseContainerInfoHook>['data'];

const ContainerLogsModal = ({
  tenant,
  appName,
  useContainerInfo,
  children,
}: {
  tenant: string;
  appName: string;
  useContainerInfo: UseContainerInfoHook;
  children: ReactElement<{
    onClick: MouseEventHandler<HTMLElement>;
  }>;
}) => (
  <UdpClientModal
    title='Container Logs'
    size='4xl'
    content={(props: UdpClientModalContentProps) => (
      <Modal
        tenant={tenant}
        name={appName}
        useContainerInfo={useContainerInfo}
        {...props}
      />
    )}
  >
    {children}
  </UdpClientModal>
);

const LINE_COUNT = 1_000;

const Modal = ({
  tenant,
  name,
  useContainerInfo,
  initialFocusRef,
  closeModal,
}: {
  tenant: string;
  name: string;
  useContainerInfo: UseContainerInfoHook;
} & UdpClientModalContentProps) => {
  const {
    data: resp,
    isLoading,
    error,
  } = useContainerInfo(tenant, name, LINE_COUNT);

  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string>();
  const copyCredentialsToClipboard = async () => {
    if (!resp?.containerInfo) return;
    setCopied(false);
    setCopyError(undefined);
    try {
      await navigator.clipboard.writeText(resp.containerInfo.logs);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      const message = `Kopieren fehlgeschlagen${e instanceof Error && e.message ? ': ' + e.message : ''}`;
      setCopyError(message);
      setTimeout(() => setCopyError(undefined), 3000);
    }
  };

  const toTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString('de-DE');

  if (error)
    return (
      <section className='flex flex-col gap-2 max-h-[70vh]'>
        <ErrorCallout message={error.message} />
      </section>
    );

  return (
    <section className='flex flex-col gap-2 min-h-[30vh] max-h-[70vh]'>
      <WarningCallout
        reason={resp?.containerInfo.waitingReason}
        message={resp?.containerInfo.waitingMessage}
      />
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2'>
        <p>Log-Ausgabe:</p>
        <p className='text-sm text-gray-300'>
          {resp?.updatedAt
            ? `Zuletzt geupdated: ${toTime(resp.updatedAt)}`
            : ''}
        </p>
      </div>
      <LogOutput
        isLoading={isLoading}
        initialFocusRef={initialFocusRef}
        logs={resp?.containerInfo.logs}
      />
      <div className='flex flex-col gap-2'>
        <CopyMessage copied={copied} error={copyError ?? undefined} />
        <ButtonGroup
          showCopy={logsExist(resp)}
          copy={copyCredentialsToClipboard}
          closeModal={closeModal}
        />
      </div>
    </section>
  );
};

const logsExist = (resp?: ContainerInfoData) =>
  !!resp?.containerInfo.logs && resp.containerInfo.logs.length > 0;

const LogOutput = ({
  isLoading,
  initialFocusRef,
  logs,
}: {
  isLoading: boolean;
  initialFocusRef: UdpClientModalContentProps['initialFocusRef'];
  logs?: string;
}) => {
  const Fallback = (() => {
    if (isLoading)
      return (
        <div className='flex-1 grid place-items-center'>
          <UdpSpinner />
        </div>
      );
    else if (!logs || logs === '')
      return (
        <div className='flex-1 grid place-items-center'>
          <p className='text-gray-600'>Keine Logeinträge vorhanden</p>
        </div>
      );
    else return undefined;
  })();
  return (
    <section
      className={twMerge(
        'flex-1 min-h-0 overflow-auto rounded-lg bg-gray-50 p-4',
        'udp-scroll-thin',
        'focus:outline-none',
        'focus-visible:ring-3 focus-visible:ring-primary-200',
        !!Fallback && 'grid place-items-center',
      )}
      ref={initialFocusRef as RefObject<HTMLDivElement>}
      aria-label='Container-Logs'
      tabIndex={0}
    >
      {Fallback ?? (
        <pre
          className='font-mono text-xs leading-5 text-gray-800 whitespace-pre udp-scroll-thin'
          data-testid={ContainerLogModalTestIds.logOutput}
        >
          {logs}
        </pre>
      )}
    </section>
  );
};

const ErrorCallout = ({ message }: { message: string }) => (
  <section
    role='alert'
    aria-live='polite'
    className='rounded-xl bg-danger-50 p-4 text-danger-800'
  >
    <div className='flex gap-3'>
      <span className='inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-danger-200 text-sm font-bold'>
        !
      </span>
      <div className='min-w-0'>
        <h3 className='text-sm font-semibold'>
          Fehler beim Abrufen der Container-Logs
        </h3>
        <dl className='mt-2 space-y-1 text-sm'>
          <div className='flex flex-col sm:flex-row gap-1 sm:gap-3'>
            <dt className='w-20 shrink-0 text-red-700'>Fehler</dt>
            <dd className='min-w-0 break-words'>{message}</dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
);

const WarningCallout = ({
  reason,
  message,
}: {
  reason?: string;
  message?: string;
}) => {
  const r = reason?.trim() ?? '';
  const m = message?.trim() ?? '';
  if (!r && !m) return null;

  return (
    <section
      role='alert'
      aria-live='polite'
      className='rounded-xl bg-warning-50 p-4 text-warning-800'
    >
      <div className='flex gap-3'>
        <span className='inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-warning-200 text-sm font-bold'>
          !
        </span>
        <div className='min-w-0'>
          <h3 className='text-sm font-semibold'>Container meldet Warnungen</h3>
          <dl className='mt-2 space-y-1 text-sm'>
            {r && (
              <div className='flex flex-col sm:flex-row gap-1 sm:gap-3'>
                <dt className='w-20 shrink-0 text-amber-700'>Grund</dt>
                <dd className='min-w-0 break-words'>{r}</dd>
              </div>
            )}
            {m && (
              <div className='flex flex-col sm:flex-row gap-1 sm:gap-3'>
                <dt className='w-20 shrink-0 text-amber-700'>Warnung</dt>
                <dd className='min-w-0 break-words'>{m}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </section>
  );
};

const CopyMessage = ({
  copied,
  error,
}: {
  copied: boolean;
  error?: string;
}) => {
  const Content = () => {
    if (copied && !error)
      return (
        <div className='flex items-center gap-1.5 text-success-600'>
          <div>
            <IcCheckCircle className='size-5' />
          </div>
          <p className='w-full'>
            Container-Logs wurden in die Zwischenablage kopiert
          </p>
        </div>
      );
    else if (error)
      return (
        <div className='flex items-center gap-1.5 text-danger-500'>
          <div>
            <IcInfoCircle className='size-5' />
          </div>
          <p className='w-full'>{error}</p>
        </div>
      );
    else return null;
  };

  return (
    <div
      data-testid={ContainerLogModalTestIds.copyMessage}
      className={twMerge(
        'min-h-7 transition-opacity duration-300',
        copied || error ? 'visible' : 'invisible',
      )}
    >
      <Content />
    </div>
  );
};

const ButtonGroup = ({
  showCopy,
  copy,
  closeModal,
}: {
  showCopy: boolean;
  copy: () => Promise<void>;
  closeModal: () => void;
}) => (
  <div className='flex gap-3.5 flex-wrap w-fit [&>*]:grow [&>*]:justify-center'>
    {showCopy && (
      <UdpButton icon={IcClone} color='secondary' onClick={() => void copy()}>
        Container-Logs kopieren
      </UdpButton>
    )}
    <UdpButton color='tertiary' onClick={closeModal}>
      Schließen
    </UdpButton>
  </div>
);

export default ContainerLogsModal;

export const internal = {
  Modal,
};
