import { internal } from '@/app/citytools/shared-app/[tenant]/[name]/EditForm';
import { render } from '@testing-library/react';
import { UdpToast } from 'udp-ui/components';
import { useRouter } from 'next/navigation';
import { createSharedApp } from '@/app/citytools/shared-app/[tenant]/[name]/actions';

const { FormHeader, FormInputs } = internal;

const useRouterMock = useRouter as unknown as jest.Mock;
const createSharedAppMock = createSharedApp as unknown as jest.Mock;
const UdpToastMock = UdpToast as unknown as jest.Mock;

const successToastMock = jest.fn();
const errorToastMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/app/citytools/shared-app/[tenant]/[name]/actions', () => ({
  createSharedApp: jest.fn(),
}));

jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpToast: jest.fn(),
}));

const routerPushMock = jest.fn();

beforeAll(() => {
  useRouterMock.mockReturnValue({ push: routerPushMock });
});

beforeEach(() => {
  routerPushMock.mockReset();
  createSharedAppMock.mockReset();
  successToastMock.mockReset();
  errorToastMock.mockReset();
  UdpToastMock.mockReset().mockImplementation((_, type) =>
    type === 'error' ? errorToastMock : successToastMock,
  );
});

describe('FormHeader', () => {
  it('renders controls', () => {
    const component = render(<FormHeader isNew={true} isLoading={false} />);
    expect(component.getByRole('button', { name: /Abbrechen/ })).toBeVisible();
    expect(component.getByRole('button', { name: /Speichern/ })).toBeVisible();
  });

  it('renders correct title for new shared app', () => {
    const component = render(<FormHeader isNew={true} isLoading={false} />);
    expect(component.getByText('Neues City Tool erstellen')).toBeVisible();
  });

  it('renders correct title for existing shared app', () => {
    const component = render(<FormHeader isNew={false} isLoading={false} />);
    expect(component.getByText('City Tool bearbeiten')).toBeVisible();
  });
});

describe('FormInputs', () => {
  it('renders all required inputs and labels', () => {
    const component = render(<FormInputs name={'new'} state={{}} />);
    expect(component.getByLabelText('Name*')).toBeVisible();
    expect(
      component.getByLabelText('Beschreibung* (max. 255 Zeichen)'),
    ).toBeVisible();
    expect(component.getByLabelText('Kontakt*')).toBeVisible();
    expect(component.getByLabelText('City Tool Bild')).toBeVisible();
    expect(component.getByLabelText('Image Registry*')).toBeVisible();
    expect(component.getByLabelText('Image Repository*')).toBeVisible();
    expect(component.getByLabelText('Image Digest*')).toBeVisible();
    expect(component.getByLabelText('Username')).toBeVisible();
    expect(component.getByLabelText('Password')).toBeVisible();
  });

  it('displays field error messages', () => {
    const errors = {
      displayName: ['name error 1', 'name error 2'],
      description: ['description error'],
      contact: ['contact error'],
      pictureUri: ['picture error'],
      imageDigest: ['digest error'],
      imageRepository: ['repository error'],
      imageRegistry: ['registry error'],
      username: ['username error'],
      password: ['password error'],
    };

    const component = render(<FormInputs name={'edit'} state={{ errors }} />);

    Object.values(errors).forEach((arr) => {
      arr.forEach((msg) => {
        expect(component.getByText(msg)).toBeVisible();
      });
    });
  });

  it('prefills inputs from state data', () => {
    const state = {
      data: {
        displayName: 'Tool X',
        description: 'Desc',
        pictureUri: 'https://pictures.com/pictures/picture.jpg',
        contact: 'admin@example.com',
        config: {
          imageDigest: 'sha256:abcdef'.padEnd(71, '0'),
          imageRepository: 'org/repo',
          imageRegistry: 'ghcr.io',
          username: 'user1',
        },
      },
    };

    const { getByLabelText } = render(
      <FormInputs name={'edit'} state={state} />,
    );

    expect(getByLabelText('Name*')).toHaveValue('Tool X');
    expect(getByLabelText('Beschreibung* (max. 255 Zeichen)')).toHaveValue(
      'Desc',
    );
    expect(getByLabelText('Kontakt*')).toHaveValue('admin@example.com');
    expect(getByLabelText('City Tool Bild')).toHaveValue(
      'https://pictures.com/pictures/picture.jpg',
    );
    expect(getByLabelText('Image Registry*')).toHaveValue('ghcr.io');
    expect(getByLabelText('Image Repository*')).toHaveValue('org/repo');
    expect(getByLabelText('Image Digest*')).toHaveValue(
      state.data.config.imageDigest,
    );
    expect(getByLabelText('Username')).toHaveValue('user1');
  });

  describe('error toast', () => {
    it('shows error toast for general errors on new city tool', () => {
      render(
        <FormInputs
          name='new'
          state={{
            errors: { general: ['general error 1', 'general error 2'] },
          }}
        />,
      );

      expect(UdpToastMock).toHaveBeenCalledWith(
        'City Tool konnte nicht erstellt werden.\ngeneral error 1\ngeneral error 2',
        'error',
      );
      expect(errorToastMock).toHaveBeenCalledTimes(1);
      expect(successToastMock).not.toHaveBeenCalled();
      expect(routerPushMock).not.toHaveBeenCalled();
    });

    it('shows error toast for empty general errors', () => {
      render(<FormInputs name={'new'} state={{ errors: { general: [] } }} />);

      expect(UdpToastMock).toHaveBeenCalledWith(
        'City Tool konnte nicht erstellt werden.\n',
        'error',
      );
      expect(errorToastMock).toHaveBeenCalledTimes(1);
      expect(successToastMock).not.toHaveBeenCalled();
      expect(routerPushMock).not.toHaveBeenCalled();
    });

    it('shows correct error toast message for existing city tool', () => {
      render(
        <FormInputs
          name='existingApp'
          state={{
            errors: { general: ['general error 1', 'general error 2'] },
          }}
        />,
      );

      expect(UdpToastMock).toHaveBeenCalledWith(
        'City Tool konnte nicht geupdated werden.\ngeneral error 1\ngeneral error 2',
        'error',
      );
      expect(errorToastMock).toHaveBeenCalledTimes(1);
      expect(successToastMock).not.toHaveBeenCalled();
      expect(routerPushMock).not.toHaveBeenCalled();
    });
  });

  it('shows success toast and redirects on success', () => {
    render(
      <FormInputs
        name={'new'}
        state={{
          data: {
            displayName: 'x',
            description: 'd',
            pictureUri: 'e',
            contact: 'c',
            config: {},
          },
        }}
      />,
    );

    expect(UdpToastMock).toHaveBeenCalledWith(
      'City Tool erfolgreich erstellt',
      'success',
    );
    expect(successToastMock).toHaveBeenCalledTimes(1);
    expect(errorToastMock).not.toHaveBeenCalled();
    expect(routerPushMock).toHaveBeenCalledWith('/citytools');
  });

  it('does nothing when isInitial is true', () => {
    render(
      <FormInputs
        name={'new'}
        state={{
          data: {
            displayName: 'x',
            description: 'd',
            pictureUri: 'e',
            contact: 'c',
            config: {},
          },
          isInitial: true,
        }}
      />,
    );

    expect(UdpToastMock).not.toHaveBeenCalled();
    expect(routerPushMock).not.toHaveBeenCalled();
  });
});
