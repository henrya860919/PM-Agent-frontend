// src/constants/routes.ts
// 與 views 對應的 route id / path / 顯示名稱，供 router、Sidebar、Header 共用

export const ROUTE_NAMES = {
  WORKSPACE: 'workspace',
  FILE_RECORDS: 'file-records',
  FEATURE_LIST: 'feature-list',
  DETAILED_SPECS: 'detailed-specs',
  HOME: 'home',
} as const;

export const ROUTE_PATHS = {
  [ROUTE_NAMES.WORKSPACE]: '/workspace',
  [ROUTE_NAMES.FILE_RECORDS]: '/file-records',
  [ROUTE_NAMES.FEATURE_LIST]: '/feature-list',
  [ROUTE_NAMES.DETAILED_SPECS]: '/detailed-specs',
  [ROUTE_NAMES.HOME]: '/home',
} as const;

/** 各 route 的頁面標題（meta.title / 麵包屑） */
export const ROUTE_LABELS: Record<string, string> = {
  [ROUTE_NAMES.WORKSPACE]: 'Workspace',
  [ROUTE_NAMES.FILE_RECORDS]: 'File Records',
  [ROUTE_NAMES.FEATURE_LIST]: 'Feature List',
  [ROUTE_NAMES.DETAILED_SPECS]: 'Detailed Specs',
  [ROUTE_NAMES.HOME]: 'Home',
};

/** 專案底下功能列（AppLayout 內）的 route 列表，供 Sidebar 導航用。icon 由元件依 id 引入。 */
export const PROJECT_VIEW_ROUTES = [
  { id: ROUTE_NAMES.WORKSPACE, path: ROUTE_PATHS[ROUTE_NAMES.WORKSPACE], label: ROUTE_LABELS[ROUTE_NAMES.WORKSPACE] },
  { id: ROUTE_NAMES.FILE_RECORDS, path: ROUTE_PATHS[ROUTE_NAMES.FILE_RECORDS], label: ROUTE_LABELS[ROUTE_NAMES.FILE_RECORDS] },
  { id: ROUTE_NAMES.FEATURE_LIST, path: ROUTE_PATHS[ROUTE_NAMES.FEATURE_LIST], label: ROUTE_LABELS[ROUTE_NAMES.FEATURE_LIST] },
  { id: ROUTE_NAMES.DETAILED_SPECS, path: ROUTE_PATHS[ROUTE_NAMES.DETAILED_SPECS], label: ROUTE_LABELS[ROUTE_NAMES.DETAILED_SPECS] },
] as const;
