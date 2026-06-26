import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropzone } from './Dropzone';
import { UdpProgressBar } from 'udp-ui/components';
import { ObjectUploadTestIds } from '@/app/filemanager/_internal/testIds';

jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  IcCloudArrow: jest.fn(() => <div data-testid='ic-cloud-arrow' />),
  IcFile: jest.fn(() => <div data-testid='ic-file' />),
  IcFileCircleXMark: jest.fn(() => <div data-testid='ic-file-circle-x-mark' />),
  UdpProgressBar: jest.fn(() => <div data-testid='udp-progress-bar' />),
}));

const user = userEvent.setup();

const TEST_FILE = new File(['content'], 'metadata.csv', {
  type: 'text/csv',
});

describe('file icon', () => {
  it('shows default icon when no file is selected', () => {
    render(
      <Dropzone id='htmlId' file={null} progress={0} onFileChange={() => {}} />,
    );

    expect(screen.getByTestId('ic-cloud-arrow')).toBeInTheDocument();
    expect(screen.queryByTestId('ic-file')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('ic-file-circle-x-mark'),
    ).not.toBeInTheDocument();
  });

  it('shows valid file icon when file passes validation', () => {
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

  it('shows invalid file icon when file fails validation', async () => {
    const invalidFile = new File(['content'], 'invalid.txt', {
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
  it('hides helper text when no file is selected', () => {
    render(
      <Dropzone id='htmlId' file={null} progress={0} onFileChange={() => {}} />,
    );
    expect(screen.queryByText(/Dateiname ungültig!/)).not.toBeInTheDocument();
  });

  it('hides helper text when file is valid', () => {
    render(
      <Dropzone
        id='htmlId'
        file={TEST_FILE}
        isValid
        progress={0}
        onFileChange={() => {}}
      />,
    );
    expect(screen.queryByText(/Dateiname ungültig!/)).not.toBeInTheDocument();
  });

  it('shows helper text when file is invalid', () => {
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

  it('shows provided helper text', () => {
    const custom = 'Nur CSV Dateien erlaubt';
    render(
      <Dropzone
        id='htmlId'
        file={TEST_FILE}
        isValid={false}
        progress={0}
        onFileChange={() => {}}
        errTxtInvalidFile={custom}
      />,
    );
    expect(screen.getByText(custom)).toBeInTheDocument();
  });
});

describe('progress bar', () => {
  it('renders progress bar when progress value exists', () => {
    render(
      <Dropzone
        id='htmlId'
        file={TEST_FILE}
        isValid
        progress={45}
        onFileChange={() => {}}
      />,
    );
    expect(UdpProgressBar).toHaveBeenCalledWith(
      expect.objectContaining({ progress: 45 }),
      undefined,
    );
  });

  it('does not render progress bar when progress is null', () => {
    render(
      <Dropzone
        id='htmlId'
        file={TEST_FILE}
        isValid
        progress={null}
        onFileChange={() => {}}
      />,
    );
    expect(screen.queryByTestId('udp-progress-bar')).not.toBeInTheDocument();
  });
});

describe('content rendering', () => {
  it('shows filename when file is present', () => {
    render(
      <Dropzone
        id='htmlId'
        file={TEST_FILE}
        isValid
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

  it('shows default instructions when no file is present', () => {
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
    expect(screen.getByText(/Nur CSV Dateien mit/)).toBeInTheDocument();
  });
});
