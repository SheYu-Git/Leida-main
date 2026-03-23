import { defineStore } from 'pinia';
import api from '../lib/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
  },
  actions: {
    async login(credentials: any) {
      const response = await api.post('/auth/login', credentials);
      this.token = response.data.token;
      this.user = response.data.user;
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
    },
    async register(userData: any) {
      await api.post('/auth/register', userData);
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});
