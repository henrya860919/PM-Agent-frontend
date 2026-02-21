<template>
  <div class="flex h-screen w-screen overflow-hidden bg-background">
    <!-- Sidebar -->
    <ProjectSidebar
      :selected-project-id="store.selectedProjectId"
      :active-view="store.activeView"
      @select-project="store.setSelectedProjectId"
      @select-view="store.setActiveView"
    />

    <!-- Main Content -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Step Navigation (only in workspace view) -->
      <div v-if="store.activeView === 'workspace'" class="flex items-center border-b border-border bg-card">
        <nav class="flex items-center" aria-label="Workflow steps">
          <div v-for="(step, index) in STEPS" :key="step.step" class="flex items-center">
            <button
              @click="store.setCurrentStep(step.step)"
              :class="
                cn(
                  'flex items-center gap-2 px-5 py-3 text-xs font-medium transition-colors relative',
                  isActiveStep(step.step)
                    ? 'text-primary'
                    : isCompleteStep(step.step)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )
              "
            >
              <div
                :class="
                  cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold transition-colors',
                    isActiveStep(step.step)
                      ? 'bg-primary text-primary-foreground'
                      : isCompleteStep(step.step)
                      ? 'bg-primary/20 text-primary'
                      : 'bg-secondary text-muted-foreground',
                  )
                "
              >
                {{ step.step }}
              </div>
              <component :is="step.icon" class="h-3.5 w-3.5" />
              <span class="hidden lg:inline">{{ step.label }}</span>
              <span
                v-if="isActiveStep(step.step)"
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            </button>
            <ChevronRight
              v-if="index < STEPS.length - 1"
              class="h-3 w-3 text-muted-foreground/40"
            />
          </div>
        </nav>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-hidden">
        <div v-if="store.activeView === 'workspace'" class="h-full flex">
          <!-- Step Content -->
          <div class="flex-1 overflow-hidden" :style="{ width: workspaceContentWidth }">
            <component :is="renderWorkspaceContent()" />
          </div>

          <!-- Chat Panel -->
          <div class="border-l border-border overflow-hidden" :style="{ width: chatPanelWidth }">
            <ChatPanel
              :messages="store.messages"
              :is-loading="store.isLoading"
              @send-message="handleSendMessage"
              @view-artifact="handleViewArtifact"
            />
          </div>
        </div>
        <div v-else class="h-full">
          <component :is="renderViewContent()" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted } from 'vue';
import {
  ClipboardCheck,
  MessageCircleQuestion,
  Network,
  FileText,
  ChevronRight,
} from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { usePMDashboardStore } from '@/stores/pm-dashboard';
import ProjectSidebar from './ProjectSidebar.vue';
import ChatPanel from './ChatPanel.vue';
import IntakeAnalysis from './steps/IntakeAnalysis.vue';
import QABacklog from './steps/QABacklog.vue';
import ArchitectureStories from './steps/ArchitectureStories.vue';
import PRDEngine from './steps/PRDEngine.vue';
import FileRecords from './views/FileRecords.vue';
import FeatureList from './views/FeatureList.vue';
import DetailedSpecs from './views/DetailedSpecs.vue';
import type { WorkflowStep, ArtifactType, ChatMessage } from '@/types/pm-dashboard';

const store = usePMDashboardStore();

// 初始化專案資料
onMounted(async () => {
  await store.initializeProjects();
});

const STEPS: { step: WorkflowStep; label: string; icon: any }[] = [
  { step: 1, label: 'Intake & Analysis', icon: ClipboardCheck },
  { step: 2, label: 'Q&A Backlog', icon: MessageCircleQuestion },
  { step: 3, label: 'Architecture & Stories', icon: Network },
  { step: 4, label: 'PRD Engine', icon: FileText },
];

// Panel widths (simplified, can be made resizable later)
const workspaceContentWidth = computed(() => '55%');
const chatPanelWidth = computed(() => '45%');

function isActiveStep(step: WorkflowStep): boolean {
  return store.currentStep === step;
}

function isCompleteStep(step: WorkflowStep): boolean {
  return store.currentStep > step;
}

function renderWorkspaceContent() {
  switch (store.currentStep) {
    case 1:
      return h(IntakeAnalysis, {
        onFileProcessed: handleFileProcessed,
      });
    case 2:
      return h(QABacklog);
    case 3:
      return h(ArchitectureStories);
    case 4:
      return h(PRDEngine);
    default:
      return null;
  }
}

