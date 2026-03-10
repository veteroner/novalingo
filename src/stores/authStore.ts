/**
 * Auth Store
 *
 * Kimlik doğrulama durumu yönetimi.
 */

import { create } from 'zustand';
import { type User as FirebaseUser } from 'firebase/auth';
import { type User } from '@/types/user';

interface AuthState {
  // State
  firebaseUser: FirebaseUser | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  firebaseUser: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,

  setFirebaseUser: (firebaseUser) =>
    { set({
      firebaseUser,
      isAuthenticated: !!firebaseUser,
      isLoading: false,
    }); },

  setUser: (user) => { set({ user }); },

  setLoading: (isLoading) => { set({ isLoading }); },

  setError: (error) => { set({ error, isLoading: false }); },

  reset: () => { set(initialState); },
}));
