import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { AppLayout } from '@/components/layout';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        redirect: '/workspace',
      },
      {
        path: 'workspace',
        name: 'workspace',
        component: () => import('@/views/WorkspaceView.vue'),
        meta: { title: 'Workspace' },
      },
      {
        path: 'file-records',
        name: 'file-records',
        component: () => import('@/views/FileRecordsView.vue'),
        meta: { title: 'File Records' },
      },
      {
        path: 'feature-list',
        name: 'feature-list',
        component: () => import('@/views/FeatureListView.vue'),
        meta: { title: 'Feature List' },
      },
      {
        path: 'detailed-specs',
        name: 'detailed-specs',
        component: () => import('@/views/DetailedSpecsView.vue'),
        meta: { title: 'Detailed Specs' },
      },
    ],
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'Home' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const title = (to.meta.title as string) || 'PM Agent';
  document.title = title;
});

export default router;
