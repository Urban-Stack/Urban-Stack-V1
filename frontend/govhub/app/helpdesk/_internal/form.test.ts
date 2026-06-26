import { HelpDeskForm } from '@/app/helpdesk/_internal/form';
import { ZodError } from 'zod';

describe('HelpDesk schema', () => {
  const validPayload = {
    reason: 'Requesting additional access',
    description: 'Please provide additional access to the reporting tools.',
  };

  it('accepts valid payloads', () => {
    const parsed = HelpDeskForm.parse(validPayload);

    expect(parsed).toEqual(validPayload);
  });

  it('rejects reasons shorter than 3 characters', () => {
    expect(() =>
      HelpDeskForm.parse({
        ...validPayload,
        reason: 'hi',
      }),
    ).toThrow(ZodError);
  });

  it('rejects reasons longer than 128 characters', () => {
    expect(() =>
      HelpDeskForm.parse({
        ...validPayload,
        reason: 'r'.repeat(129),
      }),
    ).toThrow(ZodError);
  });

  it('rejects descriptions shorter than 20 characters', () => {
    expect(() =>
      HelpDeskForm.parse({
        ...validPayload,
        description: 'Needs more detail',
      }),
    ).toThrow(ZodError);
  });

  it('rejects descriptions longer than 1024 characters', () => {
    expect(() =>
      HelpDeskForm.parse({
        ...validPayload,
        description: 'd'.repeat(1025),
      }),
    ).toThrow(ZodError);
  });
});
