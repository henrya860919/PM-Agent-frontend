<template>
  <div class="flex h-full min-h-0 flex-row overflow-hidden">
    <!-- 分析記錄列表（固定寬度、不可拖曳調整） -->
    <aside class="flex w-52 shrink-0 flex-col border-r border-border bg-muted/30">
      <div class="border-b border-border px-3 py-2.5">
        <div class="flex items-center justify-between gap-2">
          <h3 class="text-xs font-semibold text-foreground">分析記錄</h3>
          <Button
            variant="outline"
            size="icon"
            class="h-7 w-7 shrink-0"
            aria-label="新增"
            @click="uploadDialogOpen = true"
          >
            <Plus class="h-3.5 w-3.5" />
          </Button>
        </div>
        <p class="text-[10px] text-muted-foreground mt-0.5">點選切換檢視</p>
      </div>
      <ScrollArea class="flex-1">
        <div class="p-2 space-y-1">
          <button
            v-for="record in store.analysisRecords"
            :key="record.id"
            @click="handleSelectRecord(record.id)"
            :class="
              cn(
                'w-full flex items-start gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors',
                store.selectedRecordId === record.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted',
              )
            "
          >
            <FileAudio class="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <div class="min-w-0 flex-1 flex flex-col gap-0.5">
              <span class="truncate font-medium">{{ record.fileName }}</span>
              <span
                :class="
                  store.selectedRecordId === record.id
                    ? 'text-primary-foreground/80'
                    : 'text-muted-foreground'
                "
                class="text-[10px]"
              >
                上傳時間 {{ formatRecordDate(record.createdAt) }}
              </span>
            </div>
          </button>
          <p
            v-if="store.analysisRecords.length === 0"
            class="px-2.5 py-4 text-[11px] text-muted-foreground text-center"
          >
            尚無紀錄，上傳音檔完成分析後會顯示於此
          </p>
        </div>
      </ScrollArea>
    </aside>

    <ResizablePanelGroup direction="horizontal" class="flex-1 min-h-0">
      <!-- 中間主內容：檢視紀錄或空狀態 -->
      <ResizablePanel :default-size="55" :min-size="25" :max-size="80">
      <div class="flex-1 h-full overflow-hidden flex flex-col">
        <!-- 檢視紀錄（點選左側一筆資料時顯示） -->
        <ScrollArea class="h-full">
            <div class="flex flex-col gap-6 p-6">
              <template v-if="recordDetailLoading && selectedRecord">
                <div class="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Loader2 class="h-8 w-8 animate-spin mb-3" />
                  <p class="text-sm">載入紀錄詳情…</p>
                </div>
              </template>
              <template v-else-if="store.selectedRecordId && selectedRecord">
                <section>
                  <div class="flex items-center justify-between mb-3">
                    <div>
                      <h3 class="text-sm font-semibold text-foreground">逐字稿</h3>
                      <p class="text-xs text-muted-foreground">{{ selectedRecord.fileName }}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="showTranscript = !showTranscript"
                      class="text-xs h-7 text-muted-foreground hover:text-foreground"
                    >
                      {{ showTranscript ? '收合' : '展開' }}
                    </Button>
                  </div>
                  <div v-if="showTranscript" class="space-y-2">
                    <template v-if="selectedRecord.segments?.length">
                      <div
                        v-for="(seg, idx) in selectedRecord.segments"
                        :key="idx"
                        class="flex gap-3 rounded-md bg-secondary px-3 py-2 text-left"
                      >
                        <span class="shrink-0 text-[11px] font-mono text-muted-foreground tabular-nums">
                          {{ formatSegmentTime(seg.start) }} – {{ formatSegmentTime(seg.end) }}
                        </span>
                        <span class="min-w-0 flex-1 text-xs leading-relaxed">{{ seg.text }}</span>
                      </div>
                    </template>
                    <p v-else class="rounded-md bg-secondary px-3 py-4 text-xs text-muted-foreground">
                      {{ selectedRecord.transcript || '無轉錄內容' }}
                    </p>
                  </div>
                </section>
                <section>
                  <div class="flex items-center justify-between mb-3">
                    <div>
                      <h3 class="text-sm font-semibold text-foreground">Logic Filter</h3>
                      <p class="text-xs text-muted-foreground">Flagged issues from transcript analysis</p>
                    </div>
                    <Badge variant="outline" class="text-[10px] border-primary/30 text-primary">
                      {{ selectedRecord.logicFlags.length }} flags
                    </Badge>
                  </div>
                  <div class="flex flex-col gap-2">
                    <div
                      v-for="flag in selectedRecord.logicFlags"
                      :key="flag.id"
                      :class="cn('rounded-md border p-3', severityStyles[flag.severity])"
                    >
                      <div class="flex items-start gap-2.5">
                        <component :is="categoryIcons[flag.category]" class="h-4 w-4 shrink-0 mt-0.5" />
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 mb-1">
                            <Badge variant="outline" :class="cn('text-[10px] h-4', severityBadge[flag.severity])">
                              {{ categoryLabels[flag.category] }}
                            </Badge>
                            <Badge variant="outline" :class="cn('text-[10px] h-4 capitalize', severityBadge[flag.severity])">
                              {{ flag.severity }}
                            </Badge>
                          </div>
                          <p class="text-xs leading-relaxed">{{ flag.message }}</p>
                          <p class="mt-1 text-[10px] opacity-70">Source: {{ flag.source }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </template>
              <div
                v-else
                class="flex flex-col items-center justify-center py-16 text-center"
              >
                <FileAudio class="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p class="text-sm font-medium text-foreground">請點選左側一筆紀錄</p>
                <p class="text-xs text-muted-foreground mt-1">或按「＋」新增上傳與分析</p>
              </div>
            </div>
          </ScrollArea>
      </div>
      </ResizablePanel>

      <ResizableHandle with-handle />
      <!-- 右側：分析結果區塊 -->
      <ResizablePanel :default-size="30" :min-size="20" :max-size="50">
      <div class="flex h-full flex-col border-l border-border bg-muted/20">
        <div class="px-3 py-2.5 border-b border-border">
          <h3 class="text-xs font-semibold text-foreground">分析結果</h3>
          <p class="text-[10px] text-muted-foreground mt-0.5">AI 分析摘要與重點</p>
        </div>
        <ScrollArea class="flex-1">
          <div class="p-3 space-y-4">
            <template v-if="selectedRecord && hasAnalysisContent(selectedRecord)">
              <section v-if="selectedRecord.summary" class="space-y-1.5">
                <h4 class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">摘要</h4>
                <p class="text-xs leading-relaxed text-foreground whitespace-pre-wrap">{{ selectedRecord.summary }}</p>
              </section>
              <section v-if="selectedRecord.keyDecisions?.length" class="space-y-1.5">
                <h4 class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">關鍵決策</h4>
                <ul class="list-disc list-inside space-y-1 text-xs text-foreground">
                  <li v-for="(item, i) in selectedRecord.keyDecisions" :key="i">
                    {{ formatAnalysisItem(item) }}
                  </li>
                </ul>
              </section>
              <section v-if="selectedRecord.risks?.length" class="space-y-1.5">
                <h4 class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">風險</h4>
                <ul class="list-disc list-inside space-y-1 text-xs text-foreground">
                  <li v-for="(item, i) in selectedRecord.risks" :key="i">
                    {{ formatAnalysisItem(item) }}
                  </li>
                </ul>
              </section>
              <section v-if="selectedRecord.dependencies?.length" class="space-y-1.5">
                <h4 class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">依賴</h4>
                <ul class="list-disc list-inside space-y-1 text-xs text-foreground">
                  <li v-for="(item, i) in selectedRecord.dependencies" :key="i">
                    {{ formatAnalysisItem(item) }}
                  </li>
                </ul>
              </section>
            </template>
            <div
              v-else
              class="flex flex-col items-center justify-center py-8 text-center"
            >
              <FileText class="h-10 w-10 text-muted-foreground/50 mb-2" />
              <p class="text-xs text-muted-foreground">選中一筆紀錄或完成上傳後</p>
              <p class="text-[10px] text-muted-foreground mt-0.5">在此顯示 AI 分析結果</p>
            </div>
          </div>
        </ScrollArea>
      </div>
      </ResizablePanel>
    </ResizablePanelGroup>

    <!-- 新增上傳 Dialog：僅上傳框 -->
    <Dialog v-model="uploadDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>新增上傳與分析</DialogTitle>
          <DialogDescription>上傳音檔或文件，完成後將顯示於左側分析記錄並可檢視轉錄與分析結果。</DialogDescription>
        </DialogHeader>
        <!-- 開發者模式：模擬音檔（僅開發環境顯示） -->
        <section
          v-if="devModeAvailable"
          class="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-medium text-foreground">開發者模式</p>
              <p class="mt-0.5 text-[10px] text-muted-foreground">
                開啟後音檔將使用假轉錄／假分析，不呼叫 Whisper／Claude，不花 API 額度
              </p>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="mockAudioEnabled"
              aria-label="開啟或關閉模擬音檔處理"
              :class="
                cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  mockAudioEnabled ? 'bg-primary' : 'bg-input',
                )
              "
              @click="toggleMockAudio"
            >
              <span
                :class="
                  cn(
                    'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform',
                    mockAudioEnabled ? 'translate-x-5' : 'translate-x-0.5',
                  )
                "
              />
            </button>
          </div>
          <p v-if="mockAudioEnabled" class="mt-2 text-[10px] text-amber-600 dark:text-amber-400">
            目前為模擬模式，上傳音檔不會呼叫 OpenAI / Anthropic
          </p>
        </section>
        <section class="py-2">
          <div
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="handleDrop"
            @click="fileInputRef?.click()"
            :class="
              cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground hover:bg-secondary/50',
              )
            "
            role="button"
            tabindex="0"
            aria-label="Drop files here or click to upload"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <Upload class="h-5 w-5 text-muted-foreground" />
            </div>
            <p class="mt-2 text-sm font-medium text-foreground">拖曳檔案到這裡或點擊選取</p>
            <p class="mt-1 text-xs text-muted-foreground">MP3, WAV, M4A, TXT, PDF, MD</p>
            <input
              ref="fileInputRef"
              type="file"
              multiple
              accept="audio/*,.txt,.pdf,.md"
              @change="handleFileSelect"
              class="hidden"
            />
          </div>
          <div v-if="files.length > 0" class="mt-3 flex flex-col gap-2">
            <div
              v-for="file in files"
              :key="file.id"
              class="flex items-center gap-3 rounded-md bg-secondary p-2.5"
            >
              <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-card">
                <FileAudio v-if="file.type === 'audio'" class="h-3.5 w-3.5 text-primary" />
                <FileText v-else class="h-3.5 w-3.5 text-primary" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="truncate text-xs font-medium text-foreground">{{ file.name }}</p>
                <p class="text-[10px] text-muted-foreground">{{ file.size }}</p>
                <p
                  v-if="file.status === 'processing' && file.processingStep"
                  class="mt-0.5 text-[10px] text-primary"
                >
                  {{ file.processingStep }}
                </p>
                <p
                  v-if="file.status === 'error' && file.errorMessage"
                  class="mt-0.5 text-[10px] text-destructive max-w-[200px] truncate"
                  :title="file.errorMessage"
                >
                  {{ file.errorMessage }}
                </p>
                <div v-if="file.status === 'uploading'" class="mt-1 h-1 w-full overflow-hidden rounded-full bg-card">
                  <div
                    class="h-full rounded-full bg-primary transition-all"
                    :style="{ width: `${file.progress}%` }"
                  />
                </div>
              </div>
              <div class="shrink-0 flex items-center gap-1.5">
                <span v-if="file.status === 'uploading'" class="text-[10px] text-muted-foreground">
                  {{ Math.round(file.progress) }}%
                </span>
                <Loader2 v-if="file.status === 'processing'" class="h-4 w-4 animate-spin text-primary" />
                <CheckCircle2 v-if="file.status === 'ready'" class="h-4 w-4 text-primary" />
                <AlertTriangle v-if="file.status === 'error'" class="h-4 w-4 text-destructive" />
              </div>
              <button
                @click.stop="removeFile(file.id)"
                class="shrink-0 text-muted-foreground hover:text-foreground"
                :aria-label="`Remove ${file.name}`"
              >
                <X class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  Upload,
  FileAudio,
  FileText,
  X,
  Plus,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  ArrowRightLeft,
  GitBranch,
} from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWorkspaceStore } from '@/stores/workspace';
import { fileRecordsApi } from '@/services/endpoints/file-records';
import { devApi } from '@/services/endpoints/dev';
import { uploadFile } from '@/utils/upload';
import { formatRecordDate, formatSegmentTime } from '@/utils/format';
import { FILE_BUSINESS_TYPE, HAS_ANALYZED } from '@/constants/file';
import {
  LOGIC_FLAG_CATEGORY_LABELS,
  LOGIC_FLAG_SEVERITY_BADGE_STYLES,
  LOGIC_FLAG_SEVERITY_BOX_STYLES,
} from '@/constants/logic-flag';
import { MAX_POLL_ATTEMPTS, POLL_INTERVAL_MS } from '@/constants/workspace';
import type {
  ChatMessage,
  UploadedFile,
  LogicFlag,
  LogicFlagCategory,
  LogicFlagSeverity,
  AnalysisRecord as AnalysisRecordType,
} from '@/types/pm-dashboard';

