<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-border px-6 py-3">
      <div>
        <h2 class="text-sm font-semibold text-foreground">File Records</h2>
        <p class="text-xs text-muted-foreground">{{ total }} documents archived</p>
      </div>
      <div class="relative w-56">
        <Search class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="Search files..."
          class="h-8 bg-secondary pl-8 text-xs border-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
        />
      </div>
    </div>

    <!-- Type Filters -->
    <div class="flex items-center gap-2 border-b border-border px-6 py-2">
      <button
        v-for="t in typeFilters"
        :key="t"
        @click="typeFilter = t"
        :class="
          cn(
            'rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors',
            typeFilter === t
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
          )
        "
      >
        {{ t }}
      </button>
    </div>

    <!-- Table -->
    <ScrollArea class="flex-1">
      <div v-if="isLoading" class="flex h-full items-center justify-center">
        <p class="text-sm text-muted-foreground">Loading...</p>
      </div>
      <div v-else-if="error" class="flex h-full items-center justify-center">
        <p class="text-sm text-destructive">{{ error }}</p>
      </div>
      <div v-else-if="filteredFiles.length === 0" class="flex h-full items-center justify-center">
        <p class="text-sm text-muted-foreground">No files found</p>
      </div>
      <div v-else class="px-6 py-3">
        <!-- Table Header -->
        <div
          class="mb-2 flex items-center gap-4 px-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
        >
          <span class="flex-1">Name</span>
          <span class="w-20 text-right">Size</span>
          <span class="w-28 text-right">Date</span>
          <span class="w-24 text-right">Source</span>
          <span class="w-16" />
        </div>

        <div class="flex flex-col gap-1">
          <div
            v-for="file in filteredFiles"
            :key="file.id"
            class="group flex items-center gap-4 rounded-md px-3 py-2.5 transition-colors hover:bg-secondary/50"
          >
            <div class="flex flex-1 items-center gap-3 min-w-0">
              <div
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary"
              >
                <component :is="getFileIcon(file)" :class="cn('h-4 w-4', getFileIconStyle(file))" />
              </div>
              <div class="min-w-0">
                <p class="truncate text-xs font-medium text-foreground">{{ file.originalFilename }}</p>
                <Badge
                  variant="outline"
                  class="mt-0.5 text-[10px] h-4 capitalize border-border text-muted-foreground"
                >
                  {{ getFileType(file) }}
                </Badge>
              </div>
            </div>
            <span class="w-20 text-right text-xs text-muted-foreground">{{
              formatFileSize(file.fileSize)
            }}</span>
            <span class="flex w-28 items-center justify-end gap-1 text-xs text-muted-foreground">
              <Calendar class="h-3 w-3" />
              {{ formatDate(file.createdAt) }}
            </span>
            <span class="w-24 text-right text-xs text-muted-foreground">Upload</span>
            <div
              class="flex w-16 items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <button
                @click="handlePreview(file)"
                class="rounded-md p-1 text-muted-foreground hover:bg-card hover:text-foreground"
                aria-label="Preview"
              >
                <Eye class="h-3.5 w-3.5" />
              </button>
              <button
                @click="handleDownload(file)"
                class="rounded-md p-1 text-muted-foreground hover:bg-card hover:text-foreground"
                aria-label="Download"
              >
                <Download class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import {
  FileAudio,
  FileText,
  FileImage,
  Download,
  Eye,
  Search,
  Calendar,
} from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fileApi } from '@/services/endpoints/file';
import type { FileRecord } from '@/types/file';
import { usePMDashboardStore } from '@/stores/pm-dashboard';

const store = usePMDashboardStore();

const files = ref<FileRecord[]>([]);
const total = ref(0);
const isLoading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref('');
const typeFilter = ref<'all' | 'audio' | 'transcript' | 'document' | 'image'>('all');

const typeFilters: Array<'all' | 'audio' | 'transcript' | 'document' | 'image'> = [
  'all',
  'audio',
  'transcript',
  'document',
  'image',
];

// 獲取檔案類型
function getFileType(file: FileRecord): string {
  if (file.mimeType.startsWith('audio/')) return 'audio';
  if (file.mimeType.startsWith('image/')) return 'image';
  if (file.mimeType.startsWith('text/')) return 'transcript';
  return 'document';
}

// 獲取檔案圖標
function getFileIcon(file: FileRecord) {
  const type = getFileType(file);
  switch (type) {
    case 'audio':
      return FileAudio;
    case 'image':
      return FileImage;
    default:
      return FileText;
  }
}

// 獲取檔案圖標樣式
function getFileIconStyle(file: FileRecord): string {
  const type = getFileType(file);
  switch (type) {
    case 'audio':
      return 'text-chart-1';
    case 'image':
      return 'text-chart-3';
    case 'transcript':
      return 'text-primary';
    default:
      return 'text-chart-2';
  }
}

// 格式化檔案大小
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// 格式化日期
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// 過濾檔案
const filteredFiles = computed(() => {
  return files.value.filter((f) => {
    const matchesSearch = f.originalFilename.toLowerCase().includes(searchQuery.value.toLowerCase());
    const fileType = getFileType(f);
    const matchesType = typeFilter.value === 'all' || fileType === typeFilter.value;
    return matchesSearch && matchesType;
  });
});

// 載入檔案列表
async function loadFiles() {
  isLoading.value = true;
  error.value = null;
  try {
    const result = await fileApi.list({
      projectId: store.selectedProjectId || undefined,
      type: typeFilter.value,
      search: searchQuery.value || undefined,
      page: 1,
      limit: 100,
    });
    files.value = result.files;
    total.value = result.total;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load files';
  } finally {
    isLoading.value = false;
  }
}

// 預覽檔案
function handlePreview(file: FileRecord) {
  window.open(file.url, '_blank');
}

// 下載檔案
function handleDownload(file: FileRecord) {
  const link = document.createElement('a');
  link.href = `${file.url}?download=true`;
  link.download = file.originalFilename;
  link.click();
}

// 監聽搜尋和類型篩選變化
watch([searchQuery, typeFilter], () => {
  loadFiles();
});

// 監聽專案變化
watch(() => store.selectedProjectId, () => {
  loadFiles();
});

onMounted(() => {
  loadFiles();
});
</script>
