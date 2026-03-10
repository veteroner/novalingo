/**
 * UI Store
 *
 * Uygulama genelindeki UI durumu — modal, toast, loading, navigation.
 */

import { create } from 'zustand';

// ===== TOAST =====
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'achievement' | 'levelUp';
  title: string;
  message?: string;
  duration?: number;
  icon?: string;
}

// ===== TAB =====
export type TabType = 'home' | 'learn' | 'quests' | 'profile';

// ===== MODAL =====
export type ModalType =
  | 'achievement'
  | 'levelUp'
  | 'streakLost'
  | 'dailyWheel'
  | 'novaEvolution'
  | 'collectible'
  | 'parentGate'
  | 'settings'
  | 'confirmation'
  | null;

interface UIState {
  // Modal
  activeModal: ModalType;
  modalData: Record<string, unknown> | null;

  // Toast
  toasts: Toast[];

  // Loading
  isGlobalLoading: boolean;
  loadingMessage: string | null;

  // Navigation
  activeTab: TabType;

  // Actions
  openModal: (type: ModalType, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
  setActiveTab: (tab: UIState['activeTab']) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeModal: null,
  modalData: null,
  toasts: [],
  isGlobalLoading: false,
  loadingMessage: null,
  activeTab: 'home',

  openModal: (activeModal, modalData) =>
    { set({ activeModal, modalData: modalData ?? null }); },

  closeModal: () => { set({ activeModal: null, modalData: null }); },

  showToast: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    // Auto-remove
    const duration = toast.duration ?? 3000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  removeToast: (id) =>
    { set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })); },

  setGlobalLoading: (isGlobalLoading, loadingMessage) =>
    { set({ isGlobalLoading, loadingMessage: loadingMessage ?? null }); },

  setActiveTab: (activeTab) => { set({ activeTab }); },
}));
