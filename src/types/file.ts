// src/types/file.ts

export type FileRecord = {
  id: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  extension: string | null;
  businessType: string;
  uploadedBy: {
    id: string;
    username: string;
    displayName: string;
  };
  createdAt: string;
  url: string;
  thumbnailUrl?: string;
  /** 是否已有分析（Intake） */
  hasAnalyzed?: boolean;
};

export type FileListResponse = {
  files: FileRecord[];
  total: number;
  page: number;
  limit: number;
};

export type FileUploadResponse = {
  id: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
};

export type FileProcessingStatusResponse = {
  fileId: string;
  transcriptStatus: 'not_started' | 'processing' | 'completed' | 'failed';
  analysisStatus: 'not_started' | 'processing' | 'completed' | 'failed';
  overall: 'not_started' | 'processing' | 'completed' | 'failed';
  transcriptErrorMessage?: string | null;
  analysisErrorMessage?: string | null;
};

/** 轉錄時間軸區間（後端與前端一致） */
export type TranscriptSegment = {
  start: number;
  end: number;
  text: string;
};

export type FileTranscriptResponse = {
  id: string;
  fileId: string;
  transcript: string;
  /** 時間軸區間列表，供逐字稿依時間顯示 */
  segments: TranscriptSegment[] | null;
  language: string | null;
  duration: number | null;
  wordCount: number | null;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FileAnalysisResponse = {
  id: string;
  fileId: string;
  summary: string | null;
  keyDecisions: unknown[] | null;
  risks: unknown[] | null;
  dependencies: unknown[] | null;
  logicFlags: Array<{
    id: string;
    category: string;
    severity: string;
    message: string;
    source: string;
  }> | null;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};
