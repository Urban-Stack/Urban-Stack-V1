import { graphql } from '@/app/__generated__';
import { mutate } from '@/app/_lib/resource-api/client';
export const mkHelpdeskRedirectHref: (error: string) => string = (error) =>
  `/helpdesk?${new URLSearchParams([['error', error]])}`;

export const MUTATE_HELPDESK_TICKET = graphql(`
  mutation MutateHelpdeskTicket($title: String!, $description: String!) {
    helpdesk(title: $title, description: $description)
  }
`);

export const mutateCreateHelpDeskTicket = async (
  newTitle: string,
  newDescription: string,
) =>
  mutate({
    mutation: MUTATE_HELPDESK_TICKET,
    variables: {
      title: newTitle,
      description: newDescription,
    },
  });
