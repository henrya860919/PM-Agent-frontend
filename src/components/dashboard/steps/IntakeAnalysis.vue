<template>
  <ScrollArea class="h-full">
    <div class="flex flex-col gap-6 p-6">
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

      <!-- Upload Section -->
      <section>
        <h3 class="mb-1 text-sm font-semibold text-foreground">Upload Files</h3>
        <p class="mb-3 text-xs text-muted-foreground">
          Add audio recordings, transcripts, or reference documents
        </p>

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
          <p class="mt-2 text-sm font-medium text-foreground">Drop files here or click to browse</p>
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

        <!-- File list -->
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

      <!-- Transcript Section -->
      <section>
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="text-sm font-semibold text-foreground">Transcript</h3>
            <p class="text-xs text-muted-foreground">Auto-generated from uploaded audio</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            @click="showTranscript = !showTranscript"
            class="text-xs h-7 text-muted-foreground hover:text-foreground"
          >
            {{ showTranscript ? 'Collapse' : 'Expand' }}
          </Button>
        </div>
        <Textarea
          v-if="showTranscript"
          :value="displayTranscript"
          readonly
          class="min-h-[180px] resize-none bg-secondary text-xs font-mono leading-relaxed border-none text-secondary-foreground"
        />
      </section>

      <!-- Logic Filter Section -->
      <section>
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="text-sm font-semibold text-foreground">Logic Filter</h3>
            <p class="text-xs text-muted-foreground">Flagged issues from transcript analysis</p>
          </div>
          <Badge variant="outline" class="text-[10px] border-primary/30 text-primary">
            {{ logicFlags.length }} flags
          </Badge>
        </div>

        <div class="flex flex-col gap-2">
          <div
            v-for="flag in logicFlags"
            :key="flag.id"
            :class="
              cn('rounded-md border p-3', severityStyles[flag.severity])
            "
          >
            <div class="flex items-start gap-2.5">
              <component :is="categoryIcons[flag.category]" class="h-4 w-4 shrink-0 mt-0.5" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <Badge
                    variant="outline"
                    :class="cn('text-[10px] h-4', severityBadge[flag.severity])"
                  >
                    {{ categoryLabels[flag.category] }}
                  </Badge>
                  <Badge
                    variant="outline"
                    :class="cn('text-[10px] h-4 capitalize', severityBadge[flag.severity])"
                  >
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
    </div>
  </ScrollArea>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Upload,
  FileAudio,
  FileText,
  X,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  ArrowRightLeft,
  GitBranch,
} from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePMDashboardStore } from '@/stores/pm-dashboard';
import { fileApi } from '@/services/endpoints/file';
import { devApi } from '@/services/endpoints/dev';
import { uploadFile } from '@/utils/upload';
import { FILE_BUSINESS_TYPE } from '@/constants/file';
import type { UploadedFile, LogicFlag, LogicFlagCategory, LogicFlagSeverity } from '@/types/pm-dashboard';

interface Emits {
  (e: 'file-processed', content: string, fileName: string): void;
}

const emit = defineEmits<Emits>();
const store = usePMDashboardStore();

const isDragging = ref<boolean>(false);
const showTranscript = ref<boolean>(true);
const fileInputRef = ref<HTMLInputElement | null>(null);

const devModeAvailable = ref<boolean>(false);
const mockAudioEnabled = ref<boolean>(false);

onMounted(async () => {
  const res = await devApi.getMockAudio();
  if (res != null) {
    devModeAvailable.value = true;
    mockAudioEnabled.value = res.enabled;
  }
});

async function toggleMockAudio(): Promise<void> {
  const next = !mockAudioEnabled.value;
  const res = await devApi.setMockAudio(next);
  if (res != null) {
    mockAudioEnabled.value = res.enabled;
  }
}

const POLL_INTERVAL_MS = 2500;
const MAX_POLL_ATTEMPTS = 120; // 5 min

