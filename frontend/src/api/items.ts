import api from './axios';
import type { ImprovementItem, ImprovementItemDetail, ApiResponse, Pagination, ItemStatus } from '../types';

interface GetItemsParams {
  page?: number;
  limit?: number;
  departmentId?: string;
  status?: ItemStatus;
  sort?: string;
  order?: 'asc' | 'desc';
  staleOnly?: boolean;
}

interface GetItemsResponse {
  items: ImprovementItem[];
  pagination: Pagination;
}

interface CreateItemData {
  title: string;
  description?: string;
}

interface UpdateItemData {
  title?: string;
  description?: string;
}

interface UpdateStatusData {
  status: ItemStatus;
  note?: string;
}

interface UpdateUrlsData {
  gitUrl?: string | null;
  webUrl?: string | null;
}

export const itemsApi = {
  getItems: async (params: GetItemsParams = {}): Promise<GetItemsResponse> => {
    const response = await api.get<ApiResponse<GetItemsResponse>>('/items', { params });
    return response.data.data!;
  },

  getItem: async (id: string): Promise<ImprovementItemDetail> => {
    const response = await api.get<ApiResponse<ImprovementItemDetail>>(`/items/${id}`);
    return response.data.data!;
  },

  createItem: async (data: CreateItemData): Promise<{ id: string }> => {
    const response = await api.post<ApiResponse<{ id: string }>>('/items', data);
    return response.data.data!;
  },

  updateItem: async (id: string, data: UpdateItemData): Promise<void> => {
    await api.patch(`/items/${id}`, data);
  },

  updateStatus: async (id: string, data: UpdateStatusData): Promise<void> => {
    await api.patch(`/items/${id}/status`, data);
  },

  updateUrls: async (id: string, data: UpdateUrlsData): Promise<{ gitUrl?: string; webUrl?: string }> => {
    const response = await api.patch<ApiResponse<{ gitUrl?: string; webUrl?: string }>>(`/items/${id}/urls`, data);
    return response.data.data!;
  },

  deleteItem: async (id: string): Promise<void> => {
    await api.delete(`/items/${id}`);
  },
};
