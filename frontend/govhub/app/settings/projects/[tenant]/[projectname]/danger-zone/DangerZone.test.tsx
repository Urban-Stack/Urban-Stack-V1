import { deleteProject } from './actions';
import { render } from '@testing-library/react';
import DangerZone from '@/app/settings/projects/[tenant]/[projectname]/danger-zone/DangerZone';
import userEvent from '@testing-library/user-event';
import { FuncMock } from '@/app/_test/utils';
import { UdpToast } from 'udp-ui/components';
import { useParams, useRouter } from 'next/navigation';

const TEST_TENANT_NAME = 'test-tenant';
const TEST_PROJECT_NAME = 'test-project';

jest.mock(
  '@/app/settings/projects/[tenant]/[projectname]/danger-zone/actions',
  () => ({
    deleteProject: jest.fn(),
  }),
);

jest.mock('@/app/_lib/resource-api/graphql/project', () => ({
  mutateDeleteProject: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

const UdpToastMock = UdpToast as unknown as jest.Mock;
jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpToast: jest.fn(),
}));
const successToastMock = jest.fn();
const errorToastMock = jest.fn();

const deleteProjectMock: FuncMock<typeof deleteProject> =
  deleteProject as unknown as jest.Mock;

const renderComponent = async () => render(DangerZone());

beforeEach(() => {
  deleteProjectMock.mockReset();
  UdpToastMock.mockReset().mockImplementation((_, type) =>
    type === 'error' ? errorToastMock : successToastMock,
  );
  successToastMock.mockReset();
  errorToastMock.mockReset();
  jest.mocked(useParams).mockReturnValue({
    tenant: TEST_TENANT_NAME,
    projectname: TEST_PROJECT_NAME,
  });
});

describe('pseudo snapshot', () => {
  it('renders page as expected', async () => {
    const component = await renderComponent();

    const deleteBtn = component.getByRole('button', { name: /Löschen/ });
    expect(deleteBtn).toBeInTheDocument();
    expect(deleteBtn).toBeDisabled();

    const heading = component.getByText(
      'Hier können Sie das Projekt "test-project" löschen',
    );
    expect(heading).toBeInTheDocument();

    const explainer = component.getByText(
      'Alle Daten, die in dem Projekt enthalten sind, werden dauerhaft gelöscht! Diese Aktion kann nicht rückgängig gemacht werden!',
    );
    expect(explainer).toBeInTheDocument();

    const textBox = component.getByRole('textbox', {
      name: 'Geben Sie hier zur Bestätigung den Namen des Projekts ein, das Sie löschen wollen.',
    });
    expect(textBox).toBeInTheDocument();
  });
});

describe('delete', () => {
  it('can delete project', async () => {
    const replaceStateMock = jest.fn();

    jest.mocked(useRouter).mockReturnValue({
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      push: jest.fn(),
      prefetch: jest.fn(),
      replace: replaceStateMock,
    });

    const user = userEvent.setup();

    deleteProjectMock.mockReturnValueOnce(
      Promise.resolve({
        data: {},
      }),
    );

    const component = await renderComponent();

    const textBox = component.getByRole('textbox', {
      name: 'Geben Sie hier zur Bestätigung den Namen des Projekts ein, das Sie löschen wollen.',
    });
    const deleteBtn = component.getByRole('button', { name: /Löschen/ });

    await user.type(textBox, TEST_PROJECT_NAME);
    expect(deleteBtn).not.toBeDisabled();

    await user.click(deleteBtn);

    expect(deleteProjectMock).toHaveBeenCalledWith(
      TEST_TENANT_NAME,
      TEST_PROJECT_NAME,
    );
    expect(replaceStateMock).toHaveBeenCalledWith('/settings/projects');
    expect(UdpToastMock).toHaveBeenCalledWith(
      'Projekt erfolgreich gelöscht',
      'success',
    );
    expect(successToastMock).toHaveBeenCalledTimes(1);
    expect(errorToastMock).not.toHaveBeenCalled();
  });

  it('does not redirect when error occurs', async () => {
    const replaceStateMock = jest.fn();

    jest.mocked(useRouter).mockReturnValue({
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      push: jest.fn(),
      prefetch: jest.fn(),
      replace: replaceStateMock,
    });
    const user = userEvent.setup();

    deleteProjectMock.mockReturnValueOnce(
      Promise.resolve({ errors: { general: ['Test error'] } }),
    );

    const component = await renderComponent();

    const textBox = component.getByRole('textbox', {
      name: 'Geben Sie hier zur Bestätigung den Namen des Projekts ein, das Sie löschen wollen.',
    });
    const deleteBtn = component.getByRole('button', { name: /Löschen/ });

    await user.type(textBox, TEST_PROJECT_NAME);
    expect(deleteBtn).not.toBeDisabled();

    await user.click(deleteBtn);

    expect(deleteProjectMock).toHaveBeenCalledWith(
      TEST_TENANT_NAME,
      TEST_PROJECT_NAME,
    );
    expect(replaceStateMock).not.toHaveBeenCalled();
    expect(UdpToastMock).toHaveBeenCalledWith(
      'Projekt konnte nicht gelöscht werden',
      'error',
    );
    expect(successToastMock).not.toHaveBeenCalled();
    expect(errorToastMock).toHaveBeenCalledTimes(1);
  });

  it('does not enable button with wrong input', async () => {
    const user = userEvent.setup();

    const component = await renderComponent();

    const textBox = component.getByRole('textbox', {
      name: 'Geben Sie hier zur Bestätigung den Namen des Projekts ein, das Sie löschen wollen.',
    });
    const deleteBtn = component.getByRole('button', { name: /Löschen/ });

    await user.type(textBox, TEST_PROJECT_NAME.slice(0, -1));
    expect(deleteBtn).toBeDisabled();
  });
});
