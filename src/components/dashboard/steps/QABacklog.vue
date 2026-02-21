<template>
  <ScrollArea class="h-full">
    <div class="flex flex-col gap-6 p-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-foreground">Q&A Backlog</h3>
          <p class="text-xs text-muted-foreground">Questions to clarify with stakeholders</p>
        </div>
        <Button variant="outline" size="sm" class="text-xs h-7">
          <Plus class="h-3.5 w-3.5 mr-1.5" />
          Add Question
        </Button>
      </div>
      <div class="flex items-center justify-center h-64 text-muted-foreground">
        <p>Q&A Backlog - Coming soon</p>
      </div>
    </div>
  </ScrollArea>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
</script>
