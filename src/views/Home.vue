<template>
  <div class="home">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold mb-4">PM-Agent Frontend</h1>
      <p class="text-muted-foreground mb-6">Vue3 + TypeScript + Vite + shadcn-vue</p>
      <div class="flex gap-4">
        <Button>Default Button</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
</script>

<style scoped>
.home {
  min-height: 100vh;
}
</style>
