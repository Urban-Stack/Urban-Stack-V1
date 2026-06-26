import React, { RefObject } from 'react';
import { twMerge } from 'tailwind-merge';

export interface FilterButtonProps extends Partial<
  Pick<
    React.ComponentPropsWithoutRef<'button'>,
    'className' | 'children' | 'onClick' | 'role' | 'aria-checked' | 'disabled'
  >
> {
  selected: boolean;
  disabled?: boolean;
  ref?: RefObject<HTMLElement>;
}

const defaultClass: string =
  'flex p-2.5 font-400 text-gray-800 rounded-lg focus:outline-hidden cursor-pointer disabled:cursor-not-allowed ring-1 ring-gray-200';
const selectedClass: string = 'bg-primary-700 ring-0 text-white';
const unselectedClass: string =
  'focus:ring-3 focus:ring-primary-200 focus:bg-primary-100 hover:bg-primary-100';
const disabledClass: string = 'ring-gray-100 text-gray-100';

const FilterButton = ({
  children,
  onClick,
  selected,
  disabled = false,
  className,
  ref,
  ...restProps
}: FilterButtonProps) => {
  const finalProps = {
    className: twMerge(
      defaultClass,
      className,
      disabled ? disabledClass : selected ? selectedClass : unselectedClass,
    ),
    ...restProps,
    disabled: disabled,
  };

  return (
    <button
      onClick={onClick}
      ref={ref as RefObject<HTMLButtonElement>}
      {...finalProps}
    >
      {children}
    </button>
  );
};

export default FilterButton;
