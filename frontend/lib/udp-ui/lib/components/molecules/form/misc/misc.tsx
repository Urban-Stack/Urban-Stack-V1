import React from 'react';

export const registerResetListener = (
  inputRef: React.RefObject<HTMLInputElement | null>,
  resetFunction: (event?: Event) => void,
) => {
  const form = inputRef.current?.form;
  if (!form) return;

  form.addEventListener('reset', resetFunction);
  return () => form.removeEventListener('reset', resetFunction);
};
