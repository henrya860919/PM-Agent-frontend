/**
 * 開發用 API（僅在後端 NODE_ENV=development 時可用）
 */
import apiClient from '../client';

export const devApi = {
  /** 取得是否開啟模擬音檔處理 */
  async getMockAudio(): Promise<{ enabled: boolean } | null> {
    try {
      const { data } = await apiClient.get<{ enabled: boolean }>('/dev/mock-audio');
      return data ?? null;
    } catch {
      return null;
    }
  },

  /** 設定模擬音檔處理開關 */
  async setMockAudio(enabled: boolean): Promise<{ enabled: boolean } | null> {
    try {
      const { data } = await apiClient.put<{ enabled: boolean }>('/dev/mock-audio', { enabled });
      return data ?? null;
    } catch {
      return null;
    }
  },
};
