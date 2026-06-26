import { useState } from 'react';
import { type UdpIcon } from '@/lib/components/icons';
import { twMerge } from 'tailwind-merge';

interface UdpButtonGroupDataProps {
  icon: UdpIcon;
  label: string;
  onSelect: () => void;
}

/**
 * Object for a list of button data objects for use for a `UdpButtonGroup` component.
 */
export class UdpButtonGroupDataArray {
  array: UdpButtonGroupDataProps[];

  constructor(
    data1: UdpButtonGroupDataProps,
    data2: UdpButtonGroupDataProps,
    ...dataN: UdpButtonGroupDataProps[]
  ) {
    this.array = [data1, data2, ...dataN];
  }
}

interface UdpButtonGroupProps {
  buttonsData: UdpButtonGroupDataArray;
  indexSelected?: number;
  className?: string;
}

const selectedStyle = 'selected bg-white text-primary-500';
const nonSelectedStyle = 'bg-gray-50 text-gray-400';

/**
 * Button group component.
 * <p>
 * Exactly one button of this group is selected at a time.
 * If an invalid selection index is provided, it will be auto-corrected to the closest valid value.
 *
 * @param buttonsData   list of the data objects for the individual buttons of this group (created by means of `mkButtonGroupData()`)
 * @param indexSelected index position of the initially selected button (`0` by default)
 * @param className     class name for this button group
 * @constructor
 */
const UdpButtonGroup = ({
  buttonsData,
  indexSelected = 0,
  className,
}: UdpButtonGroupProps) => {
  indexSelected = Math.min(
    Math.max(indexSelected, 0),
    buttonsData.array.length - 1,
  );
  const [selectedIndex, setSelectedIndex] = useState<number>(indexSelected);

  return (
    <div className={twMerge('flex flex-row -space-x-[1px]', className)}>
      {buttonsData.array.map((data, index) => {
        const selectionStyle =
          index === selectedIndex ? selectedStyle : nonSelectedStyle;

        const Icon = data.icon;
        return (
          <button
            title={data.label}
            key={data.label}
            className={`w-10 h-7 border border-gray-200 ${borderStyle(index, buttonsData.array.length)} ${selectionStyle} focus:z-10 focus:outline-hidden focus:ring-2 focus:ring-primary-300 hover:text-primary-500`}
            onClick={() => {
              if (selectedIndex !== index) {
                data.onSelect();
                setSelectedIndex(index);
              }
            }}
          >
            <Icon className='p-0.5 inline' />
            <span className='sr-only'>{data.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default UdpButtonGroup;

const borderStyle = (index: number, arrayLength: number) => {
  const styles = [index === arrayLength - 1 ? 'rounded-r-lg' : ''];
  if (index === 0) {
    styles.push('rounded-l-lg');
  }
  return styles.join(' ');
};
