<template>
  <aside class="flex h-full w-60 flex-col border-r border-border bg-sidebar">
    <!-- Header -->
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
        size="sm"
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

    <!-- Projects List -->
    <nav class="flex-1 overflow-y-auto px-2 pb-2" aria-label="Project navigation">
      <p class="mb-1 px-2 pt-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        Projects
      </p>

      <ul class="flex flex-col gap-0.5" role="list">
        <li v-for="project in filteredProjects" :key="project.id">
          <div class="group relative">
            <button
              @click="handleProjectClick(project.id)"
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

          <!-- Project Views (sub-nav) -->
          <ul
            v-if="isExpanded(project.id) && isSelected(project.id)"
            class="ml-5 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-3"
          >
            <li v-for="view in PROJECT_VIEWS" :key="view.id">
              <button
                @click="handleViewClick(view.id)"
                :class="
                  cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition-colors',
                    isActiveView(view.id)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )
                "
              >
                <component :is="view.icon" class="h-3 w-3 shrink-0" />
                <span class="truncate">{{ view.label }}</span>
              </button>
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
import { usePMDashboardStore } from '@/stores/pm-dashboard';
import { useProjectStore } from '@/stores/project';
import type { ProjectView, ProjectStatus as PMDashboardProjectStatus } from '@/types/pm-dashboard';
import type {
  CreateProjectRequest,
  ProjectListItem,
  UpdateProjectRequest,
  ProjectStatus,
} from '@/types/project';

interface Props {
  selectedProjectId: string;
  activeView: ProjectView;
}

interface Emits {
  (e: 'select-project', id: string): void;
  (e: 'select-view', view: ProjectView): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const store = usePMDashboardStore();
const projectStore = useProjectStore();

const expandedProjects = ref<Set<string>>(new Set(['1']));
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

const PROJECT_VIEWS: { id: ProjectView; label: string; icon: any }[] = [
  { id: 'workspace', label: 'Workspace', icon: LayoutDashboard },
  { id: 'file-records', label: 'File Records', icon: Archive },
  { id: 'feature-list', label: 'Feature List', icon: ListChecks },
  { id: 'detailed-specs', label: 'Detailed Specs', icon: Layers },
];

const statusColors: Record<PMDashboardProjectStatus, string> = {
  active: 'bg-primary',
  draft: 'bg-muted-foreground',
  archived: 'bg-muted-foreground/40',
};

// 整合後端專案資料
const filteredProjects = computed(() => {
  // 直接使用後端專案資料
  return projectStore.projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

// 載入專案列表
onMounted(async () => {
  await store.initializeProjects();
  await projectStore.fetchProjects();
});

function isExpanded(id: string): boolean {
  return expandedProjects.value.has(id);
}

function isSelected(id: string): boolean {
  return props.selectedProjectId === id;
}

function isActiveView(viewId: ProjectView): boolean {
  return props.activeView === viewId;
}

function toggleProject(id: string): void {
  if (expandedProjects.value.has(id)) {
    expandedProjects.value.delete(id);
  } else {
    expandedProjects.value.add(id);
  }
}

function handleProjectClick(id: string): void {
  emit('select-project', id);
  toggleProject(id);
}

function handleViewClick(viewId: ProjectView): void {
  emit('select-view', viewId);
}

function mapProjectStatus(status: string): PMDashboardProjectStatus {
  const statusMap: Record<string, PMDashboardProjectStatus> = {
    in_progress: 'active',
    completed: 'archived',
    cancelled: 'archived',
    on_hold: 'draft',
  };
  return statusMap[status] || 'active';
}

function mapPMDashboardStatusToProjectStatus(status: PMDashboardProjectStatus): ProjectStatus {
  const statusMap: Record<PMDashboardProjectStatus, ProjectStatus> = {
    active: 'in_progress',
    draft: 'on_hold',
    archived: 'completed',
  };
  return statusMap[status] || 'in_progress';
}

function mapProjectStatusForDisplay(status: string | ProjectStatus | PMDashboardProjectStatus): PMDashboardProjectStatus {
  // 如果是後端的 ProjectStatus，轉換為前端的
  if (status === 'in_progress' || status === 'completed' || status === 'cancelled' || status === 'on_hold') {
    return mapProjectStatus(status);
  }
  // 如果已經是前端的 ProjectStatus，直接返回
  if (status === 'active' || status === 'draft' || status === 'archived') {
    return status;
  }
  return 'active';
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (hours < 1) return '剛剛';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

async function handleSubmit(): Promise<void> {
  // 驗證必填欄位
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
      // 更新專案
      const updateData: UpdateProjectRequest = {
        name: form.name,
        description: form.description || undefined,
        address: form.address || undefined,
        client: form.client || undefined,
        startDate: form.startDate || undefined,
        expectedEndDate: form.expectedEndDate || undefined,
      };
      await projectStore.updateProject(editingProject.value.code, updateData);
    } else {
      // 新增專案
      const createData: CreateProjectRequest = {
        name: form.name,
        code: form.code,
        description: form.description || undefined,
        address: form.address || undefined,
        client: form.client || undefined,
        startDate: form.startDate || undefined,
        expectedEndDate: form.expectedEndDate || undefined,
      };
      await projectStore.createProject(createData);
    }
    handleCloseDialog();
    // 重新載入專案列表
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
  if (!confirm(`確定要刪除專案「${project.name}」嗎？此操作無法復原。`)) {
    return;
  }

  try {
    await projectStore.deleteProject(project.code);
    // 重新載入專案列表
    await projectStore.fetchProjects();
    // 如果刪除的是當前選中的專案，切換到第一個專案
    if (props.selectedProjectId === project.id && projectStore.projects.length > 0) {
      emit('select-project', projectStore.projects[0].id);
    } else if (projectStore.projects.length === 0) {
      // 如果沒有專案了，清空選中狀態
      emit('select-project', '');
    }
  } catch (error) {
    alert(error instanceof Error ? error.message : '刪除失敗');
  }
}

async function handleNewProjectClick(): Promise<void> {
  // 點擊新增專案按鈕時，確保是新增模式
  editingProject.value = null;
  // 先打開 Dialog
  showCreateDialog.value = true;
  // 等待 Dialog 完全渲染後再重置表單
  await nextTick();
  // 重置表單
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
  // 重置表單
  form.name = '';
  form.code = '';
  form.description = '';
  form.address = '';
  form.client = '';
  form.startDate = '';
  form.expectedEndDate = '';
}
</script>
