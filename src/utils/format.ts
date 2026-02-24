// src/utils/format.ts

/**
 * 將秒數格式化為 m:ss，供逐字稿時間軸等顯示使用。
 */
export function formatSegmentTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * 格式化 ISO 日期字串為顯示用文字：同一天只顯示時分，否則顯示月/日 時:分（zh-TW）。
 * 適用於分析記錄的上傳時間等。
 */
export function formatRecordDate(isoDate: string): string {
  const d = new Date(isoDate);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
