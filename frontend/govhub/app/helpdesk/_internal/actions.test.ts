import { submitRequest } from './actions';
import { FORM_NAMES, HelpDeskState } from './form';
import { requireAuth } from '@/app/_lib/auth';
import { getPublicEnv } from '@/app/_lib/env';
import { TEST_SESSION } from '@/app/_test/utils';
import { mutateCreateHelpDeskTicket } from '@/app/_lib/helpdesk/util';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';
jest.mock('@/app/_lib/auth', () => ({
  requireAuth: jest.fn(),
}));
jest.mock('@/app/_lib/client/fetcher', () => ({
  fetcherRaw: jest.fn(),
}));
jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));
jest.mock('@/app/_lib/helpdesk/util', () => ({
  mutateCreateHelpDeskTicket: jest.fn(),
}));

const requireAuthMock = requireAuth as jest.MockedFunction<typeof requireAuth>;
const getPublicEnvMock = getPublicEnv as jest.MockedFunction<
  typeof getPublicEnv
>;

const mutateCreateHelpDeskTicketMock =
  mutateCreateHelpDeskTicket as jest.MockedFunction<
    typeof mutateCreateHelpDeskTicket
  >;

const mkFormData = (reason: string, description: string): FormData => {
  const formData = new FormData();
  formData.append(FORM_NAMES.reason, reason);
  formData.append(FORM_NAMES.description, description);
  return formData;
};

describe('submitRequest', () => {
  beforeEach(() => {
    requireAuthMock.mockReset();
    mutateCreateHelpDeskTicketMock.mockReset();
    getPublicEnvMock.mockReset();

    requireAuthMock.mockResolvedValue(TEST_SESSION);
    getPublicEnvMock.mockReturnValue('https://helpdesk.test');
  });

  it('returns validation errors and preserves form data when parsing fails', async () => {
    const formData = mkFormData('ab', 'too short');

    const state = await submitRequest({}, formData);

    expect(state).toEqual({
      data: { reason: 'ab', description: 'too short' },
      errors: {
        reason: expect.arrayOf(expect.any(String)),
        description: expect.arrayOf(expect.any(String)),
      },
    });
  });

  it('submits request payload and returns success state when API responds ok', async () => {
    const formData = mkFormData(
      'Valid subject',
      'Detailed description exceeding limit',
    );
    mutateCreateHelpDeskTicketMock.mockResolvedValue({
      data: {
        helpdesk: true,
      },
    });

    const state = await submitRequest({} as HelpDeskState, formData);
    expect(state).toEqual({ data: { description: '', reason: '' } });
    expect(mutateCreateHelpDeskTicketMock).toHaveBeenCalledTimes(1);
  });
  it('returns network error on http failure', async () => {
    mutateCreateHelpDeskTicketMock.mockRejectedValue('failure');
    const formData = mkFormData(
      'Valid Subject',
      'Detailed description exceeding limit',
    );
    const state = await submitRequest({} as HelpDeskState, formData);

    expect(state).toEqual({
      data: {
        reason: 'Valid Subject',
        description: 'Detailed description exceeding limit',
      },
      errors: { general: ['Netzwerkfehler'] },
    });
  });
  it('keeps state fields and return error state after failed request ', async () => {
    const formData = mkFormData('AB', '123');
    mutateCreateHelpDeskTicketMock.mockResolvedValue({
      error: mkCombinedGraphQLError(
        'Exception while fetching data (/helpdesk) : bad request',
      ),
      data: undefined,
    });
    const state = await submitRequest({} as HelpDeskState, formData);

    expect(state).toEqual({
      data: { reason: 'AB', description: '123' },
      errors: {
        reason: ['Der Betreff muss mindestens 3 Zeichen beinhalten'],
        description: ['Die Beschreibung muss mindestens 20 Zeichen beinhalten'],
      },
    });
  });
});