const store = useWorkspaceStore();

function hasAnalysisContent(record: AnalysisRecordType): boolean {
  return !!(
    (record.summary && record.summary.trim()) ||
    (record.keyDecisions && record.keyDecisions.length > 0) ||
    (record.risks && record.risks.length > 0) ||
    (record.dependencies && record.dependencies.length > 0)
  );
}

function formatAnalysisItem(item: unknown): string {
  if (typeof item === 'string') return item;
  if (item != null && typeof item === 'object' && 'text' in item && typeof (item as { text: string }).text === 'string') {
    return (item as { text: string }).text;
  }
  if (item != null && typeof item === 'object' && 'description' in item && typeof (item as { description: string }).description === 'string') {
    return (item as { description: string }).description;
  }
  if (item != null && typeof item === 'object') return JSON.stringify(item);
  return String(item);
}

// --- Intake / Upload state ---
const isDragging = ref<boolean>(false);
const showTranscript = ref<boolean>(true);
const fileInputRef = ref<HTMLInputElement | null>(null);
const devModeAvailable = ref<boolean>(false);
const mockAudioEnabled = ref<boolean>(false);
/** 上傳 Dialog 開關 */
const uploadDialogOpen = ref<boolean>(false);

const selectedRecord = computed(() =>
  store.analysisRecords.find((r) => r.id === store.selectedRecordId),
);

