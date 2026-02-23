<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-border px-4 py-3">
      <div>
        <h2 class="text-sm font-semibold text-foreground">{{ title }}</h2>
        <p class="text-xs text-muted-foreground">{{ subtitle }}</p>
      </div>
      <div class="flex h-6 items-center gap-1.5 rounded-full bg-primary/10 px-2.5">
        <span class="h-1.5 w-1.5 rounded-full bg-primary" />
        <span class="text-[10px] font-medium text-primary">Online</span>
      </div>
    </div>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="messages.length === 0" class="flex h-full flex-col items-center justify-center">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <Sparkles class="h-6 w-6 text-primary" />
        </div>
        <h3 class="mt-4 text-sm font-semibold text-foreground">{{ emptyTitle }}</h3>
        <p class="mt-1 max-w-[280px] text-center text-xs text-muted-foreground leading-relaxed">
          {{ emptyDescription }}
        </p>

        <!-- Suggestion chips -->
        <div v-if="suggestionPrompts.length" class="mt-6 flex flex-wrap justify-center gap-2 px-4">
          <button
            v-for="prompt in suggestionPrompts"
            :key="prompt"
            @click="handleSendMessage(prompt)"
            class="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            {{ prompt }}
          </button>
        </div>
      </div>

      <div v-else class="flex flex-col gap-4">
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="
            cn(
              'group flex gap-3',
              msg.role === 'user' ? 'justify-end' : 'justify-start',
            )
          "
        >
          <div v-if="msg.role === 'assistant'" class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
            <Sparkles class="h-3.5 w-3.5 text-primary-foreground" />
          </div>

          <div
            :class="
              cn(
                'relative max-w-[85%] rounded-lg px-3 py-2.5',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground',
              )
            "
          >
            <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ msg.content }}</p>

            <!-- Artifact buttons -->
            <div v-if="msg.artifacts && msg.artifacts.length > 0" class="mt-2.5 flex flex-wrap gap-2 border-t border-border/50 pt-2.5">
              <button
                v-for="artifact in msg.artifacts"
                :key="artifact.label"
                @click="handleViewArtifact(artifact.type)"
                class="flex items-center gap-1.5 rounded-md bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                <FileText v-if="artifact.type === 'prd'" class="h-3 w-3 text-primary" />
                <LayoutDashboard v-else class="h-3 w-3 text-primary" />
                {{ artifact.label }}
              </button>
            </div>

            <!-- Copy button -->
            <Tooltip v-if="msg.role === 'assistant'">
              <TooltipTrigger as-child>
                <button
                  @click="handleCopy(msg.id, msg.content)"
                  class="absolute -right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Copy message"
                >
                  <div class="flex h-6 w-6 items-center justify-center rounded-md bg-card">
                    <Check v-if="copiedId === msg.id" class="h-3 w-3 text-primary" />
                    <Copy v-else class="h-3 w-3 text-muted-foreground" />
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" class="text-xs">
                {{ copiedId === msg.id ? 'Copied' : 'Copy' }}
              </TooltipContent>
            </Tooltip>
          </div>

          <div v-if="msg.role === 'user'" class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary">
            <User class="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="isLoading" class="flex gap-3">
          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
            <Sparkles class="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <div class="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2.5">
            <Loader2 class="h-3.5 w-3.5 animate-spin text-primary" />
            <span class="text-xs text-muted-foreground">Thinking...</span>
          </div>
        </div>

        <div ref="messagesEndRef" />
      </div>
    </div>

    <!-- Input -->
    <div class="border-t border-border p-4">
      <div class="flex items-end gap-2">
        <Textarea
          ref="textareaRef"
          v-model="input"
          @keydown="handleKeyDown"
          @input="handleInput"
          :placeholder="placeholder"
          rows="1"
          class="min-h-[40px] max-h-[120px] resize-none bg-secondary text-sm border-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
        />
        <Button
          @click="handleSend"
          :disabled="!input.trim() || isLoading"
          size="icon"
          class="h-10 w-10 shrink-0"
        >
          <SendHorizontal class="h-4 w-4" />
          <span class="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import {
  SendHorizontal,
  Sparkles,
  User,
  Copy,
  Check,
  FileText,
  LayoutDashboard,
  Loader2,
} from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { ChatMessage, ArtifactType } from '@/types/pm-dashboard';

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
  /** 標題，預設 "AI Agent" */
  title?: string;
  /** 副標題，預設 "Ask anything about your project" */
  subtitle?: string;
  /** 空狀態標題，預設 "How can I help?" */
  emptyTitle?: string;
  /** 空狀態說明 */
  emptyDescription?: string;
  /** 輸入框 placeholder */
  placeholder?: string;
  /** 建議問題列表，空陣列則不顯示 */
  suggestionPrompts?: string[];
}

interface Emits {
  (e: 'send-message', message: string): void;
  (e: 'view-artifact', type: ArtifactType): void;
}

const props = withDefaults(
  defineProps<Props>(),
  {
    title: 'AI Agent',
    subtitle: 'Ask anything about your project',
    emptyTitle: 'How can I help?',
    emptyDescription:
      'Upload a transcript and I can generate PRDs, create UI prototypes, or answer questions about your project.',
    placeholder: 'Ask your PM Agent...',
    suggestionPrompts: () => [
      'Generate a PRD from my latest transcript',
      'Create a React prototype for the checkout flow',
      'Summarize key decisions from the stakeholder call',
      'Identify risks and dependencies',
    ],
  },
);

const emit = defineEmits<Emits>();

const input = ref<string>('');
const copiedId = ref<string | null>(null);
const messagesEndRef = ref<HTMLDivElement | null>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

// Auto scroll to bottom when messages change
watch(
  () => props.messages,
  () => {
    nextTick(() => {
      messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' });
    });
  },
  { deep: true },
);

function handleSend(): void {
  if (!input.value.trim() || props.isLoading) return;
  emit('send-message', input.value.trim());
  input.value = '';
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
  }
}

function handleSendMessage(message: string): void {
  if (props.isLoading) return;
  emit('send-message', message);
}

function handleKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
}

function handleInput(e: Event): void {
  const target = e.target as HTMLTextAreaElement;
  target.style.height = 'auto';
  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
}

async function handleCopy(id: string, content: string): Promise<void> {
  await navigator.clipboard.writeText(content);
  copiedId.value = id;
  setTimeout(() => {
    copiedId.value = null;
  }, 2000);
}

function handleViewArtifact(type: ArtifactType): void {
  emit('view-artifact', type);
}
</script>
