<template>
  <SplitterGroup v-bind="$attrs" :direction="direction" class="flex h-full w-full">
    <slot />
  </SplitterGroup>
</template>

<script setup lang="ts">
import { SplitterGroup } from 'radix-vue';

interface Props {
  direction?: 'horizontal' | 'vertical';
}

withDefaults(defineProps<Props>(), {
  direction: 'horizontal',
});
</script>
