<template>
  <aside class="flex h-full w-60 flex-col border-r border-border bg-sidebar">
    <!-- Logo / Brand -->
    <div class="flex items-center gap-2.5 border-b border-border px-4 py-3">
      <div class="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
        <Hexagon class="h-4 w-4 text-primary-foreground" />
      </div>
      <div class="flex flex-col">
        <span class="text-sm font-semibold text-foreground leading-tight">mark-1</span>
        <span class="text-[10px] text-muted-foreground leading-tight">PM Agent</span>
      </div>
    </div>

    <!-- Search -->
    <div class="px-3 py-2">
      <div class="relative">
        <Search class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="Search projects..."
          class="h-8 bg-secondary pl-8 text-xs placeholder:text-muted-foreground border-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
    </div>

    <!-- New Project -->
    <div class="px-3 pb-2">
      <Button
        variant="outline"
        size="default"
        class="w-full justify-start gap-2 border-dashed border-border bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground text-xs h-8"
        @click="handleNewProjectClick"
    >
      <Plus class="h-3.5 w-3.5" />
      New Project
    </Button>
      <Dialog v-model="showCreateDialog">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{{ editingProject ? '編輯專案' : '新增專案' }}</DialogTitle>
            <DialogDescription>
              {{ editingProject ? '更新專案資訊' : '建立一個新的專案' }}
            </DialogDescription>
          </DialogHeader>
          <div class="grid gap-4 py-4">
            <div class="grid gap-2">
              <label for="name" class="text-sm font-medium">專案名稱 <span class="text-destructive">*</span></label>
              <Input id="name" v-model="form.name" placeholder="請輸入專案名稱" />
            </div>
            <div class="grid gap-2">
              <label for="code" class="text-sm font-medium">專案代碼 <span class="text-destructive">*</span></label>
              <Input
                id="code"
                v-model="form.code"
                placeholder="請輸入專案代碼"
                :disabled="!!editingProject"
              />
            </div>
            <div class="grid gap-2">
              <label for="description" class="text-sm font-medium">專案描述</label>
              <Textarea id="description" v-model="form.description" placeholder="請輸入專案描述" />
            </div>
            <div class="grid gap-2">
              <label for="address" class="text-sm font-medium">地址</label>
              <Input id="address" v-model="form.address" placeholder="請輸入地址" />
            </div>
            <div class="grid gap-2">
              <label for="client" class="text-sm font-medium">客戶</label>
              <Input id="client" v-model="form.client" placeholder="請輸入客戶名稱" />
            </div>
            <div class="grid gap-2">
              <label for="startDate" class="text-sm font-medium">開始日期</label>
              <Input id="startDate" v-model="form.startDate" type="date" />
            </div>
            <div class="grid gap-2">
              <label for="expectedEndDate" class="text-sm font-medium">預計完成日期</label>
              <Input id="expectedEndDate" v-model="form.expectedEndDate" type="date" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" @click="handleCloseDialog" :disabled="isSubmitting">取消</Button>
            <Button @click="handleSubmit" :disabled="isSubmitting">
              {{ isSubmitting ? '處理中...' : '儲存' }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    <!-- Projects：每個專案可展開，下方為 Workspace / File Records / Feature List / Detailed Specs -->
    <nav class="flex-1 overflow-y-auto px-2 pb-2" aria-label="Project navigation">
      <p class="mb-1 px-2 pt-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        Projects
      </p>
      <ul class="flex flex-col gap-0.5" role="list">
        <li v-for="project in filteredProjects" :key="project.id">
          <!-- 專案列：點擊展開/收合，並選中此專案 -->
          <div class="group relative">
            <button
              @click="handleProjectRowClick(project.id)"
              :class="
                cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                  isSelected(project.id)
                    ? 'bg-secondary text-foreground'
                    : 'text-sidebar-foreground hover:bg-secondary hover:text-foreground',
                )
              "
            >
              <ChevronDown
                v-if="isExpanded(project.id)"
                class="h-3.5 w-3.5 shrink-0 text-muted-foreground"
              />
              <ChevronRight
                v-else
                class="h-3.5 w-3.5 shrink-0 text-muted-foreground"
              />
              <FolderKanban class="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span class="flex-1 truncate text-xs font-medium">
                {{ project.name }}
              </span>
              <span
                :class="
                  cn(
                    'h-1.5 w-1.5 shrink-0 rounded-full',
                    statusColors[mapProjectStatusForDisplay(project.status)],
                  )
                "
              />
            </button>
            <div
              class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1"
              @click.stop
            >
              <button
                @click="handleEditProject(project)"
                class="h-5 w-5 flex items-center justify-center rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                title="編輯"
              >
                <Pencil class="h-3 w-3" />
              </button>
              <button
                @click="handleDeleteProject(project)"
                class="h-5 w-5 flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                title="刪除"
              >
                <Trash2 class="h-3 w-3" />
              </button>
            </div>
          </div>

          <!-- 展開後：Workspace、File Records、Feature List、Detailed Specs（對應 src/views 頁面） -->
          <ul
            v-if="isExpanded(project.id)"
            class="ml-5 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-3"
          >
            <li v-for="item in PROJECT_VIEW_ITEMS" :key="item.id">
              <RouterLink
                :to="item.path"
                @click="handleViewClick(project.id)"
                :class="
                  cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition-colors',
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )
                "
              >
                <component :is="item.icon" class="h-3 w-3 shrink-0" />
                <span class="truncate">{{ item.label }}</span>
              </RouterLink>
            </li>
          </ul>
        </li>
      </ul>
    </nav>

    <!-- Footer -->
    <div class="border-t border-border px-3 py-3">
      <button
        class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Settings class="h-3.5 w-3.5" />
        Settings
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import {
  FolderKanban,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  ListChecks,
  Layers,
  Archive,
  LayoutDashboard,
  Settings,
  Hexagon,
  Pencil,
  Trash2,
} from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useWorkspaceStore } from '@/stores/workspace';
import { useProjectStore } from '@/stores/project';
import type { ProjectStatus as PMDashboardProjectStatus } from '@/types/pm-dashboard';
import type {
  CreateProjectRequest,
  ProjectListItem,
  UpdateProjectRequest,
  ProjectStatus,
} from '@/types/project';
import { PROJECT_VIEW_ROUTES } from '@/constants/routes';
import {
  PROJECT_STATUS_BACKEND_TO_UI,
  PROJECT_STATUS_COLORS,
  PROJECT_STATUS_DEFAULT_UI,
} from '@/constants/project';

