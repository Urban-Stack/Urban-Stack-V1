export const unsafeParseFloat: (str: string) => number = (str) => {
  const mFloat = parseFloat(str);
  if (isNaN(mFloat)) throw new Error(`Failed to parse Float: ${str}. NaN.`);
  else return mFloat;
};

export const unsafeParseInt: (str: string, radix?: number) => number = (
  str,
  radix = 10,
) => {
  const mInt = parseInt(str, radix);
  if (isNaN(mInt)) throw new Error(`Failed to parse Int: ${str}. NaN.`);
  else return mInt;
};
