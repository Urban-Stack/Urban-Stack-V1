import React from 'react';

const LabeledComp = ({
  label,
  children,
}: {
  children: React.ReactNode;
  label?: string;
}) => {
  return (
    <div className={'block text-center'}>
      <div className={'flex justify-center'}>{children}</div>
      <span className={'text-xs text-gray-400'}>{label}</span>
    </div>
  );
};

export default LabeledComp;
