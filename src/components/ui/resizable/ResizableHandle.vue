<template>
  <SplitterResizeHandle
    v-bind="$attrs"
    :disabled="disabled"
    :id="id"
    class="relative flex w-px shrink-0 items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none data-[resize-handle-active]:bg-primary/50 [&[data-panel-group-direction=vertical]]:h-px [&[data-panel-group-direction=vertical]]:w-full [&[data-panel-group-direction=vertical]]:after:left-0 [&[data-panel-group-direction=vertical]]:after:h-1 [&[data-panel-group-direction=vertical]]:after:w-full [&[data-panel-group-direction=vertical]]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]]:after:translate-x-0"
  >
    <div
      v-if="withHandle"
      class="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border"
    >
      <GripVertical class="h-2.5 w-2.5 text-muted-foreground" />
    </div>
  </SplitterResizeHandle>
</template>

<script setup lang="ts">
import { SplitterResizeHandle } from 'radix-vue';
import { GripVertical } from 'lucide-vue-next';

interface Props {
  withHandle?: boolean;
  disabled?: boolean;
  id?: string;
}

withDefaults(defineProps<Props>(), {
  withHandle: false,
  disabled: false,
  id: undefined,
});
</script>
