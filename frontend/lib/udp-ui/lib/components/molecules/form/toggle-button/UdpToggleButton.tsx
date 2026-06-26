import React from 'react';
import FilterButton from '@/lib/components/molecules/form/_internal/FilterButton.tsx';

export interface UdpToggleButtonProps extends Pick<
  React.ComponentPropsWithoutRef<'button'>,
  'children' | 'className'
> {
  checked?: boolean;
  onChange: (checked: boolean) => void;
}

const UdpToggleButton = ({
  checked,
  onChange,
  children,
  className,
}: UdpToggleButtonProps) => {
  const handleClick = () => {
    onChange(!checked);
  };

  return (
    <>
      <input
        className='hidden'
        checked={checked}
        type='checkbox'
        readOnly
        hidden
      />
      <FilterButton
        onClick={handleClick}
        aria-checked={checked}
        selected={checked ?? false}
        role='switch'
        className={className}
      >
        {children}
      </FilterButton>
    </>
  );
};

export default UdpToggleButton;