const route = useRoute();
const store = useWorkspaceStore();
const projectStore = useProjectStore();

const searchQuery = ref<string>('');
const showCreateDialog = ref(false);
const isSubmitting = ref(false);
const editingProject = ref<ProjectListItem | null>(null);

const form = reactive<CreateProjectRequest & UpdateProjectRequest>({
  name: '',
  code: '',
  description: '',
  address: '',
  client: '',
  startDate: '',
  expectedEndDate: '',
});

/** 每個專案展開後底下的功能，對應 src/views；icon 依 id 對應 */
const PROJECT_VIEW_ITEMS = [
  { ...PROJECT_VIEW_ROUTES[0], icon: LayoutDashboard },
  { ...PROJECT_VIEW_ROUTES[1], icon: Archive },
  { ...PROJECT_VIEW_ROUTES[2], icon: ListChecks },
  { ...PROJECT_VIEW_ROUTES[3], icon: Layers },
] as const;

/** 已展開的專案 ID 集合 */
const expandedProjects = ref<Set<string>>(new Set());

const statusColors = PROJECT_STATUS_COLORS;

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/');
}

const filteredProjects = computed(() =>
  projectStore.projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  ),
);

onMounted(async () => {
  await store.initializeProjects();
  await projectStore.fetchProjects();
  // 若有選中的專案，預設展開該專案
  if (store.selectedProjectId) {
    expandedProjects.value.add(store.selectedProjectId);
  } else if (projectStore.projects.length > 0) {
    const firstId = projectStore.projects[0].id;
    expandedProjects.value.add(firstId);
    store.setSelectedProjectId(firstId);
  }
});

