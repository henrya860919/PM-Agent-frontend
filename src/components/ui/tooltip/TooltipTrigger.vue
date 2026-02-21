<template>
  <div v-if="asChild">
    <slot />
  </div>
  <button v-else v-bind="$attrs">
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    asChild?: boolean;
  }>(),
  {
    asChild: false,
  },
);
</script>
