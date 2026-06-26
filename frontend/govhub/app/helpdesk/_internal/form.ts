import { ActionState } from '@/app/_lib/form/actionstate';
import z from 'zod';

export const FORM_NAMES = {
  reason: 'helpdesk-reason',
  description: 'helpdesk-description',
} as const;

export const HelpDeskForm = z.object({
  reason: z
    .string()
    .min(3, 'Der Betreff muss mindestens 3 Zeichen beinhalten')
    .max(128, 'Der Betreff darf maximal 128 Zeichen beinhalten'),
  description: z
    .string()
    .min(20, 'Die Beschreibung muss mindestens 20 Zeichen beinhalten')
    .max(1024, 'Die Beschreibung darf maximal 1024 Zeichen beinhalten'),
});

export type HelpDeskState = ActionState & {
  readonly data?: {
    readonly reason?: string;
    readonly description?: string;
  };
  readonly errors?: {
    readonly general?: string[];
    readonly reason?: string[];
    readonly description?: string[];
  };
};
