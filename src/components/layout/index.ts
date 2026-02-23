/**
 * Layout 商業邏輯層
 * - Sidebar：主導航，每個項目對應 src/views 的一個頁面
 * - Header：頂欄標題與操作區
 * - AppLayout：Sidebar + Header + RouterView 的整體版面
 */
export { AppSidebar } from './Sidebar';
export { AppHeader } from './Header';
export { default as AppLayout } from './AppLayout.vue';
