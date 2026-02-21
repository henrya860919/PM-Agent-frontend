// src/utils/upload.ts
import { FILE_BUSINESS_TYPE } from '@/constants/file';
import { fileApi } from '@/services/endpoints/file';
import type { FileUploadResponse } from '@/types/file';

export interface UploadFileOptions {
  /** 檔案物件 */
  file: File;
  /** 業務類型 */
  businessType: (typeof FILE_BUSINESS_TYPE)[keyof typeof FILE_BUSINESS_TYPE];
  /** 業務 ID */
  businessId?: string;
  /** 專案 ID */
  projectId?: string;
  /** 進度回調（可選） */
  onProgress?: (progress: number) => void;
}

/**
 * 通用檔案上傳函數
 */
export async function uploadFile(options: UploadFileOptions): Promise<FileUploadResponse> {
  const { file, businessType, businessId, projectId, onProgress } = options;

  // 簡單的上傳實現，可以根據需要添加進度追蹤
  if (onProgress) {
    onProgress(0);
  }

  try {
    const result = await fileApi.upload(file, {
      businessType,
      businessId,
      projectId,
    });

    if (onProgress) {
      onProgress(100);
    }

    return result;
  } catch (error) {
    if (onProgress) {
      onProgress(0);
    }
    throw error;
  }
}
