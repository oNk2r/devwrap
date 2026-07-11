import { create } from 'zustand';
import type { DevWrapResult } from '../types/github';

interface ProfileState {
  username: string | null;
  profileData: DevWrapResult | null;
  loading: boolean;
  error: string | null;
  logs: string[];
  setUsername: (username: string | null) => void;
  setProfileData: (data: DevWrapResult | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  addLog: (log: string) => void;
  clearLogs: () => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  username: null,
  profileData: null,
  loading: false,
  error: null,
  logs: [],
  setUsername: (username) => set({ username }),
  setProfileData: (profileData) => set({ profileData }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  clearLogs: () => set({ logs: [] }),
  reset: () => set({ username: null, profileData: null, loading: false, error: null, logs: [] }),
}));
export default useProfileStore;