/** 背景預取單筆紀錄的轉錄與分析，有真實資料才寫入 store */
async function prefetchRecordDetail(fileId: string): Promise<void> {
  try {
    const [transcriptRes, analysisRes] = await Promise.all([
      fileRecordsApi.getTranscript(fileId),
      fileRecordsApi.getAnalysis(fileId),
    ]);
    const transcriptText = transcriptRes?.transcript ?? '';
    const segments = transcriptRes?.segments ?? null;
    const flags: LogicFlag[] =
      analysisRes?.logicFlags?.length ?
        analysisRes.logicFlags.map((f) => ({
          id: f.id,
          category: f.category as LogicFlag['category'],
          severity: f.severity as LogicFlag['severity'],
          message: f.message,
          source: f.source,
        }))
      : [];
    store.updateAnalysisRecordDetail(fileId, {
      transcript: transcriptText,
      segments,
      logicFlags: flags,
      summary: analysisRes?.summary ?? null,
      keyDecisions: analysisRes?.keyDecisions ?? null,
      risks: analysisRes?.risks ?? null,
      dependencies: analysisRes?.dependencies ?? null,
    });
  } catch {
    // 單筆失敗不影響其他筆，不寫入假資料
  }
}

/** 從後端載入「已分析」的檔案列表作為分析記錄，並背景預取每筆真實轉錄／分析 */
async function fetchAnalysisRecords(): Promise<void> {
  try {
    const result = await fileRecordsApi.list({
      hasAnalyzed: HAS_ANALYZED.YES,
      projectId: store.selectedProjectId || undefined,
      limit: 100,
      page: 1,
    });
    store.setAnalysisRecordsFromApi(result.files);
    // 背景預取每筆的真實資料，有回傳才更新（不寫入假資料）
    void Promise.allSettled(result.files.map((f) => prefetchRecordDetail(f.id)));
  } catch (err) {
    console.error('Failed to fetch analysis records:', err);
  }
}

