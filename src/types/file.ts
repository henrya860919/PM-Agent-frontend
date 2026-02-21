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