const displayTranscript = computed(() => {
  const t = store.transcript?.trim();
  return t || '上傳音檔後將自動轉錄，完成後會顯示於此。';
});

const categoryIcons: Record<LogicFlagCategory, any> = {
  permissions: ShieldAlert,
  'import-export': ArrowRightLeft,
  hierarchy: GitBranch,
  'data-flow': AlertTriangle,
};

const categoryLabels: Record<LogicFlagCategory, string> = {
  permissions: 'Permissions',
  'import-export': 'Import/Export',
  hierarchy: 'Hierarchy',
  'data-flow': 'Data Flow',
};

const severityStyles: Record<LogicFlagSeverity, string> = {
  critical: 'border-destructive/30 bg-destructive/5 text-destructive',
  warning: 'border-chart-3/30 bg-chart-3/5 text-chart-3',
  info: 'border-chart-2/30 bg-chart-2/5 text-chart-2',
};

const severityBadge: Record<LogicFlagSeverity, string> = {
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
  warning: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  info: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
};

const files = computed(() => store.files);
const logicFlags = computed(() => store.logicFlags);

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
      emit('file-processed', `Uploaded: ${file.name}`, file.name);
    }
  } catch (error) {
    store.updateFile(id, { status: 'error' });
    console.error('Upload failed:', error);
  }
}

function getProcessingStepLabel(status: {
  transcriptStatus: string;
  analysisStatus: string;
}): string {
  if (status.transcriptStatus !== 'completed') {
    return '轉錄中 (1/2)';
  }
  if (
    status.analysisStatus === 'not_started' ||
    status.analysisStatus === 'processing'
  ) {
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
      const status = await fileApi.getProcessingStatus(backendFileId);
      const stepLabel = getProcessingStepLabel(status);
      store.updateFile(frontendFileId, { processingStep: stepLabel });

      if (status.overall === 'completed') {
        const [transcriptRes, analysisRes] = await Promise.all([
          fileApi.getTranscript(backendFileId),
          fileApi.getAnalysis(backendFileId),
        ]);
        if (transcriptRes?.transcript) {
          store.setTranscript(transcriptRes.transcript);
        }
        if (analysisRes?.logicFlags?.length) {
          store.setLogicFlags(
            analysisRes.logicFlags.map((f) => ({
              id: f.id,
              category: f.category as LogicFlag['category'],
              severity: f.severity as LogicFlag['severity'],
              message: f.message,
              source: f.source,
            })),
          );
        } else {
          store.setLogicFlags([]);
        }
        store.updateFile(frontendFileId, {
          status: 'ready',
          processingStep: undefined,
        });
        emit('file-processed', `Transcript from ${fileName}: analysis ready.`, fileName);
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
        // 轉錄可能已成功、僅分析失敗，仍取轉錄讓使用者能看到 Whisper 結果
        if (status.transcriptStatus === 'completed') {
          try {
            const transcriptRes = await fileApi.getTranscript(backendFileId);
            if (transcriptRes?.transcript) {
              store.setTranscript(transcriptRes.transcript);
            }
          } catch {
            // 忽略
          }
        }
        return;
      }
    } catch {
      // 繼續輪詢，保留目前 processingStep
    }
    setTimeout(poll, POLL_INTERVAL_MS);
  };
  store.updateFile(frontendFileId, { processingStep: '轉錄中 (1/2)' });
  setTimeout(poll, POLL_INTERVAL_MS);
}

function handleDrop(e: DragEvent): void {
  e.preventDefault();
  isDragging.value = false;
  const droppedFiles = Array.from(e.dataTransfer?.files || []);
  droppedFiles.forEach((file) => {
    simulateUpload(file).catch(console.error);
  });
}

function handleFileSelect(e: Event): void {
  const target = e.target as HTMLInputElement;
  const selectedFiles = Array.from(target.files || []);
  selectedFiles.forEach((file) => {
    simulateUpload(file).catch(console.error);
  });
}

function removeFile(id: string): void {
  store.removeFile(id);
}

</script>
