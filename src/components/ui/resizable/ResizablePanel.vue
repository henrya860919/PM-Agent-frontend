<template>
  <SplitterPanel
    v-bind="$attrs"
    :default-size="defaultSize"
    :min-size="minSize"
    :max-size="maxSize"
    :collapsible="collapsible"
    :collapsed-size="collapsedSize"
    :order="order"
    :id="id"
    class="flex min-w-0 flex-col overflow-hidden"
  >
    <slot />
  </SplitterPanel>
</template>

<script setup lang="ts">
import { SplitterPanel } from 'radix-vue';

interface Props {
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  collapsible?: boolean;
  collapsedSize?: number;
  order?: number;
  id?: string;
}

withDefaults(defineProps<Props>(), {
  defaultSize: undefined,
  minSize: 10,
  maxSize: 100,
  collapsible: false,
  collapsedSize: 0,
  order: undefined,
  id: undefined,
});
</script>
