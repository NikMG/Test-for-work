import api from './client';
import { UserResponse, LoginCredentials } from '../types';

export const authApi = {
  login: (credentials: LoginCredentials) => {
    return api.post<UserResponse>('/users/login', { user: credentials });
  },

  getCurrentUser: () => {
    return api.get<UserResponse>('/user');
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },
};