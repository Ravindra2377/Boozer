import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  calculatedAge: number;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  documentType: string;
  maskedDocNumber: string;
  deliveryAddress: string;
  activeRideCredit: number;
}

interface SessionState {
  isAuthenticated: boolean;
  user: UserProfile;
  accessToken: string | null;
  login: (phone: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateKycStatus: (status: 'PENDING' | 'VERIFIED' | 'REJECTED') => void;
  setUser: (updatedUser: Partial<UserProfile>) => void;
  loadStoredSession: () => Promise<void>;
}

const INITIAL_USER: UserProfile = {
  id: 'usr-panvi-491',
  fullName: 'Panvi',
  phone: '+91 98765 43210',
  dateOfBirth: '1997-10-27',
  calculatedAge: 29,
  kycStatus: 'VERIFIED',
  documentType: 'Driving Licence',
  maskedDocNumber: 'DL-TS092015XXXX4819',
  deliveryAddress: 'Villa 14, Silicon Meadows, Jubilee Hills, Hyderabad - 500033',
  activeRideCredit: 150.0,
};

export const useSessionStore = create<SessionState>((set) => ({
  isAuthenticated: true,
  user: INITIAL_USER,
  accessToken: 'mock-jwt-access-token',

  login: async (phone: string, token: string) => {
    try {
      await SecureStore.setItemAsync('boozer_jwt_token', token);
    } catch {
      // fallback if SecureStore is unavailable in preview
    }
    set({ isAuthenticated: true, accessToken: token });
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('boozer_jwt_token');
    } catch {
      // ignore
    }
    set({ isAuthenticated: false, accessToken: null });
  },

  updateKycStatus: (status) =>
    set((state) => ({ user: { ...state.user, kycStatus: status } })),

  setUser: (updatedUser) =>
    set((state) => ({ user: { ...state.user, ...updatedUser }, isAuthenticated: true })),

  loadStoredSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('boozer_jwt_token');
      if (token) {
        set({ isAuthenticated: true, accessToken: token });
      }
    } catch {
      // ignore
    }
  },
}));
