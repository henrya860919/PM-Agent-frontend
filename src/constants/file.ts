// src/constants/file.ts
export const FILE_BUSINESS_TYPE = {
  PROJECT_DOCUMENT: 'project_document',
} as const;

export type FileBusiness = (typeof FILE_BUSINESS_TYPE)[keyof typeof FILE_BUSINESS_TYPE];
