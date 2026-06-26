import { Id, toast, ToastOptions } from 'react-toastify';

export const UdpToastType = ['success', 'error'] as const;
export type UdpToastType = (typeof UdpToastType)[number];
const toastTypes = {
  success: toast.success,
  error: toast.error,
} as const;

/**
 * Toast.
 * <p>
 * This will construct a function that on invocation emits the rendering of a toast.\
 * Note: Toasts require a `ToastContainer` already rendered.
 *
 * @param message message to show by means of the toast
 * @param type    type of the toast
 * @param options additional options for the toast
 * @constructor
 */
const UdpToast: (
  message: string,
  type: UdpToastType,
  options?: ToastOptions,
) => () => Id = (message, type, options) => () =>
  toastTypes[type](message, options);

export default UdpToast;
