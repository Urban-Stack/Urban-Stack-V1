import React, { ComponentPropsWithRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { Label, Radio, RadioProps } from 'flowbite-react';
import { UdpRadioButtonGroupTestIds as TestIds } from '@/lib/components/molecules/radio-button-group/testIds.ts';
import { parseValue } from '@/lib/components/molecules/radio-button-group/_internal/util.tsx';

export type RadioValueType = string | number;
export type ValueBasicType = RadioValueType | boolean | object;
export type ValueType<T extends ValueBasicType> = T | Array<T>;

type RadioButtonProps = RadioProps & ComponentPropsWithRef<'input'>;

type UdpRadioButtonGroupProps<
  L extends string,
  V extends ValueType<ValueBasicType>,
> = {
  groupName: string;
  optionsData: Record<L, V>;
  labelChecked?: L;
  errors?: string[];
  className?: string;
  ref?: RadioButtonProps['ref'];
};

/**
 * Radio button group component.
 * <p>
 * This component comprises a list of related radio buttons
 * and accepts optional error messages to be displayed below the list.
 * <p>
 * The given `optionsData` provide the button labels through their keys,
 * as well as the corresponding option values that are considered to be the user input.
 *
 * @param groupName    name of this radio button group
 * @param optionsData  record of the labels and values for the individual radio buttons of this group
 * @param labelChecked label of the radio button initially selected, or
 *                     `undefined` in order to not specify any pre-selection
 * @param errors       list of error messages to show below the radio buttons of this group
 * @param className    class name for this radio button group
 * @param ref          reference for the checked radio button of this group
 * @param restProps    additional properties for this radio button group
 * @constructor
 */
const UdpRadioButtonGroup = <
  L extends string,
  V extends ValueType<ValueBasicType>,
>({
  groupName,
  optionsData,
  labelChecked,
  errors,
  className,
  ref,
  ...restProps
}: UdpRadioButtonGroupProps<L, V>) => (
  <fieldset
    className={twMerge('flex flex-col gap-4', className)}
    {...restProps}
  >
    {Object.entries(optionsData).map(([label, value], idx) => {
      const isChecked = label === labelChecked;
      return (
        <RadioButton
          key={idx}
          name={groupName}
          value={parseValue(value as V)}
          defaultChecked={isChecked}
          ref={isChecked ? ref : undefined}
        >
          {label}
        </RadioButton>
      );
    })}
    {errors && <ErrorContainer errors={errors} />}
  </fieldset>
);

export default UdpRadioButtonGroup;

const RadioButton = ({
  name,
  value,
  defaultChecked,
  children,
  ref,
}: RadioButtonProps) => {
  const id = name + '_' + value;
  return (
    <div
      className={'flex items-center [&>*]:cursor-pointer'}
      data-testid={TestIds.option}
    >
      <Radio
        id={id}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        ref={ref}
      />
      <Label htmlFor={id} className={'pl-2 line-clamp-1'}>
        {children}
      </Label>
    </div>
  );
};

const ErrorContainer = ({ errors }: { errors: string[] }) => (
  <div className='text-red-700 text-sm'>
    {errors.map((msg, idx) => (
      <span key={idx}>
        {msg}
        <br />
      </span>
    ))}
  </div>
);
