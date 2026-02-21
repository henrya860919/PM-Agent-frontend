<template>
  <DialogRoot :open="modelValue" @update:open="handleUpdate">
    <slot />
  </DialogRoot>
</template>

<script setup lang="ts">
import { DialogRoot } from 'radix-vue';

interface Props {
  modelValue: boolean;
}

defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const handleUpdate = (value: boolean) => {
  emit('update:modelValue', value);
};
</script>
