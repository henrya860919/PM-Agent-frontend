<template>
  <div class="flex h-full flex-col">
    <Card class="flex flex-1 flex-col overflow-hidden rounded-none border-x-0 border-t-0">
      <!-- Header -->
      <CardHeader class="flex flex-row items-center justify-between space-y-0 border-b border-border py-4 pb-3">
        <div>
          <CardTitle class="text-base">File Records</CardTitle>
          <p class="text-xs text-muted-foreground mt-0.5">{{ total }} documents archived</p>
        </div>
        <div class="flex items-center gap-3">
          <input
            ref="fileInputRef"
            type="file"
            multiple
            accept="audio/*,.txt,.pdf,.md,image/*"
            class="hidden"
            @change="handleFileSelect"
          />
          <Button
            variant="outline"
            size="sm"
            class="gap-1.5"
            :disabled="uploading"
            @click="fileInputRef?.click()"
          >
            <Upload v-if="!uploading" class="h-3.5 w-3.5" />
            <Loader2 v-else class="h-3.5 w-3.5 animate-spin" />
            {{ uploading ? '上傳中…' : '上傳檔案' }}
          </Button>
          <div class="relative w-56">
          <Search class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Search files..."
            class="h-9 bg-secondary pl-8 text-sm border-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
          />
          </div>
        </div>
      </CardHeader>

      <!-- Type Filters（分段控制：淺灰底、選中白底圓角） -->
      <div class="border-b border-border px-6 py-2">
        <Tabs v-model="typeFilter" class="w-full">
          <TabsList class="justify-start rounded-lg bg-muted p-1 h-auto gap-0">
            <TabsTrigger
              v-for="t in typeFilters"
              :key="t"
              :value="t"
              class="w-auto min-w-0 flex-shrink-0 rounded-md capitalize px-4 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:shadow-sm"
            >
              {{ t }}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <!-- Table -->
      <CardContent class="flex-1 overflow-hidden p-0">
        <ScrollArea class="h-full">
          <div v-if="isLoading" class="flex h-48 items-center justify-center">
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
          <div v-else-if="error" class="flex h-48 items-center justify-center">
            <p class="text-sm text-destructive">{{ error }}</p>
          </div>
          <div v-else-if="filteredFiles.length === 0" class="flex h-48 items-center justify-center">
            <p class="text-sm text-muted-foreground">No files found</p>
          </div>
          <div v-else class="px-6 py-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-[40%]">Name</TableHead>
                  <TableHead class="w-20 text-right">Size</TableHead>
                  <TableHead class="w-28 text-right">Date</TableHead>
                  <TableHead class="w-24 text-right">Source</TableHead>
                  <TableHead class="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="file in filteredFiles"
                  :key="file.id"
                  class="group"
                >
                  <TableCell>
                    <div class="flex items-center gap-3 min-w-0">
                      <div
                        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary"
                      >
                        <component
                          :is="getFileIcon(file)"
                          :class="cn('h-4 w-4', getFileIconStyle(file))"
                        />
                      </div>
                      <div class="min-w-0">
                        <p class="truncate text-sm font-medium">{{ file.originalFilename }}</p>
                        <Badge
                          variant="outline"
                          class="mt-0.5 text-[10px] h-4 capitalize border-border text-muted-foreground"
                        >
                          {{ getFileType(file) }}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell class="text-right text-muted-foreground text-xs">
                    {{ formatFileSize(file.fileSize) }}
                  </TableCell>
                  <TableCell class="text-right">
                    <span class="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                      <Calendar class="h-3 w-3" />
                      {{ formatDate(file.createdAt) }}
                    </span>
                  </TableCell>
                  <TableCell class="text-right text-muted-foreground text-xs">
                    Upload
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        class="h-8 w-8"
                        aria-label="Preview"
                        @click="handlePreview(file)"
                      >
                        <Eye class="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        class="h-8 w-8"
                        aria-label="Download"
                        @click="handleDownload(file)"
                      >
                        <Download class="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        class="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        aria-label="Delete"
                        :disabled="deletingId === file.id"
                        @click="handleDelete(file)"
                      >
                        <Trash2 v-if="deletingId !== file.id" class="h-3.5 w-3.5" />
                        <Loader2 v-else class="h-3.5 w-3.5 animate-spin" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
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
  Upload,
  Loader2,
  Trash2,
} from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import apiClient from '@/services/client';
import { fileRecordsApi } from '@/services/endpoints/file-records';
import type { FileRecord } from '@/types/file';
import { useWorkspaceStore } from '@/stores/workspace';
import { uploadFile } from '@/utils/upload';
import { FILE_BUSINESS_TYPE, FILE_TYPE_FILTERS, type FileTypeFilter } from '@/constants/file';

const store = useWorkspaceStore();

const fileInputRef = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const deletingId = ref<string | null>(null);
const files = ref<FileRecord[]>([]);
const total = ref(0);
const isLoading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref('');
const typeFilter = ref<FileTypeFilter>('all');
const typeFilters = FILE_TYPE_FILTERS;

function getFileType(file: FileRecord): string {
  if (file.mimeType.startsWith('audio/')) return 'audio';
  if (file.mimeType.startsWith('image/')) return 'image';
  if (file.mimeType.startsWith('text/')) return 'transcript';
  return 'document';
}

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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const filteredFiles = computed(() => {
  return files.value.filter((f) => {
    const matchesSearch = f.originalFilename.toLowerCase().includes(searchQuery.value.toLowerCase());
    const fileType = getFileType(f);
    const matchesType = typeFilter.value === 'all' || fileType === typeFilter.value;
    return matchesSearch && matchesType;
  });
});

async function loadFiles() {
  isLoading.value = true;
  error.value = null;
  try {
    const result = await fileRecordsApi.list({
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

async function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  const selectedFiles = Array.from(target.files ?? []);
  target.value = '';
  if (selectedFiles.length === 0) return;
  uploading.value = true;
  try {
    for (const file of selectedFiles) {
      await uploadFile({
        file,
        businessType: FILE_BUSINESS_TYPE.PROJECT_DOCUMENT,
        projectId: store.selectedProjectId || undefined,
      });
    }
    await loadFiles();
  } catch (err) {
    console.error('Upload failed:', err);
    error.value = err instanceof Error ? err.message : '上傳失敗';
  } finally {
    uploading.value = false;
  }
}

function getFileApiPath(file: FileRecord): string {
  return file.url.replace(/^\/api/, '') || file.url;
}

function handlePreview(file: FileRecord) {
  const url = apiClient.defaults.baseURL
    ? `${apiClient.defaults.baseURL.replace(/\/api\/?$/, '')}${file.url}`
    : file.url;
  window.open(url, '_blank');
}

async function handleDownload(file: FileRecord) {
  try {
    const path = `${getFileApiPath(file)}?download=true`;
    const res = await apiClient.get(path, { responseType: 'blob' });
    const blob = res.data as Blob;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.originalFilename;
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Download failed:', err);
  }
}

async function handleDelete(file: FileRecord) {
  if (!window.confirm(`確定要刪除「${file.originalFilename}」嗎？此操作無法復原。`)) {
    return;
  }
  deletingId.value = file.id;
  try {
    await fileRecordsApi.delete(file.id);
    await loadFiles();
  } catch (err) {
    console.error('Delete failed:', err);
    error.value = err instanceof Error ? err.message : '刪除失敗';
  } finally {
    deletingId.value = null;
  }
}

watch([searchQuery, typeFilter], () => {
  loadFiles();
});

watch(() => store.selectedProjectId, () => {
  loadFiles();
});

onMounted(() => {
  loadFiles();
});
</script>