const recordDetailLoading = ref<boolean>(false);

async function handleSelectRecord(id: string): Promise<void> {
  store.selectRecord(id);
  const record = store.analysisRecords.find((r) => r.id === id);
  if (!record || (record.transcript !== '' && record.logicFlags.length > 0)) {
    return;
  }
  recordDetailLoading.value = true;
  try {
    const [transcriptRes, analysisRes] = await Promise.all([
      fileRecordsApi.getTranscript(id),
      fileRecordsApi.getAnalysis(id),
    ]);
    const transcriptText = transcriptRes?.transcript ?? '';
    const segments = transcriptRes?.segments ?? null;
    const flags: LogicFlag[] = analysisRes?.logicFlags?.length
      ? analysisRes.logicFlags.map((f) => ({
          id: f.id,
          category: f.category as LogicFlag['category'],
          severity: f.severity as LogicFlag['severity'],
          message: f.message,
          source: f.source,
        }))
      : [];
    store.updateAnalysisRecordDetail(id, {
      transcript: transcriptText,
      segments,
      logicFlags: flags,
      summary: analysisRes?.summary ?? null,
      keyDecisions: analysisRes?.keyDecisions ?? null,
      risks: analysisRes?.risks ?? null,
      dependencies: analysisRes?.dependencies ?? null,
    });
  } catch (err) {
    console.error('Failed to load record detail:', err);
  } finally {
    recordDetailLoading.value = false;
  }
}

