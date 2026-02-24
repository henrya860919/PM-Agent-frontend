// src/constants/logic-flag.ts
// Logic flag 類別標籤與 severity 樣式（Workspace 逐字稿分析結果用）

import type { LogicFlagCategory, LogicFlagSeverity } from '@/types/pm-dashboard';

/** 類別對應的顯示名稱 */
export const LOGIC_FLAG_CATEGORY_LABELS: Record<LogicFlagCategory, string> = {
  permissions: 'Permissions',
  'import-export': 'Import/Export',
  hierarchy: 'Hierarchy',
  'data-flow': 'Data Flow',
};

/** severity 對應的區塊樣式（border + background + text） */
export const LOGIC_FLAG_SEVERITY_BOX_STYLES: Record<LogicFlagSeverity, string> = {
  critical: 'border-destructive/30 bg-destructive/5 text-destructive',
  warning: 'border-chart-3/30 bg-chart-3/5 text-chart-3',
  info: 'border-chart-2/30 bg-chart-2/5 text-chart-2',
};

/** severity 對應的 Badge 樣式 */
export const LOGIC_FLAG_SEVERITY_BADGE_STYLES: Record<LogicFlagSeverity, string> = {
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
  warning: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  info: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
};
