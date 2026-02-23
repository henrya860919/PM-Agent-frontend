<template>
  <TabsRoot v-model="modelValue" v-bind="$attrs">
    <slot />
  </TabsRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TabsRoot } from 'radix-vue';

interface Props {
  modelValue?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
});
const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>();

const modelValue = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v as string | number),
});
</script>
