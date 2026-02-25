// src/utils/upload.ts
import {
  CHUNKED_UPLOAD_THRESHOLD_BYTES,
  FILE_BUSINESS_TYPE,
} from '@/constants/file';
import { fileRecordsApi } from '@/services/endpoints/file-records';
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
  /** 進度回調（可選，0–100） */
  onProgress?: (progress: number) => void;
}

/**
 * 通用檔案上傳：依大小自動選擇傳統上傳或切片上傳（≥5MB 走切片）。
 */
export async function uploadFile(options: UploadFileOptions): Promise<FileUploadResponse> {
  const { file, businessType, businessId, projectId, onProgress } = options;

  if (onProgress) {
    onProgress(0);
  }

  try {
    if (file.size < CHUNKED_UPLOAD_THRESHOLD_BYTES) {
      const result = await fileRecordsApi.upload(file, {
        businessType,
        businessId,
        projectId,
      });
      if (onProgress) onProgress(100);
      return result;
    }

    // 切片上傳
    const { uploadId, chunkSize } = await fileRecordsApi.chunkedInit({
      filename: file.name,
      totalSize: file.size,
      mimeType: file.type || 'application/octet-stream',
    });

    const totalChunks = Math.ceil(file.size / chunkSize);
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const blob = file.slice(start, end);
      await fileRecordsApi.uploadChunk(uploadId, i, blob);
      if (onProgress) {
        onProgress(Math.round(((i + 1) / totalChunks) * 100));
      }
    }

    const result = await fileRecordsApi.chunkedMerge(uploadId, {
      businessType,
      businessId,
      projectId,
    });
    if (onProgress) onProgress(100);
    return result;
  } catch (error) {
    if (onProgress) onProgress(0);
    throw error;
  }
}