function isExpanded(projectId: string): boolean {
  return expandedProjects.value.has(projectId);
}

function toggleExpand(projectId: string): void {
  const next = new Set(expandedProjects.value);
  if (next.has(projectId)) next.delete(projectId);
  else next.add(projectId);
  expandedProjects.value = next;
}

function isSelected(id: string): boolean {
  return store.selectedProjectId === id;
}

/** 點擊專案列：展開/收合 + 選中此專案 */
function handleProjectRowClick(projectId: string): void {
  toggleExpand(projectId);
  store.setSelectedProjectId(projectId);
}

/** 點擊底下的功能連結時，選中該專案（導向頁面由 RouterLink 處理） */
function handleViewClick(projectId: string): void {
  store.setSelectedProjectId(projectId);
}

function mapProjectStatus(status: string): PMDashboardProjectStatus {
  return PROJECT_STATUS_BACKEND_TO_UI[status] ?? PROJECT_STATUS_DEFAULT_UI;
}

function mapProjectStatusForDisplay(
  status: string | ProjectStatus | PMDashboardProjectStatus,
): PMDashboardProjectStatus {
  if (status in PROJECT_STATUS_BACKEND_TO_UI) {
    return mapProjectStatus(status as string);
  }
  if (status === 'active' || status === 'draft' || status === 'archived') {
    return status;
  }
  return PROJECT_STATUS_DEFAULT_UI;
}

async function handleSubmit(): Promise<void> {
  if (!form.name?.trim()) {
    alert('請填寫專案名稱');
    return;
  }
  if (!form.code?.trim()) {
    alert('請填寫專案代碼');
    return;
  }
  isSubmitting.value = true;
  try {
    if (editingProject.value) {
      await projectStore.updateProject(editingProject.value.code, {
        name: form.name,
        description: form.description || undefined,
        address: form.address || undefined,
        client: form.client || undefined,
        startDate: form.startDate || undefined,
        expectedEndDate: form.expectedEndDate || undefined,
      });
    } else {
      await projectStore.createProject({
        name: form.name,
        code: form.code,
        description: form.description || undefined,
        address: form.address || undefined,
        client: form.client || undefined,
        startDate: form.startDate || undefined,
        expectedEndDate: form.expectedEndDate || undefined,
      });
    }
    handleCloseDialog();
    await projectStore.fetchProjects();
  } catch (error) {
    alert(error instanceof Error ? error.message : '操作失敗');
  } finally {
    isSubmitting.value = false;
  }
}

function handleEditProject(project: ProjectListItem): void {
  editingProject.value = project;
  form.name = project.name;
  form.code = project.code;
  form.description = '';
  form.address = project.address || '';
  form.client = '';
  form.startDate = '';
  form.expectedEndDate = '';
  showCreateDialog.value = true;
}

async function handleDeleteProject(project: ProjectListItem): Promise<void> {
  if (!confirm(`確定要刪除專案「${project.name}」嗎？此操作無法復原。`)) return;
  try {
    await projectStore.deleteProject(project.code);
    await projectStore.fetchProjects();
    if (store.selectedProjectId === project.id && projectStore.projects.length > 0) {
      store.setSelectedProjectId(projectStore.projects[0].id);
    } else if (projectStore.projects.length === 0) {
      store.setSelectedProjectId('');
    }
  } catch (error) {
    alert(error instanceof Error ? error.message : '刪除失敗');
  }
}

async function handleNewProjectClick(): Promise<void> {
  editingProject.value = null;
  showCreateDialog.value = true;
  await nextTick();
  form.name = '';
  form.code = '';
  form.description = '';
  form.address = '';
  form.client = '';
  form.startDate = '';
  form.expectedEndDate = '';
}

function handleCloseDialog(): void {
  showCreateDialog.value = false;
  editingProject.value = null;
  form.name = '';
  form.code = '';
  form.description = '';
  form.address = '';
  form.client = '';
  form.startDate = '';
  form.expectedEndDate = '';
}
</script>
