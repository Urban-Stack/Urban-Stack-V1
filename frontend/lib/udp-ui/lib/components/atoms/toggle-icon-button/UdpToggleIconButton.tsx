import React from 'react';
import { twMerge } from 'tailwind-merge';
import { UdpIcon } from '@/lib/components/icons';

export interface UdpToggleIconButtonProps {
  outlineIcon: UdpIcon;
  active?: boolean;
  onChange?: React.ChangeEventHandler<HTMLElement>;
  className?: string;
}

/**
 * Toggle button comprising an icon.
 * <p>
 * When active, the given icon will be filled using its `fill` SVG property.
 *
 * @param outlineIcon type or component of this button's icon (needs to be an outline icon)
 * @param active      `true` for this button to be active, or
 *                    `false` for this button to be inactive, or
 *                    `undefined` in order to let this button handle its activation itself (starting from an inactive state)
 * @param onChange    callback function invoked on any change of this button's state
 * @param className   class name for this button
 * @param restProps   additional properties for this button
 * @constructor
 */
const UdpToggleIconButton = ({
  outlineIcon: Icon,
  active,
  onChange,
  className,
  ...restProps
}: UdpToggleIconButtonProps) => (
  <label
    className={twMerge(
      'group inline-flex rounded text-primary-500 cursor-pointer',
      className,
    )}
    {...restProps}
  >
    <input
      type={'checkbox'}
      className={'sr-only peer'}
      checked={active}
      onChange={onChange}
      tabIndex={-1}
    />
    <Icon
      className={
        'text-gray-500 group-hover:text-current peer-checked:text-current peer-checked:[&_path]:fill-current'
      }
    />
  </label>
);

export default UdpToggleIconButton;