const categoryIcons: Record<LogicFlagCategory, unknown> = {
  permissions: ShieldAlert,
  'import-export': ArrowRightLeft,
  hierarchy: GitBranch,
  'data-flow': AlertTriangle,
};

const categoryLabels = LOGIC_FLAG_CATEGORY_LABELS;
const severityStyles = LOGIC_FLAG_SEVERITY_BOX_STYLES;
const severityBadge = LOGIC_FLAG_SEVERITY_BADGE_STYLES;

const files = computed(() => store.files);

onMounted(async () => {
  await store.initializeProjects();
  await fetchAnalysisRecords();
  const res = await devApi.getMockAudio();
  if (res != null) {
    devModeAvailable.value = true;
    mockAudioEnabled.value = res.enabled;
  }
});

watch(() => store.selectedProjectId, () => {
  fetchAnalysisRecords();
});

async function toggleMockAudio(): Promise<void> {
  const next = !mockAudioEnabled.value;
  const res = await devApi.setMockAudio(next);
  if (res != null) {
    mockAudioEnabled.value = res.enabled;
  }
}

function getProcessingStepLabel(status: {
  transcriptStatus: string;
  analysisStatus: string;
}): string {
  if (status.transcriptStatus !== 'completed') return '轉錄中 (1/2)';
  if (status.analysisStatus === 'not_started' || status.analysisStatus === 'processing') {
    return '分析中 (2/2)';
  }
  return '處理中…';
}

