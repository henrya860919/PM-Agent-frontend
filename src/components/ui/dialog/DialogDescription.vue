<template>
  <DialogDescription :class="cn('text-sm text-muted-foreground', className)" v-bind="$attrs">
    <slot />
  </DialogDescription>
</template>

<script setup lang="ts">
import { DialogDescription } from 'radix-vue';
import { cn } from '@/lib/utils';

withDefaults(
  defineProps<{
    className?: string;
  }>(),
  {
    className: '',
  },
);
</script>
