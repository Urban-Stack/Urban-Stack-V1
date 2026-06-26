import { create } from 'zustand';
import {
  getLocalStorage,
  setLocalStorage,
} from '@/app/_lib/client/localStorage';

interface SidebarState {
  isOpen: boolean;
  init: () => void;
  toggle: () => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  isOpen: false,
  init: () => {
    set(() => ({ isOpen: getLocalStorage('UCH_SIDEBAR_OPEN') === 'true' }));
  },
  toggle: () => {
    setLocalStorage('UCH_SIDEBAR_OPEN', String(!get().isOpen));
    set((state) => ({ isOpen: !state.isOpen }));
  },
}));
