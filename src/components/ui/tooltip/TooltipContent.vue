<template>
  <div
    :class="cn('z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md', $attrs.class)"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils';

withDefaults(
  defineProps<{
    side?: 'top' | 'bottom' | 'left' | 'right';
    class?: string;
  }>(),
  {
    side: 'top',
  },
);
</script>