async function pollForProcessing(
  frontendFileId: string,
  backendFileId: string,
  fileName: string,
): Promise<void> {
  let attempts = 0;
  const poll = async (): Promise<void> => {
    attempts += 1;
    if (attempts > MAX_POLL_ATTEMPTS) {
      store.updateFile(frontendFileId, {
        status: 'error',
        errorMessage: '處理逾時，請稍後重試',
      });
      return;
    }
    try {
      const status = await fileRecordsApi.getProcessingStatus(backendFileId);
      const stepLabel = getProcessingStepLabel(status);
      store.updateFile(frontendFileId, { processingStep: stepLabel });

      if (status.overall === 'completed') {
        const [transcriptRes, analysisRes] = await Promise.all([
          fileRecordsApi.getTranscript(backendFileId),
          fileRecordsApi.getAnalysis(backendFileId),
        ]);
        const transcriptText = transcriptRes?.transcript ?? '';
        const segments = transcriptRes?.segments ?? null;
        const flags: LogicFlag[] = analysisRes?.logicFlags?.length
          ? analysisRes.logicFlags.map((f) => ({
              id: f.id,
              category: f.category as LogicFlag['category'],
              severity: f.severity as LogicFlag['severity'],
              message: f.message,
              source: f.source,
            }))
          : [];
        store.updateFile(frontendFileId, { status: 'ready', processingStep: undefined });
        await fetchAnalysisRecords();
        const exists = store.analysisRecords.some((r) => r.id === backendFileId);
        if (exists) {
          store.updateAnalysisRecordDetail(backendFileId, {
            transcript: transcriptText,
            segments,
            logicFlags: flags,
            summary: analysisRes?.summary ?? null,
            keyDecisions: analysisRes?.keyDecisions ?? null,
            risks: analysisRes?.risks ?? null,
            dependencies: analysisRes?.dependencies ?? null,
          });
        } else {
          store.addAnalysisRecord({
            id: backendFileId,
            fileId: backendFileId,
            fileName,
            transcript: transcriptText,
            segments,
            logicFlags: flags,
            summary: analysisRes?.summary ?? null,
            keyDecisions: analysisRes?.keyDecisions ?? null,
            risks: analysisRes?.risks ?? null,
            dependencies: analysisRes?.dependencies ?? null,
            createdAt: new Date().toISOString(),
          });
        }
        store.selectRecord(backendFileId);
        uploadDialogOpen.value = false;
        handleFileProcessed(`Transcript from ${fileName}: analysis ready.`, fileName);
        return;
      }
      if (status.overall === 'failed') {
        const msg =
          status.transcriptErrorMessage ||
          status.analysisErrorMessage ||
          '轉錄或分析失敗';
        store.updateFile(frontendFileId, {
          status: 'error',
          errorMessage: msg,
          processingStep: undefined,
        });
        if (status.transcriptStatus === 'completed') {
          try {
            const transcriptRes = await fileRecordsApi.getTranscript(backendFileId);
            if (transcriptRes?.transcript) {
              store.setTranscript(transcriptRes.transcript);
            }
          } catch {
            // ignore
          }
        }
        return;
      }
    } catch {
      // keep polling
    }
    setTimeout(poll, POLL_INTERVAL_MS);
  };
  store.updateFile(frontendFileId, { processingStep: '轉錄中 (1/2)' });
  setTimeout(poll, POLL_INTERVAL_MS);
}

async function simulateUpload(file: File): Promise<void> {
  const id = Math.random().toString(36).slice(2);
  const isAudio = file.type.startsWith('audio/');
  const newFile: UploadedFile = {
    id,
    name: file.name,
    size: `${(file.size / 1024).toFixed(1)} KB`,
    type: isAudio ? 'audio' : 'text',
    status: 'uploading',
    progress: 0,
  };
  store.addFile(newFile);
  try {
    const result = await uploadFile({
      file,
      businessType: FILE_BUSINESS_TYPE.PROJECT_DOCUMENT,
      projectId: store.selectedProjectId || undefined,
      onProgress: (progress) => {
        store.updateFile(id, { progress });
      },
    });
    store.updateFile(id, {
      progress: 100,
      fileId: result.id,
      status: isAudio ? 'processing' : 'ready',
    });
    if (isAudio && result.id) {
      pollForProcessing(id, result.id, file.name);
    } else {
      handleFileProcessed(`Uploaded: ${file.name}`, file.name);
    }
  } catch (error) {
    store.updateFile(id, { status: 'error' });
    console.error('Upload failed:', error);
  }
}

function handleDrop(e: DragEvent): void {
  e.preventDefault();
  isDragging.value = false;
  const droppedFiles = Array.from(e.dataTransfer?.files || []);
  droppedFiles.forEach((file) => simulateUpload(file).catch(console.error));
}

function handleFileSelect(e: Event): void {
  const target = e.target as HTMLInputElement;
  const selectedFiles = Array.from(target.files || []);
  selectedFiles.forEach((file) => simulateUpload(file).catch(console.error));
}

function removeFile(id: string): void {
  store.removeFile(id);
}

function handleFileProcessed(_content: string, fileName: string): void {
  const systemMessage: ChatMessage = {
    id: Math.random().toString(36).slice(2),
    role: 'assistant',
    content: `I've processed "${fileName}" successfully. The transcript and logic flags have been generated. I can now generate a PRD or identify questions for the client.`,
    timestamp: new Date(),
    artifacts: [{ type: 'prd', label: 'Generate PRD' }],
  };
  store.addMessage(systemMessage);
}
</script>
