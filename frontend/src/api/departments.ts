import api from './axios';
import type { Department, ApiResponse } from '../types';

export const departmentsApi = {
  getDepartments: async (): Promise<Department[]> => {
    const response = await api.get<ApiResponse<Department[]>>('/departments');
    return response.data.data!;
  },
};
