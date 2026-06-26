import { useDiscourseStore } from '@/app/_store/discourseStore';

describe('discourseStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useDiscourseStore.setState({ isLoggedIn: false });
  });

  it('defaults login state to false', () => {
    const { isLoggedIn } = useDiscourseStore.getState();
    expect(isLoggedIn).toBe(false);
  });

  it('can set login state to true', () => {
    useDiscourseStore.getState().setIsLoggedIn(true);
    const { isLoggedIn } = useDiscourseStore.getState();
    expect(isLoggedIn).toBe(true);
  });

  it('setIsLoggedIn sets isLoggedIn to false', () => {
    useDiscourseStore.getState().setIsLoggedIn(true);
    useDiscourseStore.getState().setIsLoggedIn(false);
    const { isLoggedIn } = useDiscourseStore.getState();
    expect(isLoggedIn).toBe(false);
  });
});
