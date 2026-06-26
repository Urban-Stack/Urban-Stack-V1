import { Checkbox, Dropdown, DropdownProps, Label } from 'flowbite-react';
import { UdpButton } from '@/lib/components';
import { FormEventHandler, useState } from 'react';
import FilterButton from '@/lib/components/molecules/form/_internal/FilterButton.tsx';

export interface UdpFilterOption {
  id: string;
  label: string;
  checked?: boolean;
}

export interface UdpFilterButtonProps extends Pick<DropdownProps, 'placement'> {
  options: UdpFilterOption[];
  onChange: (options: UdpFilterOption[]) => void;
  label: string;
}

const UdpFilterButton = ({
  options: initialOptions,
  onChange,
  label,
  ...props
}: UdpFilterButtonProps) => {
  const [prevInitialOptions, setPrevInitialOptions] = useState(initialOptions);
  const [options, setOptions] = useState(initialOptions);
  if (prevInitialOptions !== initialOptions) {
    setPrevInitialOptions(initialOptions);
    setOptions(initialOptions);
  }
  const anySelected = options.some((o) => o.checked);

  const toggle = (id: string) =>
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, checked: !o.checked } : o)),
    );

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    onChange(options);
  };

  const onReset: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const cleared = options.map((o) => ({ ...o, checked: false }));
    setOptions(cleared);
    onChange(cleared);
  };

  return (
    <Dropdown
      label={label}
      arrowIcon={false}
      renderTrigger={() => (
        <FilterButton selected={anySelected}>{label}</FilterButton>
      )}
      className='rounded-2xl'
      {...props}
    >
      <form
        onSubmit={onSubmit}
        onReset={onReset}
        className='py-8 px-6 flex flex-col gap-6 w-80 sm:w-96 udp-scroll-thin'
      >
        <div
          className='flex flex-col gap-2 max-h-40 overflow-y-auto p-2'
          tabIndex={-1}
        >
          {options.map(({ id, label, checked }) => (
            <div key={id} className='flex items-center [&>*]:cursor-pointer'>
              <Checkbox
                id={id}
                name={id}
                checked={checked}
                onChange={() => toggle(id)}
                className='shrink-0'
              />
              <Label htmlFor={id} className='pl-2 text-gray-800 truncate'>
                {label}
              </Label>
            </div>
          ))}
        </div>
        <div className='flex items-center justify-between gap-8 px-2'>
          <UdpButton type='submit' color={'secondary'}>
            Anwenden
          </UdpButton>
          <UdpButton type='reset' color={'tertiary'}>
            Auswahl aufheben
          </UdpButton>
        </div>
      </form>
    </Dropdown>
  );
};

export default UdpFilterButton;
