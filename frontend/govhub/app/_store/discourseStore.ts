import { create } from 'zustand/index';

interface DiscourseState {
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
}

export const useDiscourseStore = create<DiscourseState>((set) => ({
  isLoggedIn: false,
  setIsLoggedIn: (v: boolean) => set(() => ({ isLoggedIn: v })),
}));
