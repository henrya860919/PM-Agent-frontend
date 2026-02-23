<template>
  <header class="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4">
    <div class="flex items-center gap-3">
      <slot name="leading">
        <span class="text-sm font-medium text-foreground">{{ pageTitle }}</span>
      </slot>
    </div>
    <div class="flex items-center gap-2">
      <slot name="trailing" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const pageTitle = computed(() => {
  const title = route.meta.title as string | undefined;
  if (title) return title;
  // fallback from path
  const name = route.name?.toString() ?? route.path;
  if (name === 'workspace') return 'Workspace';
  if (name === 'file-records') return 'File Records';
  if (name === 'feature-list') return 'Feature List';
  if (name === 'detailed-specs') return 'Detailed Specs';
  return 'PM Agent';
});
</script>
