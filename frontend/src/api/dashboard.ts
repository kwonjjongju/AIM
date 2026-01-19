import api from './axios';
import type { DashboardSummary, ApiResponse } from '../types';

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await api.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
    return response.data.data!;
  },
};
