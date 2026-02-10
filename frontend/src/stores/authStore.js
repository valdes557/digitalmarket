import { create } from 'zustand';
import { authAPI } from '../lib/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  vendor: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user, vendor = null) => {
    set({ user, vendor, isAuthenticated: !!user, isLoading: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ user: null, vendor: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const response = await authAPI.getMe();
      set({
        user: response.data.user,
        vendor: response.data.vendor,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, vendor: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { user, vendor, accessToken, refreshToken } = response.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    set({ user, vendor, isAuthenticated: true, isLoading: false });
    return response.data;
  },

  register: async (data) => {
    const response = await authAPI.register(data);
    const { user, accessToken, refreshToken } = response.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    set({ user, vendor: null, isAuthenticated: true, isLoading: false });
    return response.data;
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore logout errors
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, vendor: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    set((state) => ({
      user: { ...state.user, ...userData },
    }));
  },

  updateVendor: (vendorData) => {
    set((state) => ({
      vendor: state.vendor ? { ...state.vendor, ...vendorData } : vendorData,
    }));
  },

  isAdmin: () => get().user?.role === 'admin',
  isVendor: () => get().user?.role === 'vendor' || get().user?.role === 'admin',
}));
