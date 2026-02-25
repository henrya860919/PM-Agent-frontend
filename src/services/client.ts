// src/services/client.ts
import axios from 'axios';

// 建立 axios 實例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 30000, // 30 秒超時
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 如果有跨域需求，根據需要設置為 true，ex: domain.com, api.domain.com，關鍵字: cookie
});

// 簡化的請求攔截器（開發環境自動加入 x-user-id）
apiClient.interceptors.request.use(
  (config) => {
    // 開發環境：自動加入 x-user-id header
    if (import.meta.env.DEV && !config.headers['x-user-id']) {
      config.headers['x-user-id'] = '00000000-0000-0000-0000-000000000001';
    }
    // 上傳 FormData 時不可帶 Content-Type: application/json，讓 axios 自動設 multipart/form-data + boundary
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 簡化的響應攔截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 統一錯誤處理
    const message = error.response?.data?.message || error.message || '請求失敗';
    return Promise.reject(new Error(message));
  },
);

export default apiClient;
