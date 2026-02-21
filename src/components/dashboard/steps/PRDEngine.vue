<template>
  <ScrollArea class="h-full">
    <div class="flex flex-col gap-6 p-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-foreground">PRD Engine</h3>
          <p class="text-xs text-muted-foreground">Product Requirements Document</p>
        </div>
        <Button variant="outline" size="sm" class="text-xs h-7">
          <Download class="h-3.5 w-3.5 mr-1.5" />
          Export
        </Button>
      </div>
      <div class="flex items-center justify-center h-64 text-muted-foreground">
        <p>PRD Engine - Coming soon</p>
      </div>
    </div>
  </ScrollArea>
</template>

<script setup lang="ts">
import { Download } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
</script>