function renderViewContent() {
  switch (store.activeView) {
    case 'file-records':
      return h(FileRecords);
    case 'feature-list':
      return h(FeatureList);
    case 'detailed-specs':
      return h(DetailedSpecs);
    default:
      return null;
  }
}

const SIMULATED_RESPONSES: Record<string, { content: string; artifacts?: ChatMessage['artifacts'] }> = {
  'Generate a PRD from my latest transcript': {
    content:
      "I've analyzed the transcript from your latest stakeholder meeting and generated a comprehensive PRD. The document covers the checkout redesign initiative, including user stories, technical requirements, and success metrics. Switch to the PRD Engine step to view and edit it.",
    artifacts: [{ type: 'prd', label: 'Go to PRD Engine' }],
  },
  'Create a React prototype for the checkout flow': {
    content:
      "I've created an interactive React prototype for the new checkout flow based on the requirements. It features a 3-step process (Shipping, Payment, Review) with progress indicators. Check the Architecture & Stories step for the functional map.",
    artifacts: [{ type: 'prototype', label: 'View Architecture' }],
  },
  'Summarize key decisions from the stakeholder call': {
    content:
      'Here are the key decisions from the stakeholder call:\n\n1. Single-page checkout will replace the current multi-step flow\n2. Apple Pay and Google Pay will be prioritized for launch\n3. Guest checkout will be maintained but with optional account creation post-purchase\n4. Target launch date moved to Q2 to accommodate design system updates\n5. A/B testing will run for 4 weeks before full rollout',
  },
  'Identify risks and dependencies': {
    content:
      'Based on the transcript analysis, here are the identified risks:\n\nRisks:\n- Payment gateway migration may cause temporary downtime\n- Design system v3 timeline uncertainty\n- Mobile performance targets may require additional sprints\n\nDependencies:\n- Backend API v2 endpoints (Sprint 4)\n- Updated design tokens from design team\n- Security audit before PCI compliance review\n- QA environment setup for payment testing',
  },
};

function getSimulatedResponse(message: string): { content: string; artifacts?: ChatMessage['artifacts'] } {
  if (SIMULATED_RESPONSES[message]) return SIMULATED_RESPONSES[message];

  const lower = message.toLowerCase();
  if (lower.includes('prd') || lower.includes('requirements') || lower.includes('document')) {
    return {
      content: "I've generated a PRD based on the available project context. Switch to the PRD Engine step to view and edit the document.",
      artifacts: [{ type: 'prd', label: 'Go to PRD Engine' }],
    };
  }
  if (lower.includes('prototype') || lower.includes('ui') || lower.includes('architecture')) {
    return {
      content: "I've mapped the functional architecture and user stories. Check the Architecture & Stories step for details.",
      artifacts: [{ type: 'prototype', label: 'View Architecture' }],
    };
  }
  if (lower.includes('risk') || lower.includes('depend')) {
    return SIMULATED_RESPONSES['Identify risks and dependencies'];
  }
  if (lower.includes('summar') || lower.includes('decision')) {
    return SIMULATED_RESPONSES['Summarize key decisions from the stakeholder call'];
  }

  return {
    content: "I've reviewed the project context. I can help generate PRDs, map architecture, identify risks, or create Q&A items for client follow-up. What would you like to focus on?",
  };
}

function handleSendMessage(content: string): void {
  const userMessage: ChatMessage = {
    id: Math.random().toString(36).slice(2),
    role: 'user',
    content,
    timestamp: new Date(),
  };
  store.addMessage(userMessage);
  store.setLoading(true);

  setTimeout(() => {
    const response = getSimulatedResponse(content);
    const assistantMessage: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      artifacts: response.artifacts,
    };
    store.addMessage(assistantMessage);
    store.setLoading(false);
  }, 1200 + Math.random() * 800);
}

function handleFileProcessed(content: string, fileName: string): void {
  const systemMessage: ChatMessage = {
    id: Math.random().toString(36).slice(2),
    role: 'assistant',
    content: `I've processed "${fileName}" successfully. The transcript and logic flags have been generated in the Intake & Analysis panel. I can now generate a PRD or identify questions for the client.`,
    timestamp: new Date(),
    artifacts: [{ type: 'prd', label: 'Generate PRD' }],
  };
  store.addMessage(systemMessage);
}

function handleViewArtifact(type: ArtifactType): void {
  store.setActiveView('workspace');
  if (type === 'prd') store.setCurrentStep(4);
  else store.setCurrentStep(3);
}
</script>
