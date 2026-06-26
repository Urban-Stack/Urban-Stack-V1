import React, { RefObject, useActionState } from 'react';
import { HelperText, Label, Select } from 'flowbite-react';
import {
  UdpButton,
  UdpClientModalContentProps,
  UdpTextInput,
} from 'udp-ui/components';
import Form from 'next/form';
import { createDashboard } from '@/app/_lib/superset/actions';
import { CreateDashboardState, FORM_NAMES } from '@/app/_lib/superset/types';
import { VizGroup } from '@/app/_lib/resource-api/viz-groups/vizGroups';
import { capitalize } from 'udp-ui/string';

type CreateDashboardFormProps = {
  vizGroups: VizGroup[];
} & UdpClientModalContentProps;

/* c8 ignore start */
const CreateDashboardForm = ({
  vizGroups,
  initialFocusRef,
  closeModal,
}: CreateDashboardFormProps) => {
  const [state, formAction, isLoading] = useActionState(createDashboard, {});

  return (
    <Form action={formAction}>
      <FormContent
        vizGroups={vizGroups}
        isLoading={isLoading}
        errors={state.errors}
        initialFocusRef={initialFocusRef}
        closeModal={closeModal}
      />
    </Form>
  );
};

export default CreateDashboardForm;
/* c8 ignore stop */

type FormContentProps = CreateDashboardFormProps &
  Pick<CreateDashboardState, 'errors'> & { isLoading: boolean };

const FormContent = ({
  vizGroups,
  isLoading,
  errors,
  initialFocusRef,
  closeModal,
}: FormContentProps) => (
  <div className='flex flex-col gap-6'>
    <div className='flex flex-col gap-4'>
      <NameInput initialFocusRef={initialFocusRef} errors={errors?.title} />
      <VizGroupSelect errors={errors?.vizGroup} vizGroups={vizGroups} />
    </div>
    <ButtonGroup isLoading={isLoading} closeModal={closeModal} />
  </div>
);

type NameInputProps = Pick<UdpClientModalContentProps, 'initialFocusRef'> & {
  errors?: string[];
};

const NameInput = ({ initialFocusRef, errors }: NameInputProps) => (
  <div className='flex flex-col gap-1'>
    <Label htmlFor={FORM_NAMES.dashboardTitle}>Dashboard-Name</Label>
    <UdpTextInput
      id={FORM_NAMES.dashboardTitle}
      name={FORM_NAMES.dashboardTitle}
      type='text'
      placeholder='Unbenanntes Dashboard'
      ref={initialFocusRef as RefObject<HTMLInputElement>}
      required
      errors={errors}
    />
  </div>
);

type VizGroupSelectProps = Pick<CreateDashboardFormProps, 'vizGroups'> & {
  errors?: string[];
};

const VizGroupSelect = ({ vizGroups, errors }: VizGroupSelectProps) => (
  <div className='flex flex-col gap-1'>
    <Label htmlFor={FORM_NAMES.vizGroup}>Dashboardgruppe</Label>
    <Select
      id={FORM_NAMES.vizGroup}
      name={FORM_NAMES.vizGroup}
      required
      color={errors ? 'failure' : 'gray'}
    >
      {errors && (
        <HelperText color='failure'>
          {errors.map((error) => (
            <span key={error}>
              {error}
              <br />
            </span>
          ))}
        </HelperText>
      )}
      {vizGroups.map((vg) => (
        <option key={`${vg.name}-${vg.tenant}`} value={JSON.stringify(vg)}>
          {`${capitalize(vg.name)} (${vg.tenant})`}
        </option>
      ))}
    </Select>
  </div>
);

type ButtonGroupProps = Pick<UdpClientModalContentProps, 'closeModal'> & {
  isLoading: boolean;
};

const ButtonGroup = ({ isLoading, closeModal }: ButtonGroupProps) => (
  <div className='flex gap-3.5 flex-wrap w-fit [&>*]:grow [&>*]:justify-center'>
    <UdpButton type='submit' loading={isLoading}>
      Dashboard erstellen
    </UdpButton>
    <UdpButton color='tertiary' onClick={closeModal}>
      Abbrechen
    </UdpButton>
  </div>
);

export const _internal = {
  FormContent,
};
