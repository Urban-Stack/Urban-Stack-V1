import {
  RadioValueType,
  ValueBasicType,
  ValueType,
} from '@/lib/components/molecules/radio-button-group/UdpRadioButtonGroup.tsx';

export const parseValue: <V extends ValueType<ValueBasicType>>(
  value: V,
) => RadioValueType = <V,>(value: V) =>
  typeof value === 'string' || typeof value === 'number'
    ? value
    : JSON.stringify(value);
