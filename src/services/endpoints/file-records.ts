// src/services/endpoints/file-records.ts（對應 FileRecordsView）
import type {
  FileAnalysisResponse,
  FileListResponse,
  FileProcessingStatusResponse,
  FileTranscriptResponse,
  FileUploadResponse,
} from '@/types/file';
import apiClient from '../client';

export const fileRecordsApi = {
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
    /** 是否已有分析：只顯示已分析、只顯示未分析、或全部 */
    hasAnalyzed?: 'all' | 'yes' | 'no';
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

  /**
   * 取得處理狀態（轉錄/分析）
   * GET /files/{fileId}/processing-status
   */
  async getProcessingStatus(fileId: string): Promise<FileProcessingStatusResponse> {
    const { data } = await apiClient.get<{
      success: boolean;
      data: FileProcessingStatusResponse;
    }>(`/files/${fileId}/processing-status`);
    return data.data;
  },

  /**
   * 取得轉錄
   * GET /files/{fileId}/transcript
   */
  async getTranscript(fileId: string): Promise<FileTranscriptResponse | null> {
    try {
      const res = await apiClient.get<{
        success: boolean;
        data: FileTranscriptResponse;
      }>(`/files/${fileId}/transcript`);
      return res.data.data ?? null;
    } catch {
      return null;
    }
  },

  /**
   * 取得分析（含 logic flags）
   * GET /files/{fileId}/analysis
   */
  async getAnalysis(fileId: string): Promise<FileAnalysisResponse | null> {
    try {
      const res = await apiClient.get<{
        success: boolean;
        data: FileAnalysisResponse;
      }>(`/files/${fileId}/analysis`);
      return res.data.data ?? null;
    } catch {
      return null;
    }
  },

  /**
   * 手動觸發處理（僅音檔）
   * POST /files/{fileId}/process
   */
  async triggerProcess(fileId: string): Promise<void> {
    await apiClient.post(`/files/${fileId}/process`);
  },
};
