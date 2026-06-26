import React from 'react';
import LabeledComp from '@/.storybook/util/LabeledComp';

type LabeledCompType<C extends React.FC> = {
  Component: C;
  label?: string;
};

/**
 * Render function for providing components with individual labels.
 *
 * @param comps labeled components to render
 */
export const renderLabeledComps =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <F extends React.FC<any>>(comps: LabeledCompType<F>[]) =>
    (args: React.ComponentProps<F>) => (
      <div className={'flex space-x-5'}>
        {comps.map(({ Component, label }) => {
          return (
            <LabeledComp key={label} label={label}>
              <Component {...args} />
            </LabeledComp>
          );
        })}
      </div>
    );
