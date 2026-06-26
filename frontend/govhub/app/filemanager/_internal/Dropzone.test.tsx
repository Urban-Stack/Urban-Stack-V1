import { render, screen } from '@testing-library/react';
import { ObjectUploadTestIds } from '@/app/filemanager/_internal/testIds';
import userEvent from '@testing-library/user-event';
import { Dropzone } from '@/app/filemanager/_internal/Dropzone';
import { UdpProgressBar } from 'udp-ui/components';

jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  IcCloudArrow: jest.fn(() => <div data-testid='ic-cloud-arrow' />),
  IcFile: jest.fn(() => <div data-testid='ic-file' />),
  IcFileCircleXMark: jest.fn(() => <div data-testid='ic-file-circle-x-mark' />),
  UdpProgressBar: jest.fn(() => <div data-testid='udp-progress-bar' />),
}));

const user = userEvent.setup();

const TEST_FILE = new File(['content'], 'test-file.txt', {
  type: 'text/plain',
});

describe('file icon', () => {
  it('shows default icon if no file is selected', () => {
    render(
      <Dropzone id='htmlId' file={null} progress={0} onFileChange={() => {}} />,
    );

    expect(screen.getByTestId('ic-cloud-arrow')).toBeInTheDocument();
    expect(screen.queryByTestId('ic-file')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('ic-file-circle-x-mark'),
    ).not.toBeInTheDocument();
  });

  it('shows normal file icon if a valid file is selected', () => {
    render(
      <Dropzone
        id='htmlId'
        file={TEST_FILE}
        isValid
        progress={0}
        onFileChange={() => {}}
      />,
    );

    expect(screen.getByTestId('ic-file')).toBeInTheDocument();
    expect(screen.queryByTestId('ic-cloud-arrow')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('ic-file-circle-x-mark'),
    ).not.toBeInTheDocument();
  });

  it('shows file icon with circle mark if invalid file is selected', async () => {
    const invalidFile = new File(['content'], 'Invalid File.txt', {
      type: 'text/plain',
    });

    render(
      <Dropzone
        id='htmlId'
        file={invalidFile}
        isValid={false}
        progress={0}
        onFileChange={() => {}}
      />,
    );

    const fileInput = screen.getByTestId<HTMLInputElement>(
      ObjectUploadTestIds.fileInput,
    );
    await user.upload(fileInput, invalidFile);

    expect(screen.getByTestId('ic-file-circle-x-mark')).toBeInTheDocument();
    expect(screen.queryByTestId('ic-cloud-arrow')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ic-file')).not.toBeInTheDocument();
  });
});

describe('helper text', () => {
  it('does not show helper text if no file is selected', () => {
    render(
      <Dropzone id='htmlId' file={null} progress={0} onFileChange={() => {}} />,
    );
    expect(screen.queryByText(/Dateiname ungültig!/)).not.toBeInTheDocument();
  });

  it('does not show helper text if file is valid', () => {
    render(
      <Dropzone
        id='htmlId'
        file={TEST_FILE}
        isValid={true}
        progress={0}
        onFileChange={() => {}}
      />,
    );
    expect(screen.queryByText(/Dateiname ungültig!/)).not.toBeInTheDocument();
  });

  it('shows helper text if file is invalid', () => {
    render(
      <Dropzone
        id='htmlId'
        file={TEST_FILE}
        isValid={false}
        progress={0}
        onFileChange={() => {}}
      />,
    );
    expect(screen.getByText(/Dateiname ungültig!/)).toBeInTheDocument();
  });

  it('shows custom helper text if provided', () => {
    const customErrorText = 'Custom error message';
    render(
      <Dropzone
        id='htmlId'
        file={TEST_FILE}
        isValid={false}
        progress={0}
        onFileChange={() => {}}
        errTxtInvalidFile={customErrorText}
      />,
    );
    expect(screen.getByText(customErrorText)).toBeInTheDocument();
  });
});

describe('progress bar', () => {
  it('calls progress bar component with correct progress', () => {
    render(
      <Dropzone
        id='htmlId'
        file={TEST_FILE}
        isValid={true}
        progress={42}
        onFileChange={() => {}}
      />,
    );
    expect(UdpProgressBar).toHaveBeenCalledWith(
      expect.objectContaining({ progress: 42 }),
      undefined,
    );
  });

  it('does not show progress bar component if progress is null', () => {
    render(
      <Dropzone
        id='htmlId'
        file={TEST_FILE}
        isValid={true}
        progress={null}
        onFileChange={() => {}}
      />,
    );
    expect(screen.queryByTestId('udp-progress-bar')).not.toBeInTheDocument();
  });
});

describe('filename and default text', () => {
  it('shows filename if file is selected', () => {
    render(
      <Dropzone
        id='htmlId'
        file={TEST_FILE}
        isValid={true}
        progress={null}
        onFileChange={() => {}}
      />,
    );
    expect(screen.getByText(TEST_FILE.name)).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Drag and Drop oder hier klicken, um Datei auszuwählen/,
      ),
    ).not.toBeInTheDocument();
  });

  it('shows default text if no file is selected', () => {
    render(
      <Dropzone
        id='htmlId'
        file={null}
        progress={null}
        onFileChange={() => {}}
      />,
    );
    expect(
      screen.getByText(/Drag and Drop oder hier klicken, um Datei auszuwählen/),
    ).toBeInTheDocument();
  });
});
