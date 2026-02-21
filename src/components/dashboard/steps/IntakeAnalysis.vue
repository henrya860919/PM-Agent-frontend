<template>
  <ScrollArea class="h-full">
    <div class="flex flex-col gap-6 p-6">
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
              <div v-if="file.status === 'uploading'" class="mt-1 h-1 w-full overflow-hidden rounded-full bg-card">
                <div
                  class="h-full rounded-full bg-primary transition-all"
                  :style="{ width: `${file.progress}%` }"
                />
              </div>
            </div>
            <div class="shrink-0">
              <span v-if="file.status === 'uploading'" class="text-[10px] text-muted-foreground">
                {{ Math.round(file.progress) }}%
              </span>
              <Loader2 v-if="file.status === 'processing'" class="h-4 w-4 animate-spin text-primary" />
              <CheckCircle2 v-if="file.status === 'ready'" class="h-4 w-4 text-primary" />
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
          :value="DEMO_TRANSCRIPT"
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

const DEMO_TRANSCRIPT = `Meeting Transcript - Stakeholder Review (Feb 12, 2026)

[00:00] Sarah (PM): Let's start with the checkout redesign priorities.

[01:23] Mike (Engineering): We need to decide on the payment gateway first. The current Stripe integration has rate limiting issues at scale.

[03:45] Sarah: Good point. Let's also discuss the user role permissions for the admin panel. Currently, there's no RBAC defined.

[05:12] Lisa (Design): The export functionality needs clarity - are we doing CSV, PDF, or both? The current implementation only supports JSON.

[07:30] Mike: Also, the team hierarchy is complex. Nested teams could create recursive permission lookups if we're not careful.

[09:15] Sarah: Let's flag all of these. I want the PM agent to track these as potential risks.`;

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
    // 上傳檔案到後端
    await uploadFile({
      file,
      businessType: FILE_BUSINESS_TYPE.PROJECT_DOCUMENT,
      projectId: store.selectedProjectId || undefined,
      onProgress: (progress) => {
        store.updateFile(id, { progress });
      },
    });

    // 上傳成功
    store.updateFile(id, { progress: 100, status: 'processing' });
    
    // 模擬處理時間
    setTimeout(() => {
      store.updateFile(id, { status: 'ready' });
      emit('file-processed', `Transcript from ${file.name}: Key discussion points identified.`, file.name);
    }, 1500);
  } catch (error) {
    // 上傳失敗
    store.updateFile(id, { status: 'error' });
    console.error('Upload failed:', error);
  }
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

// Initialize demo logic flags
onMounted(() => {
  const demoFlags: LogicFlag[] = [
    {
      id: 'f1',
      category: 'permissions',
      severity: 'critical',
      message: 'Role-based access control not defined for admin panel routes',
      source: 'Stakeholder Meeting Transcript',
    },
    {
      id: 'f2',
      category: 'import-export',
      severity: 'warning',
      message: 'CSV export format unspecified; may conflict with existing integrations',
      source: 'Stakeholder Meeting Transcript',
    },
    {
      id: 'f3',
      category: 'hierarchy',
      severity: 'warning',
      message: 'Nested team structures may cause recursive permission checks',
      source: 'Tech Review Notes',
    },
    {
      id: 'f4',
      category: 'data-flow',
      severity: 'info',
      message: 'Real-time sync between dashboard and mobile app not addressed',
      source: 'Stakeholder Meeting Transcript',
    },
  ];
  store.setLogicFlags(demoFlags);
});
</script>
