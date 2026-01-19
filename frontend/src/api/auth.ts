import api from './axios';
import type { User, ApiResponse } from '../types';

interface LoginResponse {
  accessToken: string;
  user: User;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
      email,
      password,
    });
    return response.data.data!;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  refresh: async (): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/refresh');
    return response.data.data!;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/users/me');
    return response.data.data!;
  },
};
