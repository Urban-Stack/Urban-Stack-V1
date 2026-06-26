import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import UdpToast, {
  UdpToastType,
} from '@/lib/components/atoms/toast/UdpToast.ts';
import { Id, ToastContainer } from 'react-toastify';

const TEST_MESSAGE = 'test toast message';

const renderWithToast = (toastFunc: () => Id) =>
  render(
    <>
      <ToastContainer />
      {toastFunc()}
    </>,
  );

describe('snapshot', () => {
  it.each(UdpToastType)('matches snapshot for type `%s`', async (type) => {
    const toast = UdpToast(TEST_MESSAGE, type);
    const component = renderWithToast(toast);

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot for additional options', async () => {
    const toast = UdpToast(TEST_MESSAGE, 'success', {
      className: 'udp-test-class',
    });
    const component = renderWithToast(toast);

    expect(component).toMatchSnapshot();
  });
});

describe('message', () => {
  it('shows toast with given message', async () => {
    const toast = UdpToast(TEST_MESSAGE, 'success');

    renderWithToast(toast);

    expect(await screen.findByText(TEST_MESSAGE)).toBeVisible();
  });
});
