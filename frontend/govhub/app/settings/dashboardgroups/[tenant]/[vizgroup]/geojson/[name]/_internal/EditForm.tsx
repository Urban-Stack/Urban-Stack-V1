'use client';

import Form from 'next/form';
import React, { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cond, flow } from 'lodash';
import Link from 'next/link';
import { Label } from 'flowbite-react';
import {
  IcDownload,
  UdpButton,
  UdpTextArea,
  UdpTextInput,
  UdpToast,
} from 'udp-ui/components';
import {
  FORM_NAMES,
  NEW_STRING,
  PublishedQueryState,
} from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/geojson/[name]/_internal/form';
import {
  createPublishedQuery,
  updatePublishedQuery,
} from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/geojson/[name]/_internal/action';
import { useSqlQuery } from '@/app/_lib/superset/iframe-communication/useSqlQuery';

type CreateFormProps = {
  tenant: string;
  vizgroup: string;
  queryName: string;
  initialState: PublishedQueryState;
  supersetUri: string;
};

/* c8 ignore start */
const EditForm = (props: CreateFormProps) => {
  const { tenant, vizgroup, queryName, initialState } = props;

  const [createState, createFormAction, createIsLoading] = useActionState(
    createPublishedQuery.bind(null, tenant, vizgroup),
    { isInitial: true },
  );

  const [updateState, updateFormAction, updateIsLoading] = useActionState(
    updatePublishedQuery.bind(null, tenant, vizgroup, queryName),
    { ...initialState, isInitial: true },
  );

  const isNew = queryName === NEW_STRING;

  return (
    <Form action={isNew ? createFormAction : updateFormAction}>
      <FormContent
        {...props}
        isNew={isNew}
        isLoading={isNew ? createIsLoading : updateIsLoading}
        state={isNew ? createState : updateState}
      />
    </Form>
  );
};
/* c8 ignore end */

type FormContentProps = {
  tenant: string;
  vizgroup: string;
  isNew?: boolean;
  isLoading?: boolean;
  state: PublishedQueryState;
  supersetUri: string;
};

const FormContent = ({
  tenant,
  vizgroup,
  isNew,
  isLoading,
  state,
  supersetUri,
}: FormContentProps) => {
  const router = useRouter();
  const { sqlQuery } = useSqlQuery(supersetUri);

  useEffect(() => {
    if (state.isInitial) return;

    const errorToast = UdpToast(
      `Query konnte nicht gespeichert werden.\n${state.errors?.general?.join('\n')}`,
      'error',
    );
    const successToast = UdpToast(
      isNew ? 'Query erfolgreich erstellt.' : 'Query erfolgreich gespeichert.',
      'success',
    );
    const success = flow([
      successToast,
      () =>
        router.push(`/settings/dashboardgroups/${tenant}/${vizgroup}/geojson`),
    ]);

    cond([
      [() => !!state.errors?.general, errorToast],
      [() => !!state.data && !state.errors, success],
    ])();
  }, [state, router, tenant, vizgroup, isNew]);

  return (
    <div>
      <div className='flex justify-between mb-4'>
        <h3 className='font-bold'>
          {isNew ? 'Neue Query erstellen' : 'Query bearbeiten'}
        </h3>
        <div className='flex gap-3.5'>
          <UdpButton
            color='tertiary'
            linkAs={Link}
            href={`/settings/dashboardgroups/${tenant}/${vizgroup}/geojson`}
          >
            Abbrechen
          </UdpButton>
          <UdpButton icon={IcDownload} type='submit' loading={isLoading}>
            Speichern
          </UdpButton>
        </div>
      </div>
      <div className='flex flex-col gap-6'>
        <div className='max-w-[556px] flex flex-col gap-6'>
          <div>
            <Label htmlFor={FORM_NAMES.name} className='block mb-2'>
              Name der Query
            </Label>
            <UdpTextInput
              id={FORM_NAMES.name}
              name={FORM_NAMES.name}
              required
              disabled={!isNew}
              errors={state.errors?.name}
              defaultValue={state.data?.name}
            />
          </div>
          <div>
            <Label htmlFor={FORM_NAMES.sql} className='block mb-2'>
              SQL Query
            </Label>
            <UdpTextArea
              id={FORM_NAMES.sql}
              name={FORM_NAMES.sql}
              rows={4}
              placeholder='Nutzen Sie das Superset SQL Lab um die Query zu erstellen.'
              required
              errors={state.errors?.sql}
              value={sqlQuery}
              defaultValue={state.data?.sql}
              readOnly
            />
          </div>
        </div>
        <div>
          <p className='mb-2 text-sm font-medium'>Query Editor</p>
          <p className='mb-2 text-sm'>
            Erstellen Sie Ihre Query im Superset SQL Lab und klicken Sie auf{' '}
            <span className='font-mono'>Veröffentlichen</span>.
          </p>
          <iframe
            title='Superset SQL Lab'
            className={'size-full rounded-xl min-h-[60rem]'}
            src={`${supersetUri}/sqllab/?dbname=clickhouse&sql=${encodeURIComponent(state.data?.sql ?? 'SELECT ...')}`}
          />
        </div>
      </div>
    </div>
  );
};

export const _internal = {
  FormContent,
};

export default EditForm;
