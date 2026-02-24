import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Project,
  ProjectView,
  WorkflowStep,
  ChatMessage,
  UploadedFile,
  LogicFlag,
  AnalysisRecord,
} from '@/types/pm-dashboard';
import type { FileRecord } from '@/types/file';
import { PROJECT_STATUS_BACKEND_TO_UI, PROJECT_STATUS_DEFAULT_UI } from '@/constants/project';
import { useProjectStore } from './project';

export const useWorkspaceStore = defineStore('workspace', () => {
  // State
  const selectedProjectId = ref<string>('');
  const activeView = ref<ProjectView>('workspace');
  const currentStep = ref<WorkflowStep>(1);
  const messages = ref<ChatMessage[]>([]);
  const isLoading = ref<boolean>(false);
  const files = ref<UploadedFile[]>([]);
  const transcript = ref<string>('');
  const logicFlags = ref<LogicFlag[]>([]);
  /** 每次完成分析的音檔紀錄列表（用於左側列表管理） */
  const analysisRecords = ref<AnalysisRecord[]>([]);
  /** 目前選中的紀錄 ID，對應的 transcript / logicFlags 會顯示在右側 */
  const selectedRecordId = ref<string>('');

  const projectStore = useProjectStore();

  // 從 project store 取得專案資料並轉換格式
  const projects = computed<Project[]>(() => {
    return projectStore.projects.map((p) => {
      // 轉換後端狀態為 dashboard 狀態
      const status = PROJECT_STATUS_BACKEND_TO_UI[p.status] ?? PROJECT_STATUS_DEFAULT_UI;

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

  function setTranscript(text: string): void {
    transcript.value = text;
  }

  function addAnalysisRecord(record: AnalysisRecord): void {
    analysisRecords.value.unshift(record);
    selectedRecordId.value = record.id;
    transcript.value = record.transcript;
    logicFlags.value = record.logicFlags;
  }

  /** 從後端檔案列表設定分析記錄（僅已分析 hasAnalyzed 的檔案） */
  function setAnalysisRecordsFromApi(files: FileRecord[]): void {
    analysisRecords.value = files.map((f) => ({
      id: f.id,
      fileId: f.id,
      fileName: f.originalFilename,
      transcript: '',
      segments: null,
      logicFlags: [],
      summary: null,
      keyDecisions: null,
      risks: null,
      dependencies: null,
      createdAt: f.createdAt,
    }));
  }

  /** 更新單筆分析記錄的詳情（轉錄／時間軸、分析結果等） */
  function updateAnalysisRecordDetail(
    id: string,
    detail: {
      transcript: string;
      segments?: import('@/types/file').TranscriptSegment[] | null;
      logicFlags: LogicFlag[];
      summary?: string | null;
      keyDecisions?: unknown[] | null;
      risks?: unknown[] | null;
      dependencies?: unknown[] | null;
    },
  ): void {
    const record = analysisRecords.value.find((r) => r.id === id);
    if (record) {
      record.transcript = detail.transcript;
      record.segments = detail.segments ?? null;
      record.logicFlags = detail.logicFlags;
      record.summary = detail.summary ?? null;
      record.keyDecisions = detail.keyDecisions ?? null;
      record.risks = detail.risks ?? null;
      record.dependencies = detail.dependencies ?? null;
      if (selectedRecordId.value === id) {
        transcript.value = detail.transcript;
        logicFlags.value = detail.logicFlags;
      }
    }
  }

  function selectRecord(id: string): void {
    const record = analysisRecords.value.find((r) => r.id === id);
    if (record) {
      selectedRecordId.value = id;
      transcript.value = record.transcript;
      logicFlags.value = record.logicFlags;
    }
  }

  function removeAnalysisRecord(id: string): void {
    analysisRecords.value = analysisRecords.value.filter((r) => r.id !== id);
    if (selectedRecordId.value === id) {
      const next = analysisRecords.value[0];
      if (next) {
        selectRecord(next.id);
      } else {
        selectedRecordId.value = '';
        transcript.value = '';
        logicFlags.value = [];
      }
    }
  }

  return {
    // State
    selectedProjectId,
    activeView,
    currentStep,
    messages,
    isLoading,
    files,
    transcript,
    logicFlags,
    analysisRecords,
    selectedRecordId,
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
    setTranscript,
    addAnalysisRecord,
    setAnalysisRecordsFromApi,
    updateAnalysisRecordDetail,
    selectRecord,
    removeAnalysisRecord,
    initializeProjects,
  };
});
