// src/constants/file.ts
export const FILE_BUSINESS_TYPE = {
  PROJECT_DOCUMENT: 'project_document',
} as const;

export type FileBusiness = (typeof FILE_BUSINESS_TYPE)[keyof typeof FILE_BUSINESS_TYPE];

/** 檔案列表篩選類型（FileRecordsView tabs / API list type） */
export const FILE_TYPE_FILTERS = ['all', 'audio', 'transcript', 'document', 'image'] as const;

export type FileTypeFilter = (typeof FILE_TYPE_FILTERS)[number];

/** 是否只顯示已分析：分析記錄用 YES，列表全部用 ALL */
export const HAS_ANALYZED = {
  ALL: 'all',
  YES: 'yes',
  NO: 'no',
} as const;

/** 超過此大小（5MB）即走切片上傳，與後端 CHUNKED_UPLOAD_THRESHOLD_BYTES 一致 */
export const CHUNKED_UPLOAD_THRESHOLD_BYTES = 5 * 1024 * 1024;
