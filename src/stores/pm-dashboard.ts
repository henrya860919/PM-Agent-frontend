import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Project,
  ProjectView,
  WorkflowStep,
  ChatMessage,
  UploadedFile,
  LogicFlag,
  ProjectStatus as PMDashboardProjectStatus,
} from '@/types/pm-dashboard';
import { useProjectStore } from './project';

export const usePMDashboardStore = defineStore('pm-dashboard', () => {
  // State
  const selectedProjectId = ref<string>('');
  const activeView = ref<ProjectView>('workspace');
  const currentStep = ref<WorkflowStep>(1);
  const messages = ref<ChatMessage[]>([]);
  const isLoading = ref<boolean>(false);
  const files = ref<UploadedFile[]>([]);
  const logicFlags = ref<LogicFlag[]>([]);

  const projectStore = useProjectStore();

  // 從 project store 取得專案資料並轉換格式
  const projects = computed<Project[]>(() => {
    return projectStore.projects.map((p) => {
      // 轉換後端狀態為 dashboard 狀態
      const statusMap: Record<string, PMDashboardProjectStatus> = {
        in_progress: 'active',
        completed: 'archived',
        cancelled: 'archived',
        on_hold: 'draft',
      };
      const status = statusMap[p.status] || 'active';

      // 格式化日期
      const date = new Date(p.createdAt);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      let updatedAt = '剛剛';
      if (hours >= 1 && hours < 24) {
        updatedAt = `${hours}h ago`;
      } else if (days >= 1 && days < 7) {
        updatedAt = `${days}d ago`;
      } else if (days >= 7) {
        updatedAt = `${Math.floor(days / 7)}w ago`;
      }

      return {
        id: p.id,
        name: p.name,
        status,
        updatedAt,
      };
    });
  });

  // Computed
  const selectedProject = computed(() =>
    projects.value.find((p) => p.id === selectedProjectId.value),
  );

  // 初始化：載入專案列表
  async function initializeProjects(): Promise<void> {
    if (projectStore.projects.length === 0) {
      await projectStore.fetchProjects();
    }
    // 如果有專案但沒有選中，選中第一個
    if (projects.value.length > 0 && !selectedProjectId.value) {
      selectedProjectId.value = projects.value[0].id;
    }
  }

  // Actions
  function setSelectedProjectId(id: string): void {
    selectedProjectId.value = id;
  }

  function setActiveView(view: ProjectView): void {
    activeView.value = view;
  }

  function setCurrentStep(step: WorkflowStep): void {
    currentStep.value = step;
  }

  function addMessage(message: ChatMessage): void {
    messages.value.push(message);
  }

  function setLoading(loading: boolean): void {
    isLoading.value = loading;
  }

  function addFile(file: UploadedFile): void {
    files.value.unshift(file);
  }

  function updateFile(id: string, updates: Partial<UploadedFile>): void {
    const index = files.value.findIndex((f) => f.id === id);
    if (index !== -1) {
      files.value[index] = { ...files.value[index], ...updates };
    }
  }

  function removeFile(id: string): void {
    files.value = files.value.filter((f) => f.id !== id);
  }

  function setLogicFlags(flags: LogicFlag[]): void {
    logicFlags.value = flags;
  }

  return {
    // State
    selectedProjectId,
    activeView,
    currentStep,
    messages,
    isLoading,
    files,
    logicFlags,
    projects,
    // Computed
    selectedProject,
    // Actions
    setSelectedProjectId,
    setActiveView,
    setCurrentStep,
    addMessage,
    setLoading,
    addFile,
    updateFile,
    removeFile,
    setLogicFlags,
    initializeProjects,
  };
});
