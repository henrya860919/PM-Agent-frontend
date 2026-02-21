import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'pm-dashboard',
    component: () => import('@/views/pm-dashboard/PMDashboardView.vue'),
    meta: {
      title: 'PM Dashboard',
    },
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: 'Home',
    },
  },
  // 404 通配
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 設定頁面標題
router.beforeEach((to) => {
  const title = (to.meta.title as string) || 'PM Agent';
  document.title = title;
});

export default router;
