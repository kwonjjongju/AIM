import axiosInstance from './axios';

export interface ExcelPreviewItem {
  title: string;
  description: string;
  departmentName: string;
  managerName?: string;
  managerEmail?: string;
}

export interface PreviewResponse {
  sheets: string[];
  preview: ExcelPreviewItem[];
  totalItems: number;
  errors: string[];
}

export interface UploadResponse {
  success: boolean;
  message: string;
  created: number;
  skipped: number;
  errors: string[];
}

export const uploadApi = {
  // 엑셀 파일 미리보기
  previewExcel: async (file: File): Promise<PreviewResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post('/upload/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // 엑셀 파일 업로드 및 아이템 생성
  uploadExcel: async (file: File, sheets?: string[]): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (sheets) {
      formData.append('sheets', JSON.stringify(sheets));
    }
    
    const response = await axiosInstance.post('/upload/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
