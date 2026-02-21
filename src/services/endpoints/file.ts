// src/services/endpoints/file.ts
import type { FileListResponse, FileRecord, FileUploadResponse } from '@/types/file';
import apiClient from '../client';

export const fileApi = {
  /**
   * 上傳檔案
   * POST /files/upload
   */
  async upload(
    file: File,
    options: {
      businessType: string;
      businessId?: string;
      projectId?: string;
    },
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('businessType', options.businessType);
    if (options.businessId) {
      formData.append('businessId', options.businessId);
    }
    if (options.projectId) {
      formData.append('projectId', options.projectId);
    }

    const { data } = await apiClient.post<{ success: boolean; data: FileUploadResponse }>(
      '/files/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return data.data;
  },

  /**
   * 獲取檔案列表
   * GET /files
   */
  async list(params?: {
    projectId?: string;
    businessType?: string;
    type?: 'all' | 'audio' | 'transcript' | 'document' | 'image';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<FileListResponse> {
    const { data } = await apiClient.get<{ success: boolean; data: FileListResponse }>('/files', {
      params,
    });
    return data.data;
  },

  /**
   * 刪除檔案
   * DELETE /files/{fileId}
   */
  async delete(fileId: string): Promise<void> {
    await apiClient.delete(`/files/${fileId}`);
  },
};
