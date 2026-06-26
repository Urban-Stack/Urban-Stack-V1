import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { deleteS3Object } from './actions';
import { UdpToast } from 'udp-ui/components';
import React, { FormEvent, ReactNode, RefObject, useActionState } from 'react';
import { internal } from '@/app/filemanager/_internal/delete/DeleteBadge';

const { PopoverContent, FormContent } = internal;

jest.mock('./actions', () => ({
  deleteS3Object: jest.fn(),
}));

jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpToast: jest.fn(),
}));

jest.mock(`next/form`, () => ({
  __esModule: true,
  default: ({
    children,
    action,
  }: {
    children: ReactNode;
    action: () => Promise<unknown>;
  }) => {
    const handleSubmit = (e: FormEvent) => {
      e.preventDefault();
      void action();
    };
    return <form onSubmit={handleSubmit}>{children}</form>;
  },
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useActionState: jest.fn(),
}));

const successToastMock = jest.fn();
const errorToastMock = jest.fn();

beforeEach(() => {
  (deleteS3Object as jest.Mock).mockClear();
  (UdpToast as jest.Mock).mockClear();
  (useActionState as jest.Mock).mockImplementation((fn) => [false, fn]);
  (UdpToast as jest.Mock)
    .mockReset()
    .mockImplementation((_, type) =>
      type === 'error' ? errorToastMock : successToastMock,
    );
  successToastMock.mockReset();
  errorToastMock.mockReset();
});

describe('PopoverContent', () => {
  const user = userEvent.setup();

  it('triggers deleting s3 object with click on submit', async () => {
    (deleteS3Object as jest.Mock).mockResolvedValue(true);

    render(
      <PopoverContent
        tenant='tenant'
        project='project'
        objectKey='key'
        bucket='bucket'
        dataset='dataset'
        initialFocusRef={
          React.createRef<HTMLElement>() as RefObject<HTMLElement>
        }
        closeModal={() => {}}
      />,
    );
    await user.click(screen.getByRole('button', { name: /Datei löschen/i }));

    expect(deleteS3Object).toHaveBeenCalledWith(
      'tenant',
      'project',
      'bucket',
      'key',
      'dataset',
    );
  });
});

describe('FormContent', () => {
  it('shows no toast on initial state', () => {
    render(
      <FormContent
        state={{ isInitial: true }}
        objectKey={'key'}
        isLoading={false}
        initialFocusRef={
          React.createRef<HTMLElement>() as RefObject<HTMLElement>
        }
        closeModal={() => {}}
      />,
    );
    expect(successToastMock).not.toHaveBeenCalled();
    expect(errorToastMock).not.toHaveBeenCalled();
  });

  it('shows success toast on success', async () => {
    render(
      <FormContent
        state={{ data: {} }}
        objectKey='key'
        isLoading={false}
        initialFocusRef={
          React.createRef<HTMLElement>() as RefObject<HTMLElement>
        }
        closeModal={() => {}}
      />,
    );

    expect(successToastMock).toHaveBeenCalled();
    expect(errorToastMock).not.toHaveBeenCalled();
  });

  it('shows error toast on error', async () => {
    render(
      <FormContent
        state={{ errors: {} }}
        objectKey='key'
        isLoading={false}
        initialFocusRef={
          React.createRef<HTMLElement>() as RefObject<HTMLElement>
        }
        closeModal={() => {}}
      />,
    );

    expect(successToastMock).not.toHaveBeenCalled();
    expect(errorToastMock).toHaveBeenCalled();
  });
});
