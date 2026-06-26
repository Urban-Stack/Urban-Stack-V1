'use server';

import {
  FORM_NAMES,
  HelpDeskForm,
  HelpDeskState,
} from '@/app/helpdesk/_internal/form';
import { mutateCreateHelpDeskTicket } from '@/app/_lib/helpdesk/util';
import { getResultErrorMessages } from '@/app/_lib/resource-api/client/errors';

const preserveData = (formData: FormData) => ({
  reason: formData.get(FORM_NAMES.reason) as string,
  description: formData.get(FORM_NAMES.description) as string,
});

export const submitRequest = async (
  prevState: HelpDeskState,
  formData: FormData,
): Promise<HelpDeskState> => {
  const parsed = HelpDeskForm.safeParse({
    reason: formData.get(FORM_NAMES.reason),
    description: formData.get(FORM_NAMES.description),
  });
  if (!parsed.success)
    return {
      data: preserveData(formData),
      errors: parsed.error.flatten().fieldErrors,
    };

  try {
    const createHelpdeskResult = await mutateCreateHelpDeskTicket(
      parsed.data.reason,
      parsed.data.description,
    );

    const errorMessages = getResultErrorMessages(createHelpdeskResult.error);
    if (errorMessages) {
      errorMessages.forEach((message) => {
        console.error('GraphQL error:', message);
      });
      return {
        data: preserveData(formData),
        errors: { general: ['Unbekannter Fehler'] },
      };
    }

    formData.set(FORM_NAMES.reason, '');
    formData.set(FORM_NAMES.description, '');
    return { data: preserveData(formData) };
  } catch (err) {
    console.error('Network or runtime error:', err);
    return {
      data: preserveData(formData),
      errors: { general: ['Netzwerkfehler'] },
    };
  }
};
